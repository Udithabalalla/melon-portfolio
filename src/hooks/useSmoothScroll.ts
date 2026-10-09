import { useEffect } from "react";
import Lenis from "lenis";
import { cancelFrame, frame } from "motion/react";
import { prefersReducedMotion } from "../lib/motion";

/**
 * Sets up Lenis smooth scrolling and drives it from Motion's frame loop, so
 * scroll-linked animations read the scroll position in the same frame Lenis
 * writes it (no one-frame lag or jitter). Mount once in App.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const update = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
    frame.update(update, true);

    // expose for anchor-link navigation
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      cancelFrame(update);
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
