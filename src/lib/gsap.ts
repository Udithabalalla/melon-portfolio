import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Dev-only escape hatch: add ?motion to the URL to preview full motion even
// when the OS asks for reduced motion. Compiled out of production builds.
const forceMotion =
  import.meta.env.DEV &&
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("motion");

// Respect users who prefer reduced motion — disables all reveals/parallax.
export const prefersReducedMotion =
  !forceMotion &&
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger };
