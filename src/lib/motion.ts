// Shared motion language for the whole site: one easing curve, a few spring
// presets, and a single reduced-motion flag every animation defers to.

// Dev-only escape hatch: add ?motion to the URL to preview full motion even
// when the OS asks for reduced motion. Compiled out of production builds.
const forceMotion =
  import.meta.env.DEV &&
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("motion");

/** True when the visitor asked their OS for reduced motion. */
export const prefersReducedMotion =
  !forceMotion &&
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Expo-out: fast start, long settle. Used for every non-spring transition. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const SPRINGS = {
  /** Text and blocks settling into place. */
  settle: { type: "spring", stiffness: 110, damping: 20, mass: 0.9 },
  /** Small interactive elements: buttons, pills, arrows. */
  snappy: { type: "spring", stiffness: 320, damping: 22 },
  /** Things that trail the cursor. */
  follow: { stiffness: 140, damping: 26 },
} as const;

/**
 * The site's signature reveal: content comes into focus. It mirrors the
 * particle field, where noise resolves into signal.
 */
export const focusIn = (y = 32, blur = 10) => ({
  hidden: { opacity: 0, y, filter: `blur(${blur}px)` },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
});
