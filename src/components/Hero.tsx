import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { hero, site } from "../data/content";
import { useTheme } from "../theme";
import { scrollToHash } from "../hooks/useSmoothScroll";
import { prefersReducedMotion } from "../lib/gsap";
import { ErrorBoundary } from "./ui/ErrorBoundary";
import { SignalField } from "./hero/SignalField";
import { RotatingWord } from "./hero/RotatingWord";
import { MagneticButton } from "./hero/MagneticButton";

const EASE = [0.16, 1, 0.3, 1] as const;

const headlineVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.25 } },
};
const wordVariants: Variants = {
  hidden: { y: "105%", opacity: 0, filter: "blur(12px)" },
  show: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 110, damping: 20, mass: 0.9 },
  },
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.1, ease: EASE, delay },
});

// Accent colours for the rotating word, one per word.
const ACCENTS = {
  dark: ["#67e8f9", "#8fb3ff", "#c4b5fd"],
  light: ["#0e7490", "#3b5bdb", "#7c3aed"],
};

/** Shift a layer against the cursor; bigger `depth` reads as closer. */
function useDepth(sx: MotionValue<number>, sy: MotionValue<number>, depth: number) {
  const x = useTransform(sx, (v) => v * -depth);
  const y = useTransform(sy, (v) => v * -depth * 0.6);
  return { x, y };
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { theme } = useTheme();
  const [hovering, setHovering] = useState(false);

  // Pointer position, normalised to -1…1 across the hero, eased by springs.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20, mass: 0.8 });
  const sy = useSpring(py, { stiffness: 60, damping: 20, mass: 0.8 });
  const eyebrowDepth = useDepth(sx, sy, 6);
  const headlineDepth = useDepth(sx, sy, 14);
  const bodyDepth = useDepth(sx, sy, 4);

  // Soft spotlight that trails the cursor.
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const glowX = useSpring(gx, { stiffness: 140, damping: 26 });
  const glowY = useSpring(gy, { stiffness: 140, damping: 26 });
  const glowLeft = useTransform(glowX, (v) => v - 320);
  const glowTop = useTransform(glowY, (v) => v - 320);

  // Scroll-out: copy lifts, fades and blurs away; the field fades behind it.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const contentBlur = useTransform(scrollYProgress, [0, 0.65], [0, prefersReducedMotion ? 0 : 6]);
  // "none" until blur kicks in, so the copy isn't held on a filter layer at rest.
  const contentFilter = useTransform(contentBlur, (v) => (v > 0.05 ? `blur(${v}px)` : "none"));
  const fieldOpacity = useTransform(scrollYProgress, [0.15, 0.95], [1, 0]);
  const fieldScale = useTransform(scrollYProgress, [0, 1], [1, prefersReducedMotion ? 1 : 1.06]);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
    gx.set(e.clientX - r.left);
    gy.set(e.clientY - r.top);
    if (!hovering) {
      // First move: jump the spotlight here instead of sweeping in from 0,0.
      glowX.jump(e.clientX - r.left);
      glowY.jump(e.clientY - r.top);
      setHovering(true);
    }
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
    setHovering(false);
  };

  const goTo = (hash: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToHash(hash);
  };

  const fullHeadline = [...hero.headline, hero.rotating[0]].join(" ");

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
      <section
        id="top"
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
      >
        {/* particle field — the canvas listens to the window itself */}
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ opacity: fieldOpacity, scale: fieldScale }}
        >
          <motion.div
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, ease: EASE }}
          >
            <ErrorBoundary>
              <SignalField className="h-full w-full" theme={theme} />
            </ErrorBoundary>
          </motion.div>
        </motion.div>

        {/* cursor spotlight */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 -z-10 h-[640px] w-[640px] rounded-full"
          style={{
            x: glowLeft,
            y: glowTop,
            background: "radial-gradient(closest-side, var(--hero-glow), transparent)",
          }}
          animate={{ opacity: hovering ? 1 : 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        />

        {/* legibility scrim behind the headline + fade into the next section */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(85% 65% at 20% 52%, rgb(var(--bg) / 0.78) 0%, rgb(var(--bg) / 0.28) 40%, transparent 64%)",
          }}
        />
        {/* on phones the copy spans the full width, so soften the field behind it */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 md:hidden"
          style={{
            background:
              "linear-gradient(to bottom, transparent 8%, rgb(var(--bg) / 0.6) 22%, rgb(var(--bg) / 0.6) 72%, transparent 90%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />

        <motion.div
          style={{ y: contentY, opacity: contentOpacity, filter: contentFilter }}
          className="container-wide pt-28"
        >
          <motion.div style={eyebrowDepth}>
            <motion.div
              {...fadeUp(0.1)}
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
            </motion.div>
          </motion.div>

          <motion.div style={headlineDepth}>
            <motion.h1
              aria-label={fullHeadline}
              variants={headlineVariants}
              initial="hidden"
              animate="show"
              className="max-w-[15ch] font-display text-[clamp(2.8rem,9vw,8.5rem)] font-medium leading-[0.95] tracking-tightest text-balance"
            >
              {hero.headline.map((w) => (
                <span key={w} aria-hidden>
                  <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top">
                    <motion.span variants={wordVariants} className="inline-block">
                      {w}
                    </motion.span>
                  </span>{" "}
                </span>
              ))}
              <span
                aria-hidden
                className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top"
              >
                <motion.span
                  variants={wordVariants}
                  className="inline-block font-serif font-normal italic tracking-[-0.02em]"
                >
                  <RotatingWord words={hero.rotating} colors={ACCENTS[theme]} />
                </motion.span>
              </span>
            </motion.h1>
          </motion.div>

          <motion.div style={bodyDepth}>
            <motion.p {...fadeUp(0.85)} className="mt-10 max-w-xl text-lg text-muted md:text-xl">
              {hero.intro}
            </motion.p>

            <motion.div {...fadeUp(1)} className="mt-12 flex flex-wrap items-center gap-3">
              <MagneticButton href="#work" onClick={goTo("#work")}>
                View selected work
              </MagneticButton>
              <MagneticButton href="#contact" variant="ghost" onClick={goTo("#contact")}>
                Get in touch
              </MagneticButton>
            </motion.div>

            <motion.div
              {...fadeUp(1.3)}
              className="mt-16 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted"
            >
              <span className="relative h-10 w-px overflow-hidden bg-line">
                <motion.span
                  className="absolute left-0 top-0 h-3 w-px bg-paper"
                  animate={{ y: [-12, 40] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
              Scroll to explore
              <span className="hidden h-px w-6 bg-line [@media(hover:hover)]:block" />
              <span className="hidden [@media(hover:hover)]:inline">
                Move to bring order · click to send a pulse
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}
