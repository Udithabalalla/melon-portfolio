import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/gsap";

/**
 * Sets up Lenis smooth scrolling and drives it from GSAP's ticker so that
 * ScrollTrigger stays perfectly in sync. Returns nothing; mount once in App.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // expose for anchor-link navigation
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      (window as unknown as { __lenis?: Lenis }).__lenis = undefined;
    };
  }, []);
}

/** Smoothly scroll to a section by hash (used by nav links). */
export function scrollToHash(hash: string) {
  const el = document.querySelector(hash);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) {
    // Recompute Lenis's scroll limit before animating — after a client-side
    // route change the page height can differ from whatever Lenis last
    // measured, and a stale (too small) limit silently clamps the target,
    // making the scroll stop short of the destination.
    lenis.resize();
    lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
