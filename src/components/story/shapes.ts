// Procedural target shapes for the story field. Each fills N points as
// [x, y, z, flow] in a unit space of roughly -1.3…1.3. `flow` is the point's
// position along the shape's "path" (0…1), which the shader turns into
// travelling pulses of light; -1 means the point never pulses.

export type Shape = Float32Array;

type Vec3 = [number, number, number];

/** Deterministic random (mulberry32), so shapes look the same every load. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** Writes points into a shape buffer; `jitter` blurs each point slightly. */
function writer(n: number, rand: () => number) {
  const out = new Float32Array(n * 4);
  let i = 0;
  const put = (p: Vec3, flow = -1, jitter = 0) => {
    if (i >= n) return;
    out[i * 4] = p[0] + (rand() - 0.5) * jitter;
    out[i * 4 + 1] = p[1] + (rand() - 0.5) * jitter;
    out[i * 4 + 2] = p[2] + (rand() - 0.5) * jitter;
    out[i * 4 + 3] = flow;
    i++;
  };
  const fill = (fn: () => void) => {
    while (i < n) fn();
  };
  return { out, put, fill, count: () => i };
}

/** A soft ball of points: used for nodes and milestones. */
function ballPoint(c: Vec3, r: number, rand: () => number): Vec3 {
  const u = rand() * 2 - 1;
  const a = rand() * Math.PI * 2;
  const k = Math.cbrt(rand()) * r;
  const s = Math.sqrt(1 - u * u);
  return [c[0] + s * Math.cos(a) * k, c[1] + u * k, c[2] + s * Math.sin(a) * k];
}

// ── 01 Noise: the raw complexity of AI ─────────────────────────────
export function noise(n: number): Shape {
  const rand = seeded(11);
  const w = writer(n, rand);
  // A nebula: a few overlapping, uneven clusters around a dense core.
  const blobs: Vec3[] = Array.from({ length: 7 }, () => [
    (rand() - 0.5) * 1.7,
    (rand() - 0.5) * 0.9,
    (rand() - 0.5) * 1.0,
  ]);
  w.fill(() => {
    const c = blobs[Math.floor(rand() * blobs.length)];
    const g = () => (rand() + rand() + rand() - 1.5) * 0.5;
    w.put([c[0] + g() * 1.1, c[1] + g() * 0.8, c[2] + g() * 0.9], -1);
  });
  return w.out;
}

// ── 02 Intelligence: a 3D neural network ──────────────────────────
export function neural(n: number): Shape {
  const rand = seeded(23);
  const w = writer(n, rand);
  // Laid out like the diagram everyone recognises: columns of nodes with
  // fanning connections, given a little depth so it reads in 3D as it sways.
  const sizes = [4, 6, 6, 3];
  const layers: Vec3[][] = sizes.map((count, l) => {
    const x = -1.2 + (2.4 * l) / (sizes.length - 1);
    return Array.from({ length: count }, (_, k) => {
      const y = (k - (count - 1) / 2) * 0.34;
      return [x, y, Math.sin(k * 1.7 + l) * 0.18] as Vec3;
    });
  });
  const edges: [Vec3, Vec3, number][] = [];
  layers.slice(0, -1).forEach((layer, l) =>
    layer.forEach((a) => layers[l + 1].forEach((b) => edges.push([a, b, l])))
  );
  const nodes = layers.flatMap((layer, l) => layer.map((p) => [p, l] as const));
  const last = sizes.length - 1;

  // ~28% of points make the nodes, the rest trace the connections.
  const nodeCount = Math.floor(n * 0.28);
  for (let k = 0; k < nodeCount; k++) {
    const [p, l] = nodes[k % nodes.length];
    w.put(ballPoint(p, 0.06, rand), l / last);
  }
  w.fill(() => {
    const [a, b, l] = edges[Math.floor(rand() * edges.length)];
    const t = rand();
    w.put(lerp3(a, b, t), (l + t) / last, 0.004);
  });
  return w.out;
}

// ── 03 Craft: a geodesic dome, built ring by ring ─────────────────
function icosphere(subdivisions: number) {
  const t = (1 + Math.sqrt(5)) / 2;
  let verts: Vec3[] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  let faces: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const norm = (v: Vec3): Vec3 => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  verts = verts.map(norm);
  for (let s = 0; s < subdivisions; s++) {
    const cache = new Map<string, number>();
    const mid = (a: number, b: number) => {
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      const hit = cache.get(key);
      if (hit !== undefined) return hit;
      verts.push(norm(lerp3(verts[a], verts[b], 0.5)));
      cache.set(key, verts.length - 1);
      return verts.length - 1;
    };
    faces = faces.flatMap(([a, b, c]) => {
      const ab = mid(a, b);
      const bc = mid(b, c);
      const ca = mid(c, a);
      return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]] as [number, number, number][];
    });
  }
  const edges = new Set<string>();
  for (const [a, b, c] of faces) {
    for (const [x, y] of [[a, b], [b, c], [c, a]]) edges.add(x < y ? `${x}_${y}` : `${y}_${x}`);
  }
  return { verts, edges: [...edges].map((e) => e.split("_").map(Number) as [number, number]) };
}

export function dome(n: number): Shape {
  const rand = seeded(37);
  const w = writer(n, rand);
  const { verts, edges } = icosphere(2);
  const base = -0.55;
  const place = (v: Vec3): Vec3 => [v[0] * 1.05, v[1] * 1.05 + base, v[2] * 1.05];
  // Keep the upper hemisphere: the dome rises from a base ring at y = base.
  const kept = edges.filter(([a, b]) => verts[a][1] > -0.02 && verts[b][1] > -0.02);
  const height = (p: Vec3) => (p[1] - base) / 1.05;

  const ringCount = Math.floor(n * 0.08);
  for (let k = 0; k < ringCount; k++) {
    const a = rand() * Math.PI * 2;
    w.put([Math.cos(a) * 1.05, base, Math.sin(a) * 1.05], 0, 0.01);
  }
  const jointCount = Math.floor(n * 0.1);
  const joints = verts.filter((v) => v[1] > -0.02);
  for (let k = 0; k < jointCount; k++) {
    const p = place(joints[k % joints.length]);
    w.put(ballPoint(p, 0.03, rand), height(p));
  }
  w.fill(() => {
    const [a, b] = kept[Math.floor(rand() * kept.length)];
    const p = lerp3(place(verts[a]), place(verts[b]), rand());
    w.put(p, height(p), 0.006);
  });
  return w.out;
}

// ── 04 Journey: a rising double helix with milestones ─────────────
export function helix(n: number): Shape {
  const rand = seeded(53);
  const w = writer(n, rand);
  const turns = 2.6;
  const radius = 0.48;
  const at = (t: number, phase: number): Vec3 => {
    const a = t * turns * Math.PI * 2 + phase;
    return [Math.cos(a) * radius, -1.15 + t * 2.3, Math.sin(a) * radius];
  };
  const milestones = [0.14, 0.38, 0.62, 0.86];

  const strandCount = Math.floor(n * 0.5);
  for (let k = 0; k < strandCount; k++) {
    const t = rand();
    w.put(at(t, k % 2 ? Math.PI : 0), t, 0.02);
  }
  const rungCount = Math.floor(n * 0.2);
  const rungs = 22;
  for (let k = 0; k < rungCount; k++) {
    const t = (Math.floor(rand() * rungs) + 0.5) / rungs;
    w.put(lerp3(at(t, 0), at(t, Math.PI), rand()), t, 0.008);
  }
  const milestoneCount = Math.floor(n * 0.14);
  for (let k = 0; k < milestoneCount; k++) {
    const t = milestones[k % milestones.length];
    w.put(ballPoint([0, -1.15 + t * 2.3, 0], 0.11, rand), t);
  }
  w.fill(() => {
    // a faint cylinder of dust around the path
    const t = rand();
    const a = rand() * Math.PI * 2;
    const r = radius * (1.25 + rand() * 0.6);
    w.put([Math.cos(a) * r, -1.15 + t * 2.3, Math.sin(a) * r], -1);
  });
  return w.out;
}

// ── 05 Product: an exploded interface ─────────────────────────────
type Path = Vec3[]; // polyline

function rect(x0: number, y0: number, x1: number, y1: number, z: number, r = 0): Path {
  if (r <= 0) return [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [x0, y0, z]];
  const pts: Path = [];
  const corner = (cx: number, cy: number, from: number) => {
    for (let k = 0; k <= 6; k++) {
      const a = from + (k / 6) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]);
    }
  };
  corner(x1 - r, y0 + r, -Math.PI / 2);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  pts.push(pts[0]);
  return pts;
}
const line = (x0: number, y0: number, x1: number, y1: number, z: number): Path => [
  [x0, y0, z],
  [x1, y1, z],
];
const circle = (cx: number, cy: number, r: number, z: number): Path =>
  Array.from({ length: 17 }, (_, k) => {
    const a = (k / 16) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as Vec3;
  });

export function product(n: number): Shape {
  const rand = seeded(71);
  const w = writer(n, rand);
  const z = [-0.48, -0.16, 0.16, 0.48];
  const paths: Path[] = [
    // back layer: the window
    rect(-0.9, -0.58, 0.9, 0.58, z[0], 0.06),
    line(-0.9, 0.44, 0.9, 0.44, z[0]),
    circle(-0.82, 0.51, 0.018, z[0]),
    circle(-0.76, 0.51, 0.018, z[0]),
    circle(-0.7, 0.51, 0.018, z[0]),
    // layout layer: sidebar, header, a grid of cards
    rect(-0.84, -0.52, -0.52, 0.36, z[1], 0.03),
    rect(-0.46, 0.24, 0.84, 0.36, z[1], 0.03),
    rect(-0.46, -0.12, 0.14, 0.18, z[1], 0.03),
    rect(0.2, -0.12, 0.84, 0.18, z[1], 0.03),
    rect(-0.46, -0.52, 0.14, -0.18, z[1], 0.03),
    rect(0.2, -0.52, 0.84, -0.18, z[1], 0.03),
    // content layer: text lines, a bar chart, a trend line
    ...[0.28, 0.2, 0.12, 0.04, -0.04].map((y) => line(-0.78, y - 0.04, -0.6, y - 0.04, z[2])),
    line(-0.4, 0.1, -0.05, 0.1, z[2]),
    line(-0.4, 0.04, 0.05, 0.04, z[2]),
    line(-0.4, -0.02, -0.15, -0.02, z[2]),
    ...[0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78].map((x, k) =>
      line(x, -0.08, x, -0.08 + 0.06 + ((k * 37) % 11) * 0.018, z[2])
    ),
    Array.from({ length: 24 }, (_, k) => {
      const x = -0.4 + (k / 23) * 0.5;
      return [x, -0.4 + Math.sin(k * 0.55) * 0.05 + k * 0.004, z[2]] as Vec3;
    }),
    // front layer: an AI assistant bubble with a sparkle, a button, a cursor
    rect(0.26, -0.46, 0.8, -0.24, z[3], 0.05),
    [[0.34, -0.46, z[3]], [0.3, -0.52, z[3]], [0.42, -0.46, z[3]]],
    [[0.34, -0.35, z[3]], [0.355, -0.32, z[3]], [0.37, -0.35, z[3]], [0.355, -0.38, z[3]], [0.34, -0.35, z[3]]],
    line(0.42, -0.31, 0.72, -0.31, z[3]),
    line(0.42, -0.39, 0.64, -0.39, z[3]),
    rect(-0.4, -0.5, -0.12, -0.42, z[3], 0.04),
    [[0.02, 0.0, z[3]], [0.02, -0.14, z[3]], [0.055, -0.105, z[3]], [0.085, -0.16, z[3]], [0.1, -0.15, z[3]], [0.072, -0.095, z[3]], [0.12, -0.09, z[3]], [0.02, 0.0, z[3]]],
  ];
  // Sample every path in proportion to its length.
  const segments: [Vec3, Vec3, number][] = [];
  let total = 0;
  for (const path of paths) {
    for (let k = 0; k < path.length - 1; k++) {
      const len = Math.hypot(
        path[k + 1][0] - path[k][0],
        path[k + 1][1] - path[k][1],
        path[k + 1][2] - path[k][2]
      );
      total += len;
      segments.push([path[k], path[k + 1], total]);
    }
  }
  w.fill(() => {
    const target = rand() * total;
    let lo = 0;
    let hi = segments.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (segments[mid][2] < target) lo = mid + 1;
      else hi = mid;
    }
    const [a, b] = segments[lo];
    const p = lerp3(a, b, rand());
    // a scanline of light sweeps left to right, layer by layer
    const layer = z.indexOf(a[2]);
    w.put(p, Math.min(1, (p[0] + 0.95) / 1.9 * 0.8 + layer * 0.06), 0.006);
  });
  return w.out;
}

// ── 06 People: the noise finally speaks ──────────────────────────
export function word(n: number, text: string, font: string): Shape {
  const rand = seeded(97);
  const w = writer(n, rand);
  const canvas = document.createElement("canvas");
  const W = 1400;
  const H = 420;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const pixels: [number, number][] = [];
  if (ctx) {
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font;
    ctx.fillText(text, W / 2, H / 2);
    const data = ctx.getImageData(0, 0, W, H).data;
    for (let y = 0; y < H; y += 3) {
      for (let x = 0; x < W; x += 3) {
        if (data[(y * W + x) * 4 + 3] > 128) pixels.push([x, y]);
      }
    }
  }
  if (!pixels.length) return noise(n);
  let minX = W;
  let maxX = 0;
  for (const [x] of pixels) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
  }
  const span = Math.max(1, maxX - minX);
  const scale = 2.5 / span;
  w.fill(() => {
    const [x, y] = pixels[Math.floor(rand() * pixels.length)];
    const px = (x - (minX + maxX) / 2) * scale;
    w.put([px, -(y - H / 2) * scale, (rand() - 0.5) * 0.14], (px + 1.25) / 2.5, 0.012);
  });
  return w.out;
}
