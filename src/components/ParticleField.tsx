import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "../lib/gsap";
import type { Theme } from "../theme";

// Per-theme visual config. Dark = luminous blues on black (additive glow);
// light = saturated multicolour confetti on white (normal blend), echoing
// antigravity.google's dark download page vs. its light home page.
const THEMES = {
  dark: {
    palette: [
      "#5b8cff",
      "#6366f1",
      "#8b5cf6",
      "#3b82f6",
      "#22d3ee",
      "#a78bfa",
      "#e0e7ff",
    ],
    blending: THREE.AdditiveBlending,
    fogColor: 0x050505,
    fogDensity: 0.055,
    opacity: 0.82,
    brightMin: 0.65,
    brightRange: 0.7,
    speckColor: 0x8ea2ff,
    speckOpacity: 0.5,
  },
  light: {
    palette: [
      "#ef4444",
      "#f97316",
      "#f59e0b",
      "#eab308",
      "#8b5cf6",
      "#6366f1",
      "#3b82f6",
      "#06b6d4",
      "#ec4899",
    ],
    blending: THREE.NormalBlending,
    fogColor: 0xf9f8f5,
    fogDensity: 0.06,
    opacity: 0.92,
    brightMin: 0.78,
    brightRange: 0.28,
    speckColor: 0x1a1a1a,
    speckOpacity: 0.35,
  },
} as const;

/**
 * Interactive WebGL particle field inspired by antigravity.google's
 * `main-particles-container`. A radial cloud of small elongated "dash"
 * particles that slowly rotates, drifts, tilts toward the cursor (parallax)
 * and scatters away from it (repulsion).
 *
 * Renders transparently so it can sit behind the hero content.
 */
export function ParticleField({
  className = "",
  theme = "dark",
}: {
  className?: string;
  theme?: Theme;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const cfg = THEMES[theme];

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // ── Scene / camera ────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.fogDensity);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    // ── Particles ─────────────────────────────────────────────
    const isSmall = width < 768;
    const COUNT = isSmall ? 360 : 620;
    const RADIUS = 9;

    const palette = cfg.palette.map((c) => new THREE.Color(c));

    // a thin rod → reads as a small dash/streak
    const geometry = new THREE.BoxGeometry(0.03, 0.03, 0.45);
    // NOTE: no `vertexColors` — per-instance colors come from setColorAt(),
    // which InstancedMesh injects automatically via instanceColor.
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: cfg.opacity,
      blending: cfg.blending,
      depthWrite: false,
    });

    const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // per-particle state
    const basePos = new Float32Array(COUNT * 3);
    const baseQuat: THREE.Quaternion[] = [];
    const spinAxis: THREE.Vector3[] = [];
    const spinSpeed = new Float32Array(COUNT);
    const phase = new Float32Array(COUNT);
    const lenScale = new Float32Array(COUNT);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const tmpEuler = new THREE.Euler();

    for (let i = 0; i < COUNT; i++) {
      // spherical-shell distribution → radiating cloud with an emptier
      // centre (so the headline sits in negative space)
      const r = RADIUS * (0.52 + 0.48 * Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.7; // slightly flattened
      const z = r * Math.cos(phi);
      basePos[i * 3] = x;
      basePos[i * 3 + 1] = y;
      basePos[i * 3 + 2] = z;

      tmpEuler.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      baseQuat.push(new THREE.Quaternion().setFromEuler(tmpEuler));
      spinAxis.push(
        new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize()
      );
      spinSpeed[i] = (Math.random() - 0.5) * 0.35;
      phase[i] = Math.random() * Math.PI * 2;
      lenScale[i] = 0.45 + Math.random() * 0.85;

      color.copy(palette[(Math.random() * palette.length) | 0]);
      // vary brightness for depth
      color.multiplyScalar(cfg.brightMin + Math.random() * cfg.brightRange);
      mesh.setColorAt(i, color);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    const group = new THREE.Group();
    group.add(mesh);
    scene.add(group);

    // faint background specks for depth
    const speckCount = isSmall ? 300 : 600;
    const speckGeo = new THREE.BufferGeometry();
    const speckPos = new Float32Array(speckCount * 3);
    for (let i = 0; i < speckCount; i++) {
      speckPos[i * 3] = (Math.random() - 0.5) * 22;
      speckPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      speckPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    speckGeo.setAttribute("position", new THREE.BufferAttribute(speckPos, 3));
    const speckMat = new THREE.PointsMaterial({
      color: cfg.speckColor,
      size: 0.03,
      transparent: true,
      opacity: cfg.speckOpacity,
      blending: cfg.blending,
      depthWrite: false,
    });
    const specks = new THREE.Points(speckGeo, speckMat);
    group.add(specks);

    // ── Interaction state ─────────────────────────────────────
    const pointer = new THREE.Vector2(0, 0); // normalized -1..1
    const smoothPointer = new THREE.Vector2(0, 0);
    const mouseWorld = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove);

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────────
    const reduced = prefersReducedMotion;
    const clock = new THREE.Clock();
    const tmpVec = new THREE.Vector3();
    const tmpQuat = new THREE.Quaternion();
    let raf = 0;
    let running = true;

    const REPULSE_RADIUS = 2.6;
    const REPULSE_STRENGTH = 2.2;

    const render = () => {
      const t = clock.getElapsedTime();

      // smooth the pointer for buttery parallax
      smoothPointer.lerp(pointer, reduced ? 1 : 0.06);

      // global slow rotation + cursor parallax tilt
      group.rotation.y = (reduced ? 0 : t * 0.05) + smoothPointer.x * 0.5;
      group.rotation.x = -smoothPointer.y * 0.35 + (reduced ? 0 : Math.sin(t * 0.15) * 0.05);

      // project the cursor onto the z=0 plane (in world space)
      raycaster.setFromCamera(smoothPointer, camera);
      raycaster.ray.intersectPlane(planeZ0, mouseWorld);
      // bring cursor point into the (rotated) group's local space
      const localMouse = group.worldToLocal(mouseWorld.clone());

      for (let i = 0; i < COUNT; i++) {
        const bx = basePos[i * 3];
        const by = basePos[i * 3 + 1];
        const bz = basePos[i * 3 + 2];

        // idle breathing drift
        const drift = reduced ? 0 : Math.sin(t * 0.6 + phase[i]) * 0.12;
        dummy.position.set(bx, by + drift, bz);

        // cursor repulsion
        if (!reduced) {
          tmpVec.set(bx - localMouse.x, by - localMouse.y, bz - localMouse.z);
          const d = tmpVec.length();
          if (d < REPULSE_RADIUS) {
            const f = (1 - d / REPULSE_RADIUS) ** 2 * REPULSE_STRENGTH;
            tmpVec.normalize().multiplyScalar(f);
            dummy.position.add(tmpVec);
          }
        }

        // orientation: base + gentle spin
        if (reduced) {
          dummy.quaternion.copy(baseQuat[i]);
        } else {
          tmpQuat.setFromAxisAngle(spinAxis[i], t * spinSpeed[i]);
          dummy.quaternion.copy(baseQuat[i]).multiply(tmpQuat);
        }

        dummy.scale.set(1, 1, lenScale[i]);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
      if (running && !reduced) raf = requestAnimationFrame(render);
    };

    render();
    if (reduced) renderer.render(scene, camera); // one static frame

    // pause when tab is hidden
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        running = true;
        clock.getDelta();
        render();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ── Cleanup ───────────────────────────────────────────────
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      speckGeo.dispose();
      speckMat.dispose();
      renderer.dispose();
      // release the GL context immediately so repeated theme toggles don't
      // exhaust the browser's WebGL context limit
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
