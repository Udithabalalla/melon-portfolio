import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import { hero, site } from "../data/content";
import { SplitReveal } from "./ui/SplitReveal";
import { ErrorBoundary } from "./ui/ErrorBoundary";
import { useTheme } from "../theme";
import { gsap, prefersReducedMotion } from "../lib/gsap";

// Three.js is heavy — load the particle field in its own chunk after paint.
const ParticleField = lazy(() =>
  import("./ParticleField").then((m) => ({ default: m.ParticleField }))
);

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // meta row + intro fade up after the headline
      gsap.fromTo(
        "[data-hero-fade]",
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.12, delay: 0.9 }
      );

      if (!prefersReducedMotion) {
        // parallax the copy out as you scroll away; the particle field stays
        gsap.to("[data-hero-parallax]", {
          yPercent: 18,
          autoAlpha: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.to("[data-hero-canvas]", {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "center top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      {/* interactive WebGL particle field */}
      <div
        data-hero-canvas
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <ErrorBoundary>
          <Suspense fallback={null}>
            <ParticleField className="h-full w-full" theme={theme} />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* legibility scrim — just enough to keep the headline readable */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(90% 70% at 18% 52%, rgb(var(--bg) / 0.82) 0%, rgb(var(--bg) / 0.3) 38%, transparent 62%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div data-hero-parallax className="container-wide pt-28">
        <div
          data-hero-fade
          className="mb-8 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.25em] text-muted"
        >
          <span className="h-px w-10 bg-line" />
          {site.role}
          {site.available && (
            <span className="flex items-center gap-2 text-paper/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Available for work
            </span>
          )}
        </div>

        <SplitReveal
          words={hero.headline}
          as="h1"
          onLoad
          delay={0.35}
          className="max-w-[16ch] font-display text-[clamp(2.8rem,9vw,8.5rem)] font-medium leading-[0.95] tracking-tightest text-balance"
        />

        <p data-hero-fade className="mt-10 max-w-xl text-lg text-muted md:text-xl">
          {hero.intro}
        </p>

        <div
          data-hero-fade
          className="mt-16 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted"
        >
          <span className="inline-block h-8 w-px animate-pulse bg-gradient-to-b from-paper/60 to-transparent" />
          Scroll to explore · move your cursor
        </div>
      </div>
    </section>
  );
}
