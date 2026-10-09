import { useEffect, useRef } from "react";
import type { Theme } from "../../theme";
import { prefersReducedMotion } from "../../lib/gsap";

/**
 * "Signal from noise" — the hero's particle field (2D canvas).
 *
 * Particles drift through a smooth flow field: the noise. Around the cursor
 * they snap onto a lattice and link into a network: the signal. When the
 * cursor moves on, that structure slowly dissolves back into the flow, leaving
 * a fading trail. A click sends a ring of order sweeping outward. With no
 * pointer (touch, or cursor elsewhere) the lens wanders on its own.
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
const LINK_DIST = GRID * 1.5; // links orthogonal + diagonal lattice neighbours
const DENSITY = 1 / 1250; // particles per px²
const MAX_PARTICLES = 1100;
const RIPPLE_WIDTH = 64;
const RIPPLE_SPEED = 6.5; // px per frame
const DRIFT = 0.12; // gentle left→right current so the field never stalls
const LENS_EDGE = 0.45; // outer fraction of the lens radius that fades to noise
const GATHER = 1.6; // pull toward a resting lens, so its network fills in
const GATHER_ZONE = 2.2; // …from up to this many lens radii away

// Three depth layers: far, mid, near.
const LAYER_WEIGHTS = [0.5, 0.32, 0.18];
const LAYER_SPEED = [0.45, 0.75, 1.15];
const LAYER_ALPHA = [0.45, 0.75, 1];
const LAYER_WIDTH = [0.8, 1, 1.3];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  order: number; // 0 = noise, 1 = locked onto the lattice
  fade: number; // grows from 0 on spawn so new particles ease in
  layer: number;
  speed: number;
  slot: number; // key of the lattice point it holds, or -1
  sx: number; // that lattice point's position
  sy: number;
};

type Ripple = { x: number; y: number; r: number; max: number };

// Lattice points are slots holding at most one particle each.
const slotKey = (i: number, j: number) => (i + 64) * 4096 + (j + 64);

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
    let lockedCount = 0; // particles locked onto the lattice last frame
    const pointer = { cx: 0, cy: 0, x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, active: false };
    // Reading the rect every frame forces layout while Motion animates the
    // copy, so cache it and refresh only when it can actually change.
    let rect = canvas.getBoundingClientRect();
    const measure = () => {
      rect = canvas.getBoundingClientRect();
    };

    const spawn = (): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0,
      vy: 0,
      order: 0,
      fade: 0,
      layer: pickLayer(),
      speed: 0.6 + Math.random() * 0.8,
      slot: -1,
      sx: 0,
      sy: 0,
    });

    const idleTarget = (t: number) => ({
      x: w * (0.66 + 0.2 * Math.sin(t * 0.00021)),
      y: h * (0.5 + 0.26 * Math.sin(t * 0.00029 + 1.3)),
    });

    // ── Simulation ────────────────────────────────────────────
    const step = (dt: number, t: number) => {
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

      const target = pointer.active ? pointer : idleTarget(t);
      const follow = pointer.active ? 0.22 : 0.025;
      lens.x += (target.x - lens.x) * Math.min(1, follow * dt);
      lens.y += (target.y - lens.y) * Math.min(1, follow * dt);
      const targetR = pointer.active ? baseR : baseR * 0.85;
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
      const gather = GATHER * Math.max(0, 1 - lockedCount / Math.max(1, capacity));
      const zone = lens.r * GATHER_ZONE;

      for (const p of particles) {
        // How strongly should this particle be ordered right now?
        let want = 0;
        const dx = p.x - lens.x;
        const dy = p.y - lens.y;
        const d2 = dx * dx + dy * dy;
        let falloff = 0;
        if (d2 < r2) {
          falloff = 1 - Math.sqrt(d2) / lens.r;
          // Fully ordered across the lens's core, with a soft outer edge.
          const k = Math.min(1, falloff / LENS_EDGE);
          want = k * k * (3 - 2 * k);
        }
        for (const rp of ripples) {
          const band = Math.abs(Math.hypot(p.x - rp.x, p.y - rp.y) - rp.r);
          if (band < RIPPLE_WIDTH) {
            const s = (1 - band / RIPPLE_WIDTH) * (1 - rp.r / rp.max);
            if (s > want) want = s;
          }
        }
        // Claim a free lattice point nearby. If they're all taken, keep
        // drifting inward — so the lens fills solid instead of stacking up.
        if (p.slot < 0 && want > 0.3) {
          const ci = Math.round(p.x / GRID);
          const cj = Math.round(p.y / GRID);
          let bestD = Infinity;
          for (let i = ci - 1; i <= ci + 1; i++) {
            for (let j = cj - 1; j <= cj + 1; j++) {
              const key = slotKey(i, j);
              if (slots.has(key)) continue;
              const sd = (i * GRID - p.x) ** 2 + (j * GRID - p.y) ** 2;
              if (sd < bestD) {
                bestD = sd;
                p.slot = key;
                p.sx = i * GRID;
                p.sy = j * GRID;
              }
            }
          }
          if (p.slot >= 0) slots.set(p.slot, p);
        }
        const settle = p.slot >= 0 ? want : 0;

        // Snap in quickly, let go slowly — that lag is the lingering trail.
        p.order += (settle - p.order) * Math.min(1, (settle > p.order ? 0.14 : 0.022) * dt);
        if (p.slot >= 0 && p.order < 0.08 && want < 0.3) release(p);

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
          const sx = (p.sx - p.x) * 0.2;
          const sy = (p.sy - p.y) * 0.2;
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
    };

    // ── Rendering ─────────────────────────────────────────────
    const HUE_BANDS = 6;
    const LEVELS = 4;
    const linkBuckets: number[][] = [[], [], [], [], []];
    const latticeBuckets: number[][] = [[], [], [], []];
    const dotBuckets: number[][] = Array.from({ length: HUE_BANDS * LEVELS }, () => []);

    const draw = () => {
      const pal = PALETTES[themeRef.current];
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";

      // Noise: short dashes along each particle's heading, batched per layer.
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        for (const p of particles) {
          if (p.layer !== layer) continue;
          const vis = (1 - p.order) * p.fade;
          if (vis < 0.05) continue;
          const v = Math.hypot(p.vx, p.vy) || 1;
          const len = (2.5 + 4.5 * p.speed) * vis * (0.7 + layer * 0.25);
          ctx.moveTo(p.x - (p.vx / v) * len, p.y - (p.vy / v) * len);
          ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = rgba(pal.dust, pal.dustAlpha * LAYER_ALPHA[layer]);
        ctx.lineWidth = LAYER_WIDTH[layer];
        ctx.stroke();
      }

      // Signal: ordered particles, their links, and ripple rings.
      const lit: Particle[] = [];
      lockedCount = 0;
      for (const p of particles) {
        if (p.order > 0.04) lit.push(p);
        if (p.order > 0.5) lockedCount++;
      }

      if (pal.additive) ctx.globalCompositeOperation = "lighter";

      // The lattice itself, faintly revealed inside the lens.
      if (lens.r > 1) {
        for (const b of latticeBuckets) b.length = 0;
        const x0 = Math.ceil((lens.x - lens.r) / GRID) * GRID;
        const y0 = Math.ceil((lens.y - lens.r) / GRID) * GRID;
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
          ctx.fillStyle = rgba(pal.link, 0.3 * ((bucket + 0.5) / 4));
          ctx.fill();
        });
      }

      for (const b of linkBuckets) b.length = 0;
      for (let i = 0; i < lit.length; i++) {
        const a = lit[i];
        if (a.order < 0.3) continue;
        for (let j = i + 1; j < lit.length; j++) {
          const b = lit[j];
          if (b.order < 0.3) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          if (dx > LINK_DIST || dx < -LINK_DIST || dy > LINK_DIST || dy < -LINK_DIST) continue;
          const d = Math.hypot(dx, dy);
          if (d > LINK_DIST || d < 2) continue;
          const strength = Math.min(a.order, b.order) * (1 - d / LINK_DIST);
          const bucket = Math.min(4, Math.floor(strength * 5));
          linkBuckets[bucket].push(a.x, a.y, b.x, b.y);
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
        ctx.strokeStyle = rgba(pal.link, ((bucket + 0.5) / 5) * 0.6);
        ctx.stroke();
      });

      // Hue shifts across the screen (cyan → violet); batch by hue × brightness.
      for (const b of dotBuckets) b.length = 0;
      for (const p of lit) {
        const hue = Math.min(HUE_BANDS - 1, Math.max(0, Math.floor((p.x / w) * HUE_BANDS)));
        const level = Math.min(LEVELS - 1, Math.floor(p.order * LEVELS));
        dotBuckets[hue * LEVELS + level].push(p.x, p.y, 0.7 + p.order * (1.2 + p.layer * 0.45));
      }
      dotBuckets.forEach((dots, i) => {
        if (!dots.length) return;
        const hue = Math.floor(i / LEVELS);
        const level = i % LEVELS;
        ctx.beginPath();
        for (let k = 0; k < dots.length; k += 3) {
          ctx.moveTo(dots[k] + dots[k + 2], dots[k + 1]);
          ctx.arc(dots[k], dots[k + 1], dots[k + 2], 0, Math.PI * 2);
        }
        ctx.fillStyle = rgba(mix(pal.signal, (hue + 0.5) / HUE_BANDS), Math.min(1, ((level + 1) / LEVELS) * 1.05));
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 1;
      for (const rp of ripples) {
        ctx.strokeStyle = rgba(pal.link, 0.16 * (1 - rp.r / rp.max));
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    // Reduced motion: settle the simulation off-screen, then paint one frame.
    const renderStatic = () => {
      const t = 4000;
      const spot = idleTarget(t);
      lens.x = spot.x;
      lens.y = spot.y;
      lens.r = baseR;
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

      measure();
      if (reduced) renderStatic();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    if (reduced) {
      return () => {
        ro.disconnect();
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
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onRelease, { passive: true });
    window.addEventListener("pointercancel", onRelease, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });

    // Opening beat: one wave of order rolls out from behind the headline.
    const intro = window.setTimeout(() => {
      ripples.push({ x: w * 0.28, y: h * 0.55, r: 0, max: Math.hypot(w, h) * 0.9 });
    }, 650);

    // ── Loop (paused off-screen or in a hidden tab) ───────────
    let raf = 0;
    let running = false;
    let onscreen = true;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(3, (now - last) / 16.667);
      last = now;
      step(dt, now);
      draw();
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      const should = onscreen && document.visibilityState === "visible";
      if (should && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      onscreen = entry.isIntersecting;
      sync();
    });
    io.observe(mount);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(intro);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("scroll", measure);
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
