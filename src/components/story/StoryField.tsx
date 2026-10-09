import { useEffect, useRef } from "react";
import type { Theme } from "../../theme";
import { prefersReducedMotion } from "../../lib/motion";
import { storyChapter } from "./story";
import { dome, helix, neural, noise, product, word, type Shape } from "./shapes";

/**
 * The story field: one WebGL particle system behind every page. As you scroll,
 * the same particles take each chapter's form apart and build the next one —
 * assembling from the bottom up, swirling in flight, then settling crisp.
 * The cursor parts them and tilts the form; a click sends a ring of light.
 *
 * Sections choose their chapter with `storyScene(n)` (see story.ts). The
 * chapter is a smooth function of scroll, so building is scrubbed by the
 * reader: scroll back and the form deconstructs.
 */

type Scene = {
  x: number; // where the form sits, in viewport units (-1…1)
  y: number;
  scale: number; // size, relative to the viewport's shorter side
  presence: number; // overall brightness; lower behind dense copy
  chaos: number; // turbulence
  spin: number; // rad/s around the vertical axis
  sway: number; // gentle back-and-forth yaw, rad
  yaw: number; // resting orientation, rad
  pitch: number;
  repel: number; // how strongly the cursor parts the particles
  mobile?: Partial<Scene>; // overrides on phones, applied after centring
};

const SCENES: Scene[] = [
  // 01 Noise: fills the hero and swirls; the cursor stirs it.
  { x: 0.32, y: 0, scale: 1.05, presence: 1, chaos: 1, spin: 0.05, sway: 0, yaw: 0, pitch: 0, repel: 1 },
  // 02 Intelligence: a neural network beside the About copy.
  { x: -0.5, y: -0.04, scale: 0.48, presence: 0.9, chaos: 0.02, spin: 0, sway: 0.45, yaw: 0.3, pitch: 0.1, repel: 0.6 },
  // 03 Craft: a geodesic dome rising behind the skill cards.
  { x: 0, y: 0.02, scale: 0.85, presence: 0.9, chaos: 0.02, spin: 0.1, sway: 0, yaw: 0, pitch: 0.24, repel: 0.5 },
  // 04 Journey: a helix climbing beside the education column.
  { x: 0.6, y: 0, scale: 0.78, presence: 0.5, chaos: 0.03, spin: 0.24, sway: 0, yaw: 0, pitch: 0.12, repel: 0.5 },
  // 05 Product: an exploded interface, tilted to show its layers.
  { x: 0.08, y: 0, scale: 0.98, presence: 0.75, chaos: 0.02, spin: 0, sway: 0.35, yaw: -0.5, pitch: 0.3, repel: 0.6 },
  // 06 People: "hello." in the open space beside the contact details.
  { x: 0.56, y: -0.34, scale: 0.42, presence: 1, chaos: 0.02, spin: 0, sway: 0.22, yaw: -0.15, pitch: 0.05, repel: 0.8,
    mobile: { y: 0.62, presence: 0.6 } },
];

/** Phones: centre each form, shrink it a touch, and keep it quieter behind text. */
const forViewport = (s: Scene, narrow: boolean): Scene =>
  narrow
    ? { ...s, x: 0, y: s.y * 0.5, scale: s.scale * 0.85, presence: s.presence * 0.55, ...s.mobile }
    : s;

// The theme changes the ink, not the meaning: in both themes most particles
// are neutral ink, a minority carry the two accents, and pulses are teal.
// Light mode is quieter: fewer, finer, crisper, lower-opacity marks on paper.
type Palette = {
  colors: number[][]; // ink, teal, violet
  highlight: number[]; // pulses and clicks
  additive: boolean;
  alpha: number;
  size: number; // point size multiplier
  crisp: number; // 0 = soft glow, 1 = crisp dot
  density: number; // share of particles drawn
  quietFloor: number; // opacity left behind text blocks
};
const PALETTES: Record<Theme, Palette> = {
  dark: {
    colors: [[0.96, 0.957, 0.94], [0.435, 0.776, 0.722], [0.722, 0.635, 0.871]],
    highlight: [0.435, 0.776, 0.722],
    additive: true,
    alpha: 0.8,
    size: 1,
    crisp: 0,
    density: 1,
    quietFloor: 0.08,
  },
  light: {
    colors: [[0.09, 0.094, 0.086], [0.055, 0.384, 0.345], [0.412, 0.29, 0.569]],
    highlight: [0.055, 0.384, 0.345],
    additive: false,
    alpha: 0.55,
    size: 0.75,
    crisp: 1,
    density: 0.55,
    quietFloor: 0,
  },
};

// Text blocks marked [data-quiet] clear the particles behind them.
const MAX_QUIET = 16;

const VERT = /* glsl */ `
attribute vec4 aFrom;   // xyz + flow (position along the shape's path)
attribute vec4 aTo;
attribute vec4 aRand;

uniform float uTime;
uniform float uMorph;     // 0 = aFrom's form, 1 = aTo's form
uniform float uIntro;     // 0…1 opening burst
uniform float uChaos;
uniform float uPresence;
uniform vec2 uRot;        // yaw, pitch
uniform vec2 uOffset;     // viewport position of the form
uniform vec2 uScale;      // viewport units per shape unit
uniform vec2 uAspect;     // measures distances in a square space
uniform vec3 uPointer;    // x, y, strength
uniform vec4 uPulse;      // x, y, age (s), strength
uniform float uPointSize;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uHighlight;
uniform vec4 uQuiet[16];  // text blocks to keep clear: x0, y0, x1, y1
uniform float uQuietCount;
uniform float uQuietFloor;

varying vec3 vColor;
varying float vAlpha;

// 0 inside any text block, easing to 1 just outside it.
float quietMask(vec2 pos) {
  float m = 1.0;
  for (int i = 0; i < 16; i++) {
    if (float(i) >= uQuietCount) break;
    vec4 r = uQuiet[i];
    vec2 out2 = max(r.xy - pos, pos - r.zw);
    m = min(m, smoothstep(0.0, 0.07, max(out2.x, out2.y)));
  }
  return m;
}

vec3 drift(vec3 p, float t) {
  return vec3(
    sin(p.y * 1.7 + t * 0.6) + sin(p.z * 2.3 - t * 0.4),
    sin(p.z * 1.9 + t * 0.5) + sin(p.x * 2.1 + t * 0.3),
    sin(p.x * 1.5 - t * 0.45) + sin(p.y * 2.7 + t * 0.35)
  ) * 0.5;
}

// A band of light travelling along the shape's path.
float pulseAt(float flow) {
  if (flow < 0.0) return 0.0;
  return 1.0 - smoothstep(0.0, 0.09, fract(flow - uTime * 0.22));
}

void main() {
  // Build order: the incoming form assembles from the bottom up, loosely.
  float height = clamp((aTo.y + 1.2) / 2.4, 0.0, 1.0);
  float delay = height * 0.7 + aRand.x * 0.3;
  float k = clamp((uMorph - delay * 0.6) / 0.4, 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  float flight = sin(3.14159 * k);

  vec3 p = mix(aFrom.xyz, aTo.xyz, k);
  // Swirl in flight; shimmer at rest (much more in chaotic chapters).
  p += drift(p * 1.3 + aRand.xyz * 2.0, uTime) * (uChaos * 0.42 + flight * 0.45 + 0.012);

  // Opening beat: everything bursts out of a single point.
  float intro = clamp((uIntro - aRand.x * 0.35) / 0.65, 0.0, 1.0);
  intro = 1.0 - pow(1.0 - intro, 4.0);
  p *= intro;

  float cy = cos(uRot.x), sy = sin(uRot.x);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  float cp = cos(uRot.y), sp = sin(uRot.y);
  p = vec3(p.x, cp * p.y - sp * p.z, sp * p.y + cp * p.z);

  float depth = 4.0 / (4.0 - p.z); // camera at z = 4
  vec2 pos = p.xy * depth * uScale + uOffset;

  // The cursor parts the particles (and spins them, in chaotic chapters).
  vec2 d = (pos - uPointer.xy) * uAspect;
  float dist = length(d);
  float near = max(0.0, 1.0 - dist / 0.3);
  near *= near;
  vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);
  vec2 push = dir * 0.08 + vec2(-dir.y, dir.x) * 0.07 * uChaos;
  pos += push * near * uPointer.z / uAspect;

  // A click: a ring of light rolling outward.
  float ring = 0.0;
  if (uPulse.w > 0.0) {
    vec2 pd = (pos - uPulse.xy) * uAspect;
    float pr = length(pd);
    ring = exp(-pow((pr - uPulse.z * 1.25) / 0.07, 2.0)) * uPulse.w;
    pos += (pr > 0.0001 ? pd / pr : vec2(0.0)) * ring * 0.03 / uAspect;
  }

  gl_Position = vec4(pos, 0.0, 1.0);

  float pulse = mix(pulseAt(aFrom.w), pulseAt(aTo.w), k) * (1.0 - flight);
  float spark = step(0.985, aRand.y);
  gl_PointSize = uPointSize * depth * (0.6 + aRand.z * 0.9) * (1.0 + pulse * 0.9 + ring * 0.8 + spark * 0.6);

  // Colour roles: mostly neutral ink, then teal, then violet.
  vec3 col = aRand.w < 0.62 ? uColorA : (aRand.w < 0.82 ? uColorB : uColorC);
  vColor = mix(col, uHighlight, clamp(pulse * 0.6 + ring * 0.5 + spark * 0.5, 0.0, 1.0));

  float twinkle = 0.78 + 0.22 * sin(uTime * (1.0 + aRand.x * 2.0) + aRand.y * 6.2831);
  float nearness = clamp((depth - 0.8) * 1.8, 0.0, 1.0);
  vAlpha = uPresence * intro * twinkle * (0.35 + 0.65 * nearness) * (0.75 + pulse * 0.9 + ring + spark * 0.4);
  vAlpha *= mix(uQuietFloor, 1.0, quietMask(pos));
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform float uCrisp;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float glow = pow(1.0 - r * 2.0, 1.6);
  float disc = 1.0 - smoothstep(0.3, 0.5, r);
  gl_FragColor = vec4(vColor, mix(glow, disc, uCrisp) * vAlpha);
}
`;

type Zone = { top: number; scene: number };

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;

export function StoryField({ className = "", theme = "dark" }: { className?: string; theme?: Theme }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(theme);
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    themeRef.current = theme;
    redrawRef.current();
  }, [theme]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    mount.appendChild(canvas);

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      canvas.remove(); // no WebGL: the page simply keeps its plain background
      return;
    }

    // ── Program ───────────────────────────────────────────────
    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
      }
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "program link failed");
    }
    gl.useProgram(program);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const U = {
      time: u("uTime"),
      morph: u("uMorph"),
      intro: u("uIntro"),
      chaos: u("uChaos"),
      presence: u("uPresence"),
      rot: u("uRot"),
      offset: u("uOffset"),
      scale: u("uScale"),
      aspect: u("uAspect"),
      pointer: u("uPointer"),
      pulse: u("uPulse"),
      pointSize: u("uPointSize"),
      colorA: u("uColorA"),
      colorB: u("uColorB"),
      colorC: u("uColorC"),
      highlight: u("uHighlight"),
      quiet: u("uQuiet"),
      quietCount: u("uQuietCount"),
      quietFloor: u("uQuietFloor"),
      crisp: u("uCrisp"),
    };

    // ── Particles ─────────────────────────────────────────────
    // Sized to the device, not the window, so resizing never rebuilds shapes.
    const deviceWidth = Math.min(window.screen.width, window.innerWidth * 2);
    const count = deviceWidth >= 1024 ? 11000 : deviceWidth >= 640 ? 8000 : 5000;
    const shapes: Shape[] = [noise(count), neural(count), dome(count), helix(count), product(count), noise(count)];

    const attribute = (name: string, data: Float32Array, usage: number) => {
      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      const loc = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
      return buffer;
    };
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
    attribute("aRand", rand, gl.STATIC_DRAW);
    const fromBuffer = attribute("aFrom", shapes[0], gl.DYNAMIC_DRAW);
    const toBuffer = attribute("aTo", shapes[0], gl.DYNAMIC_DRAW);

    // Which two chapters are on the GPU right now.
    let pair = [0, 0];
    const showPair = (a: number, b: number, force = false) => {
      if (!force && pair[0] === a && pair[1] === b) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, fromBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, shapes[a], gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, toBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, shapes[b], gl.DYNAMIC_DRAW);
      pair = [a, b];
    };

    // The closing word is drawn from the page's display font once it's loaded.
    let disposed = false;
    const display = '600 330px "Space Grotesk Variable", "Space Grotesk", sans-serif';
    document.fonts
      .load(display)
      .catch(() => undefined)
      .then(() => {
        if (disposed) return;
        shapes[5] = word(count, "hello.", display);
        if (pair.includes(5)) showPair(pair[0], pair[1], true);
        redrawRef.current();
      });

    // ── Chapters from scroll ──────────────────────────────────
    let zones: Zone[] = [];
    let quietBlocks: { left: number; top: number; right: number; bottom: number }[] = [];
    const quietData = new Float32Array(MAX_QUIET * 4);
    let signature = "";
    let fade = 1; // dips to 0 when the page's chapters change (route change)
    const measureZones = () => {
      const els = document.querySelectorAll<HTMLElement>("[data-story-scene]");
      zones = Array.from(els, (el) => ({
        top: el.getBoundingClientRect().top + window.scrollY,
        scene: Number(el.dataset.storyScene),
      })).sort((a, b) => a.top - b.top);
      // Text blocks, in page coordinates, padded a little so copy breathes.
      const pad = 18;
      quietBlocks = Array.from(document.querySelectorAll<HTMLElement>("[data-quiet]"), (el) => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left - pad,
          top: r.top + window.scrollY - pad,
          right: r.right + pad,
          bottom: r.bottom + window.scrollY + pad,
        };
      }).filter((b) => b.right > b.left && b.bottom > b.top);
      const next = zones.map((z) => z.scene).join(",");
      if (signature && next !== signature) {
        fade = 0;
        chapter = targetChapter();
      }
      signature = next;
    };
    // A continuous chapter coordinate: whole numbers are fully built forms,
    // fractions are mid-build. Each boundary blends over a band around it.
    const targetChapter = () => {
      if (zones.length < 2) return 0;
      const probe = window.scrollY + h * 0.5;
      const band = h * 0.45;
      let c = 0;
      for (let k = 1; k < zones.length; k++) {
        const t = (probe - (zones[k].top - band)) / (2 * band);
        if (t <= 0) break;
        c += smooth(t);
      }
      return c;
    };

    // ── State ─────────────────────────────────────────────────
    let w = 0;
    let h = 0;
    let dpr = 1;
    let chapter = 0;
    let lastScroll = window.scrollY;
    let scrollEnergy = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, active: false };
    const pulse = { x: 0, y: 0, age: 99 };
    const start = performance.now();
    let introDone = prefersReducedMotion;

    const resize = () => {
      w = mount.clientWidth;
      h = mount.clientHeight;
      if (!w || !h) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      measureZones();
      redrawRef.current();
    };

    const render = (time: number) => {
      const narrow = w < 768;
      const c = chapter;
      const lo = Math.max(0, Math.min(zones.length - 1, Math.floor(c)));
      const hi = Math.min(zones.length - 1, lo + 1);
      const m = hi === lo ? 0 : c - lo;
      const sceneA = zones[lo]?.scene ?? 0;
      const sceneB = zones[hi]?.scene ?? sceneA;
      showPair(sceneA, sceneB);
      const dominant = m < 0.5 ? sceneA : sceneB;
      if (storyChapter.get() !== dominant) storyChapter.set(dominant);

      const A = forViewport(SCENES[sceneA], narrow);
      const B = forViewport(SCENES[sceneB], narrow);
      const mix = (key: Exclude<keyof Scene, "mobile">) => mixN(A[key], B[key], m);

      // Each chapter has its own absolute orientation; blend along the shortest
      // turn so a transition never spins the form round several times.
      const facing = (sc: Scene) => sc.yaw + sc.spin * time + sc.sway * Math.sin(time * 0.35);
      const fa = facing(A);
      const turn = Math.atan2(Math.sin(facing(B) - fa), Math.cos(facing(B) - fa));
      const yaw = fa + turn * m + pointer.x * 0.35;
      const pitch = mix("pitch") - pointer.y * 0.18;
      const minDim = Math.min(w, h);
      const scale = mix("scale");
      const pal = PALETTES[themeRef.current];

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      if (pal.additive) gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
      else gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.uniform1f(U.time, time);
      gl.uniform1f(U.morph, m);
      gl.uniform1f(U.intro, introDone ? 1 : Math.min(1, (performance.now() - start) / 2600));
      gl.uniform1f(U.chaos, mix("chaos") + scrollEnergy);
      gl.uniform1f(U.presence, mix("presence") * fade * pal.alpha);
      gl.uniform2f(U.rot, yaw, pitch);
      gl.uniform2f(U.offset, mix("x"), mix("y"));
      gl.uniform2f(U.scale, (scale * minDim) / w, (scale * minDim) / h);
      gl.uniform2f(U.aspect, w / minDim, h / minDim);
      gl.uniform3f(U.pointer, pointer.x, pointer.y, pointer.strength * mix("repel"));
      gl.uniform4f(U.pulse, pulse.x, pulse.y, pulse.age, Math.max(0, 1 - pulse.age / 1.8));
      gl.uniform1f(U.pointSize, dpr * (2.2 + minDim / 700) * pal.size);
      gl.uniform3fv(U.colorA, pal.colors[0]);
      gl.uniform3fv(U.colorB, pal.colors[1]);
      gl.uniform3fv(U.colorC, pal.colors[2]);
      gl.uniform3fv(U.highlight, pal.highlight);
      gl.uniform1f(U.crisp, pal.crisp);
      gl.uniform1f(U.quietFloor, pal.quietFloor);

      const scrollY = window.scrollY;
      const visible = quietBlocks
        .filter((b) => b.bottom - scrollY > 0 && b.top - scrollY < h)
        .sort((a, b) => (b.right - b.left) * (b.bottom - b.top) - (a.right - a.left) * (a.bottom - a.top))
        .slice(0, MAX_QUIET);
      visible.forEach((b, i) => {
        quietData[i * 4] = (b.left / w) * 2 - 1;
        quietData[i * 4 + 1] = 1 - ((b.bottom - scrollY) / h) * 2;
        quietData[i * 4 + 2] = (b.right / w) * 2 - 1;
        quietData[i * 4 + 3] = 1 - ((b.top - scrollY) / h) * 2;
      });
      gl.uniform4fv(U.quiet, quietData);
      gl.uniform1f(U.quietCount, visible.length);

      gl.drawArrays(gl.POINTS, 0, Math.round(count * pal.density));
    };

    resize();
    chapter = targetChapter();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // Sections move when content changes (route changes, images, fonts).
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

    const cleanupCommon = () => {
      disposed = true;
      cancelAnimationFrame(measurePending);
      ro.disconnect();
      pageRo.disconnect();
      pageMo.disconnect();
      canvas.remove();
    };

    // ── Reduced motion: still frames of the current chapter ───
    if (prefersReducedMotion) {
      const still = () => {
        chapter = Math.round(targetChapter());
        render(8);
      };
      redrawRef.current = still;
      still();
      let settle = 0;
      const onScroll = () => {
        window.clearTimeout(settle);
        settle = window.setTimeout(still, 150);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.clearTimeout(settle);
        window.removeEventListener("scroll", onScroll);
        cleanupCommon();
      };
    }

    // ── Input ─────────────────────────────────────────────────
    const toView = (e: PointerEvent) => [(e.clientX / w) * 2 - 1, 1 - (e.clientY / h) * 2] as const;
    const onMove = (e: PointerEvent) => {
      [pointer.tx, pointer.ty] = toView(e);
      pointer.active = true;
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      if (e.pointerType === "mouse" && e.button !== 0) return;
      [pulse.x, pulse.y] = toView(e);
      pulse.age = 0;
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

    // ── Loop (paused in hidden tabs) ──────────────────────────
    let raf = 0;
    let running = false;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const frames = dt * 60;

      // Follow the reader's scroll, easing so jumps play as a fast build.
      const target = targetChapter();
      chapter += (target - chapter) * Math.min(1, 0.1 * frames);
      if (Math.abs(target - chapter) < 0.0005) chapter = target;
      fade = Math.min(1, fade + dt * 1.2);
      if (!introDone && now - start > 2600) introDone = true;

      const scroll = window.scrollY;
      scrollEnergy += (Math.min(0.25, Math.abs(scroll - lastScroll) * 0.004) - scrollEnergy) * Math.min(1, 0.1 * frames);
      lastScroll = scroll;

      const follow = Math.min(1, 0.12 * frames);
      pointer.x += (pointer.tx - pointer.x) * follow;
      pointer.y += (pointer.ty - pointer.y) * follow;
      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * Math.min(1, 0.06 * frames);
      pulse.age += dt;

      render((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      const visible = document.visibilityState === "visible";
      if (visible && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!visible && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    redrawRef.current = () => undefined; // the loop repaints every frame
    document.addEventListener("visibilitychange", sync);
    sync();

    // If the GPU drops the context (driver reset, too many tabs), stop quietly.
    const onLost = (e: Event) => {
      e.preventDefault();
      document.removeEventListener("visibilitychange", sync);
      running = false;
      cancelAnimationFrame(raf);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      window.removeEventListener("pointerout", onOut);
      cleanupCommon();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden />;
}
