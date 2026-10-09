import { useEffect, useRef } from "react";
import type { Theme } from "../../theme";
import { prefersReducedMotion } from "../../lib/motion";

/**
 * "Signal from noise": the site's persistent particle field, a 2D canvas fixed
 * behind every page.
 *
 * Particles drift through a flow field (the noise). Around the cursor they
 * snap onto a lattice and link into a network (the signal), then dissolve
 * back, leaving a trail. A click sends a ring of order outward. With no
 * pointer the lens wanders on its own.
 *
 * The field also carries the page's narrative. Scrolling moves you through it
 * (three parallax depths, streaks at speed, a lattice plane drifting slowly
 * behind), and each section sets a mood with `fieldMood()`: how present the
 * field is, and how much of it has crystallised onto the lattice. Read top to
 * bottom, the résumé turns noise into signal.
 */

type RGB = readonly [number, number, number];

const PALETTES: Record<
  Theme,
  { dust: RGB; dustAlpha: number; signal: readonly RGB[]; link: RGB; additive: boolean }
> = {
  dark: {
    dust: [196, 202, 222],
    dustAlpha: 0.4,
    signal: [
      [34, 211, 238],
      [91, 140, 255],
      [167, 139, 250],
    ],
    link: [120, 150, 255],
    additive: true,
  },
  light: {
    dust: [38, 38, 46],
    dustAlpha: 0.3,
    signal: [
      [8, 145, 178],
      [59, 91, 219],
      [124, 58, 237],
    ],
    link: [59, 91, 219],
    additive: false,
  },
};

const GRID = 28; // lattice spacing, px
const LINK_DIST = GRID * 1.5; // ignore links stretched by particles still settling
const DENSITY = 1 / 1250; // particles per px²
const MAX_PARTICLES = 1100;
const RIPPLE_WIDTH = 64;
const RIPPLE_SPEED = 6.5; // px per frame
const DRIFT = 0.12; // gentle left→right current so the field never stalls
const LENS_EDGE = 0.45; // outer fraction of the lens radius that fades to noise
const GATHER = 1.6; // pull toward a resting lens, so its network fills in
const GATHER_ZONE = 2.2; // …from up to this many lens radii away
const AMBIENT_DIM = 0.4; // crystallised-by-scroll structure glows at this fraction
const GRID_PARALLAX = 0.12; // the lattice plane scrolls at this fraction of the page
const STREAK = 1.4; // how far scroll speed stretches the dashes
const TELEPORT = 300; // px; larger scroll jumps (anchors, route changes) reset structure

// Three depth layers: far, mid, near.
const LAYER_WEIGHTS = [0.5, 0.32, 0.18];
const LAYER_SPEED = [0.45, 0.75, 1.15];
const LAYER_ALPHA = [0.45, 0.75, 1];
const LAYER_WIDTH = [0.8, 1, 1.3];
const LAYER_PARALLAX = [0.06, 0.14, 0.26];

// Lattice neighbours to link to (each pair visited once): right, down, diagonals.
const NEIGHBOURS = [
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 0.35],
  [1, -1, 0.35],
] as const;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  order: number; // 0 = noise, 1 = locked onto the lattice
  focus: number; // how much of that order comes from the cursor/clicks (brighter)
  fade: number; // grows from 0 on spawn so new particles ease in
  layer: number;
  speed: number;
  seed: number; // when ambient order passes this, the particle crystallises
  slot: number; // key of the lattice point it holds, or -1
  si: number; // that lattice point's column / row
  sj: number;
};

type Ripple = { x: number; y: number; r: number; max: number };
type Zone = { top: number; intensity: number; order: number };

/** Spread onto a section to set the field's mood while it's in view. */
export function fieldMood(intensity: number, order: number) {
  return { "data-field-intensity": intensity, "data-field-order": order };
}

const DEFAULT_MOOD = { intensity: 0.5, order: 0.2 };

// Lattice points are slots holding at most one particle each.
const slotKey = (i: number, j: number) => (i + 64) * 65536 + (j + 1024);

const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

function mix(stops: readonly RGB[], t: number): RGB {
  const s = Math.min(0.999, Math.max(0, t)) * (stops.length - 1);
  const i = Math.floor(s);
  const f = s - i;
  const a = stops[i];
  const b = stops[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

// Smooth, slowly evolving angle field — cheap pseudo-noise from layered waves.
function flowAngle(x: number, y: number, t: number) {
  return (
    (Math.sin(x * 0.0019 + t * 0.00011) +
      Math.cos(y * 0.0024 - t * 0.00009) +
      Math.sin((x - y) * 0.0011 + t * 0.00006)) *
    1.1
  );
}

function pickLayer() {
  const r = Math.random();
  return r < LAYER_WEIGHTS[0] ? 0 : r < LAYER_WEIGHTS[0] + LAYER_WEIGHTS[1] ? 1 : 2;
}

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

export function SignalField({
  className = "",
  theme = "dark",
}: {
  className?: string;
  theme?: Theme;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(theme);
  const redrawRef = useRef<() => void>(() => {});

  // Theme switches recolour the live field without restarting it.
  useEffect(() => {
    themeRef.current = theme;
    redrawRef.current();
  }, [theme]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const canvas = document.createElement("canvas");
    canvas.style.display = "block";
    mount.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      return;
    }

    const reduced = prefersReducedMotion;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let baseR = 180;
    const particles: Particle[] = [];
    const ripples: Ripple[] = [];
    const slots = new Map<number, Particle>();
    const release = (p: Particle) => {
      if (p.slot >= 0) slots.delete(p.slot);
      p.slot = -1;
    };
    const lens = { x: 0, y: 0, r: 0 };
    let lensLocked = 0; // particles locked inside the lens last frame
    const pointer = { cx: 0, cy: 0, x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, active: false };
    let rect = canvas.getBoundingClientRect();

    // Scroll state: how far we've travelled, and how fast.
    let lastScroll = window.scrollY;
    let scrollVel = 0;
    let latticeY = -lastScroll * GRID_PARALLAX;

    // ── Section moods ─────────────────────────────────────────
    // Cached page positions of every [data-field-*] section, so resolving the
    // mood each frame needs no layout reads.
    let zones: Zone[] = [];
    const measureZones = () => {
      const els = document.querySelectorAll<HTMLElement>("[data-field-intensity]");
      zones = Array.from(els, (el) => ({
        top: el.getBoundingClientRect().top + window.scrollY,
        intensity: Number(el.dataset.fieldIntensity),
        order: Number(el.dataset.fieldOrder),
      })).sort((a, b) => a.top - b.top);
    };
    // Blend each section into the next across a band around their boundary,
    // so the mood is a smooth function of scroll position.
    const moodAt = (scrollY: number) => {
      if (!zones.length) return { ...DEFAULT_MOOD };
      const probe = scrollY + h * 0.5;
      const band = h * 0.4;
      let intensity = zones[0].intensity;
      let order = zones[0].order;
      for (let k = 1; k < zones.length; k++) {
        const t = (probe - (zones[k].top - band)) / (2 * band);
        if (t <= 0) break;
        const s = smooth(t);
        intensity += (zones[k].intensity - zones[k - 1].intensity) * s;
        order += (zones[k].order - zones[k - 1].order) * s;
      }
      return { intensity, order };
    };
    const mood = { ...DEFAULT_MOOD };

    const spawn = (): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0,
      vy: 0,
      order: 0,
      focus: 0,
      fade: 0,
      layer: pickLayer(),
      speed: 0.6 + Math.random() * 0.8,
      seed: Math.random(),
      slot: -1,
      si: 0,
      sj: 0,
    });

    const idleTarget = (t: number) => ({
      x: w * (0.66 + 0.2 * Math.sin(t * 0.00021)),
      y: h * (0.5 + 0.26 * Math.sin(t * 0.00029 + 1.3)),
    });

    // ── Simulation ────────────────────────────────────────────
    const step = (dt: number, t: number) => {
      // Travel: content scrolls at 1×, the lattice at GRID_PARALLAX, and loose
      // particles at their layer's depth.
      const scrollY = window.scrollY;
      let delta = scrollY - lastScroll;
      lastScroll = scrollY;
      const teleport = Math.abs(delta) > TELEPORT;
      if (teleport) {
        delta = 0;
        for (const p of particles) release(p);
      }
      scrollVel += (delta / dt - scrollVel) * Math.min(1, 0.25 * dt);
      const nextLatticeY = -scrollY * GRID_PARALLAX;
      const latticeShift = teleport ? 0 : nextLatticeY - latticeY;
      latticeY = nextLatticeY;

      const target = moodAt(scrollY);
      const ease = Math.min(1, 0.08 * dt);
      mood.intensity += (target.intensity - mood.intensity) * ease;
      mood.order += (target.order - mood.order) * ease;

      // Move the lens: follow the pointer, or wander when there isn't one.
      if (pointer.active) {
        pointer.x = pointer.cx - rect.left;
        pointer.y = pointer.cy - rect.top;
        const inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= w && pointer.y <= h;
        if (!inside) pointer.active = false;
      }
      // Smoothed pointer velocity drives the wake.
      pointer.vx += (pointer.x - pointer.px - pointer.vx) * 0.3;
      pointer.vy += (pointer.y - pointer.py - pointer.vy) * 0.3;
      pointer.px = pointer.x;
      pointer.py = pointer.y;

      const lensTarget = pointer.active ? pointer : idleTarget(t);
      const follow = pointer.active ? 0.22 : 0.025;
      lens.x += (lensTarget.x - lens.x) * Math.min(1, follow * dt);
      lens.y += (lensTarget.y - lens.y) * Math.min(1, follow * dt);
      // Behind dense content the lens shrinks a little, so it stays out of the copy's way.
      const targetR = baseR * (pointer.active ? 1 : 0.85) * (0.7 + 0.3 * mood.intensity);
      lens.r += (targetR - lens.r) * Math.min(1, 0.05 * dt);

      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].r += RIPPLE_SPEED * dt;
        if (ripples[i].r > ripples[i].max) ripples.splice(i, 1);
      }

      const r2 = lens.r * lens.r;
      const inertia = Math.min(1, 0.16 * dt);
      // Gather harder while the lens is sparse; stop once its core is full.
      const core = lens.r * 0.8;
      const capacity = ((Math.PI * core * core) / (GRID * GRID)) * 0.9;
      const gather = GATHER * Math.max(0, 1 - lensLocked / Math.max(1, capacity));
      const zone = lens.r * GATHER_ZONE;
      let locked = 0;

      for (const p of particles) {
        if (p.slot >= 0) p.y += latticeShift;
        else p.y -= delta * LAYER_PARALLAX[p.layer];

        // How strongly should this particle be ordered right now? The cursor
        // and clicks give "focused" order; scroll gives calmer ambient order.
        let focused = 0;
        const dx = p.x - lens.x;
        const dy = p.y - lens.y;
        const d2 = dx * dx + dy * dy;
        let falloff = 0;
        if (d2 < r2) {
          falloff = 1 - Math.sqrt(d2) / lens.r;
          focused = smooth(falloff / LENS_EDGE); // full in the core, soft edge
        }
        for (const rp of ripples) {
          const band = Math.abs(Math.hypot(p.x - rp.x, p.y - rp.y) - rp.r);
          if (band < RIPPLE_WIDTH) {
            const s = (1 - band / RIPPLE_WIDTH) * (1 - rp.r / rp.max);
            if (s > focused) focused = s;
          }
        }
        const ambient = Math.min(1, Math.max(0, (mood.order * 1.15 - p.seed) / 0.15));
        const want = Math.max(focused, ambient);

        // Claim a free lattice point nearby. If they're all taken, keep
        // drifting — so the lattice fills solid instead of stacking up.
        if (p.slot < 0 && want > 0.3) {
          const ci = Math.round(p.x / GRID);
          const cj = Math.round((p.y - latticeY) / GRID);
          let bestD = Infinity;
          for (let i = ci - 1; i <= ci + 1; i++) {
            for (let j = cj - 1; j <= cj + 1; j++) {
              const key = slotKey(i, j);
              if (slots.has(key)) continue;
              const sd = (i * GRID - p.x) ** 2 + (j * GRID + latticeY - p.y) ** 2;
              if (sd < bestD) {
                bestD = sd;
                p.slot = key;
                p.si = i;
                p.sj = j;
              }
            }
          }
          if (p.slot >= 0) slots.set(p.slot, p);
        }
        const settle = p.slot >= 0 ? want : 0;

        // Snap in quickly, let go slowly — that lag is the lingering trail.
        const rate = (to: number, from: number) => Math.min(1, (to > from ? 0.14 : 0.022) * dt);
        p.order += (settle - p.order) * rate(settle, p.order);
        const glow = p.slot >= 0 ? focused : 0;
        p.focus += (glow - p.focus) * rate(glow, p.focus);
        if (p.slot >= 0 && p.order < 0.08 && want < 0.3) release(p);
        if (d2 < r2 && p.order > 0.5) locked++;

        // Desired velocity: flow field, blended toward a spring onto the lattice.
        const a = flowAngle(p.x, p.y, t);
        const sp = LAYER_SPEED[p.layer] * p.speed;
        let ux = Math.cos(a) * sp + DRIFT;
        let uy = Math.sin(a) * sp;
        if (p.slot < 0 && gather > 0 && d2 < zone * zone && d2 > 1) {
          const d = Math.sqrt(d2);
          const pull = gather * (1 - d / zone);
          ux -= (dx / d) * pull;
          uy -= (dy / d) * pull;
        }
        if (p.slot >= 0) {
          const sx = (p.si * GRID - p.x) * 0.2;
          const sy = (p.sj * GRID + latticeY - p.y) * 0.2;
          ux += (sx - ux) * p.order;
          uy += (sy - uy) * p.order;
        }
        p.vx += (ux - p.vx) * inertia;
        p.vy += (uy - p.vy) * inertia;

        // Cursor wake: loose particles get swept along by fast movements.
        if (falloff > 0 && pointer.active) {
          const k = 0.04 * falloff * (1 - p.order);
          p.vx += pointer.vx * k;
          p.vy += pointer.vy * k;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.fade < 1) p.fade = Math.min(1, p.fade + 0.012 * dt);

        // Wrap around the edges.
        if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          release(p);
          if (p.x < -20) p.x += w + 40;
          else if (p.x > w + 20) p.x -= w + 40;
          if (p.y < -20) p.y += h + 40;
          else if (p.y > h + 20) p.y -= h + 40;
        }

        // Occasionally recycle loose particles so the flow never clumps.
        if (p.slot < 0 && p.order < 0.02 && Math.random() < 0.0015 * dt) {
          Object.assign(p, spawn());
        }
      }
      lensLocked = locked;
    };

    // ── Rendering ─────────────────────────────────────────────
    const HUE_BANDS = 6;
    const LEVELS = 4;
    const linkBuckets: number[][] = [[], [], [], [], []];
    const latticeBuckets: number[][] = [[], [], [], []];
    const dotBuckets: number[][] = Array.from({ length: HUE_BANDS * LEVELS }, () => []);
    // Cursor-focused order glows brighter than ambient order — but only as
    // bright as the section allows, so the lens never shouts over body copy.
    let focusGain = 1;
    const brightness = (p: Particle) =>
      p.order * (AMBIENT_DIM + (1 - AMBIENT_DIM) * p.focus * focusGain);

    const draw = () => {
      const pal = PALETTES[themeRef.current];
      const presence = mood.intensity;
      focusGain = Math.min(1, presence * 1.25);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";

      // Noise: short dashes along each particle's apparent heading (its own
      // motion plus scroll travel), batched per depth layer.
      for (let layer = 0; layer < 3; layer++) {
        const travel = scrollVel * LAYER_PARALLAX[layer] * STREAK;
        ctx.beginPath();
        for (const p of particles) {
          if (p.layer !== layer) continue;
          const vis = (1 - p.order) * p.fade;
          if (vis < 0.05) continue;
          const ax = p.vx;
          const ay = p.vy - travel;
          const v = Math.hypot(ax, ay) || 1;
          const len =
            Math.min(48, (2.5 + 4.5 * p.speed) * (0.7 + layer * 0.25) + Math.abs(travel) * 2) * vis;
          ctx.moveTo(p.x - (ax / v) * len, p.y - (ay / v) * len);
          ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = rgba(pal.dust, pal.dustAlpha * LAYER_ALPHA[layer] * presence);
        ctx.lineWidth = LAYER_WIDTH[layer];
        ctx.stroke();
      }

      // Signal: ordered particles, their links, and ripple rings.
      if (pal.additive) ctx.globalCompositeOperation = "lighter";

      // The lattice itself, faintly revealed inside the lens.
      if (lens.r > 1) {
        for (const b of latticeBuckets) b.length = 0;
        const x0 = Math.ceil((lens.x - lens.r) / GRID) * GRID;
        const y0 = Math.ceil((lens.y - lens.r - latticeY) / GRID) * GRID + latticeY;
        for (let gx = x0; gx <= lens.x + lens.r; gx += GRID) {
          for (let gy = y0; gy <= lens.y + lens.r; gy += GRID) {
            const f = 1 - Math.hypot(gx - lens.x, gy - lens.y) / lens.r;
            if (f > 0) latticeBuckets[Math.min(3, Math.floor(f * f * 4))].push(gx, gy);
          }
        }
        latticeBuckets.forEach((pts, bucket) => {
          if (!pts.length) return;
          const size = 0.6 + (bucket / 3) * 0.8;
          ctx.beginPath();
          for (let k = 0; k < pts.length; k += 2) {
            ctx.rect(pts[k] - size / 2, pts[k + 1] - size / 2, size, size);
          }
          ctx.fillStyle = rgba(pal.link, 0.3 * ((bucket + 0.5) / 4) * presence);
          ctx.fill();
        });
      }

      // Links between neighbouring lattice slots — O(n), no pairwise search.
      for (const b of linkBuckets) b.length = 0;
      for (const p of particles) {
        if (p.slot < 0 || p.order < 0.3) continue;
        const bp = brightness(p);
        for (const [di, dj, weight] of NEIGHBOURS) {
          const q = slots.get(slotKey(p.si + di, p.sj + dj));
          if (!q || q.order < 0.3) continue;
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d > LINK_DIST || d < 2) continue;
          const strength = Math.min(bp, brightness(q)) * weight;
          linkBuckets[Math.min(4, Math.floor(strength * 5))].push(p.x, p.y, q.x, q.y);
        }
      }
      ctx.lineWidth = 0.8;
      linkBuckets.forEach((seg, bucket) => {
        if (!seg.length) return;
        ctx.beginPath();
        for (let k = 0; k < seg.length; k += 4) {
          ctx.moveTo(seg[k], seg[k + 1]);
          ctx.lineTo(seg[k + 2], seg[k + 3]);
        }
        ctx.strokeStyle = rgba(pal.link, ((bucket + 0.5) / 5) * 0.33 * presence);
        ctx.stroke();
      });

      // Dots: hue shifts across the screen (cyan → violet); batch by hue × brightness.
      for (const b of dotBuckets) b.length = 0;
      for (const p of particles) {
        if (p.order <= 0.04) continue;
        const b = brightness(p);
        const hue = Math.min(HUE_BANDS - 1, Math.max(0, Math.floor((p.x / w) * HUE_BANDS)));
        const level = Math.min(LEVELS - 1, Math.floor(b * LEVELS));
        dotBuckets[hue * LEVELS + level].push(p.x, p.y, 0.7 + b * (1.2 + p.layer * 0.45));
      }
      const dotPresence = 0.25 + 0.75 * presence;
      dotBuckets.forEach((dots, i) => {
        if (!dots.length) return;
        const hue = Math.floor(i / LEVELS);
        const level = i % LEVELS;
        ctx.beginPath();
        for (let k = 0; k < dots.length; k += 3) {
          ctx.moveTo(dots[k] + dots[k + 2], dots[k + 1]);
          ctx.arc(dots[k], dots[k + 1], dots[k + 2], 0, Math.PI * 2);
        }
        const alpha = Math.min(1, ((level + 1) / LEVELS) * 1.05) * dotPresence;
        ctx.fillStyle = rgba(mix(pal.signal, (hue + 0.5) / HUE_BANDS), alpha);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 1;
      for (const rp of ripples) {
        ctx.strokeStyle = rgba(pal.link, 0.16 * (1 - rp.r / rp.max) * presence);
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    // Reduced motion: settle the simulation off-screen, then paint one frame.
    const renderStatic = () => {
      Object.assign(mood, moodAt(window.scrollY));
      const t = 4000;
      const spot = idleTarget(t);
      lens.x = spot.x;
      lens.y = spot.y;
      lens.r = baseR;
      lastScroll = window.scrollY;
      for (const p of particles) p.fade = 1;
      for (let i = 0; i < 140; i++) step(1, t);
      draw();
    };
    redrawRef.current = () => {
      if (reduced) draw();
    };

    // ── Sizing ────────────────────────────────────────────────
    const resize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      if (!nw || !nh) return;
      if (w && h) {
        slots.clear();
        for (const p of particles) {
          p.x *= nw / w;
          p.y *= nh / h;
          p.slot = -1;
        }
      } else {
        const spot = idleTarget(performance.now());
        lens.x = spot.x;
        lens.y = spot.y;
      }
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      baseR = Math.max(120, Math.min(210, Math.min(w, h) * 0.26));

      const count = Math.min(MAX_PARTICLES, Math.round(w * h * DENSITY));
      while (particles.length < count) particles.push(spawn());
      for (let i = count; i < particles.length; i++) release(particles[i]);
      particles.length = count;

      rect = canvas.getBoundingClientRect();
      measureZones();
      if (reduced) renderStatic();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // Sections move when the page's content changes (route changes, images,
    // fonts), so re-measure them then — coalesced to one read per frame.
    let measurePending = 0;
    const scheduleMeasure = () => {
      if (measurePending) return;
      measurePending = requestAnimationFrame(() => {
        measurePending = 0;
        measureZones();
      });
    };
    const pageRo = new ResizeObserver(scheduleMeasure);
    pageRo.observe(document.body);
    const pageMo = new MutationObserver(scheduleMeasure);
    pageMo.observe(document.body, { childList: true, subtree: true });

    if (reduced) {
      // No animation, but keep the field's presence matched to the section.
      let settle = 0;
      const onScroll = () => {
        window.clearTimeout(settle);
        settle = window.setTimeout(() => {
          Object.assign(mood, moodAt(window.scrollY));
          draw();
        }, 120);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.clearTimeout(settle);
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(measurePending);
        ro.disconnect();
        pageRo.disconnect();
        pageMo.disconnect();
        canvas.remove();
      };
    }

    // ── Input ─────────────────────────────────────────────────
    const onMove = (e: PointerEvent) => {
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= w && y <= h;
      if (inside && !pointer.active) {
        // Re-entering: start the velocity estimate from here, not from afar.
        pointer.x = pointer.px = x;
        pointer.y = pointer.py = y;
      }
      pointer.active = inside;
    };
    const onDown = (e: PointerEvent) => {
      onMove(e); // a tap has no preceding move — place the lens where it lands
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      if (ripples.length >= 4) ripples.shift();
      ripples.push({ x, y, r: 0, max: Math.hypot(w, h) * 0.75 });
    };
    const onRelease = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") pointer.active = false;
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) pointer.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onRelease, { passive: true });
    window.addEventListener("pointercancel", onRelease, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });

    // Opening beat: one wave of order rolls out from behind the headline.
    const intro = window.setTimeout(() => {
      if (window.scrollY < h) {
        ripples.push({ x: w * 0.28, y: h * 0.55, r: 0, max: Math.hypot(w, h) * 0.9 });
      }
    }, 650);

    // ── Loop (paused in a hidden tab) ─────────────────────────
    let raf = 0;
    let running = false;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.max(0.05, Math.min(3, (now - last) / 16.667));
      last = now;
      step(dt, now);
      draw();
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      const visible = document.visibilityState === "visible";
      if (visible && !running) {
        running = true;
        last = performance.now();
        lastScroll = window.scrollY;
        raf = requestAnimationFrame(loop);
      } else if (!visible && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(measurePending);
      window.clearTimeout(intro);
      ro.disconnect();
      pageRo.disconnect();
      pageMo.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      window.removeEventListener("pointerout", onOut);
      canvas.remove();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden />;
}
