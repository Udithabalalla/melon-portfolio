import { useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import type { Project } from "../data/content";
import { EASE, SPRINGS, focusIn, prefersReducedMotion } from "../lib/motion";
import { Magnetic } from "./ui/Magnetic";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const coverRef = useRef<HTMLAnchorElement>(null);
  const [hovering, setHovering] = useState(false);
  const href = `/work/${project.slug}`;

  // The cover opens from an inset window to full bleed as it scrolls in…
  const { scrollYProgress: enter } = useScroll({ target: cardRef, offset: ["start end", "start 30%"] });
  const inset = useTransform(enter, [0, 1], prefersReducedMotion ? [0, 0] : [14, 0]);
  const clipPath = useTransform(inset, (v) => `inset(${v}% ${v * 0.7}% round 24px)`);
  const coverScale = useTransform(enter, [0, 1], prefersReducedMotion ? [1, 1] : [1.18, 1.06]);

  // …and its image drifts against the scroll while it's on screen.
  const { scrollYProgress: pass } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const imageY = useTransform(pass, [0, 1], prefersReducedMotion ? ["0%", "0%"] : ["-6%", "6%"]);

  // A "View case study" pill trails the cursor across the cover.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const pillX = useSpring(px, SPRINGS.follow);
  const pillY = useSpring(py, SPRINGS.follow);
  const onCoverMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse" || !coverRef.current) return;
    const r = coverRef.current.getBoundingClientRect();
    px.set(e.clientX - r.left);
    py.set(e.clientY - r.top);
    if (!hovering) {
      pillX.jump(e.clientX - r.left);
      pillY.jump(e.clientY - r.top);
      setHovering(true);
    }
  };

  return (
    <article ref={cardRef} className="group">
      <motion.div style={{ clipPath }} className="relative overflow-hidden rounded-3xl">
        <Link
          ref={coverRef}
          to={href}
          aria-label={`View case study: ${project.title}`}
          onPointerMove={onCoverMove}
          onPointerLeave={() => setHovering(false)}
          className="relative block aspect-[16/10] w-full overflow-hidden md:aspect-[16/8] [@media(hover:hover)]:cursor-none"
        >
          <motion.div
            style={{
              scale: coverScale,
              y: imageY,
              background: project.coverImage
                ? undefined
                : `linear-gradient(135deg, ${project.cover.from}, ${project.cover.to})`,
            }}
            className="absolute inset-0"
          >
            <div className="h-full w-full transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.04]">
              {project.coverImage ? (
                <img
                  src={project.coverImage}
                  alt={project.cover.text}
                  loading="lazy"
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-display text-[clamp(2rem,7vw,6rem)] font-semibold text-black/85">
                    {project.cover.text}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {hovering && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 z-10"
                style={{ x: pillX, y: pillY }}
              >
                {/* Dark glass in both themes: covers range from white UI shots to deep gradients. */}
                <motion.span
                  className="flex items-center gap-2 whitespace-nowrap rounded-full bg-black/75 px-5 py-3 text-sm font-medium text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-md"
                  style={{ x: "-50%", y: "-50%" }}
                  initial={{ scale: 0.4, opacity: 0, filter: "blur(6px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  exit={{ scale: 0.4, opacity: 0, filter: "blur(6px)" }}
                  transition={SPRINGS.snappy}
                >
                  View case study <span aria-hidden>↗</span>
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </motion.div>

      <motion.div
        className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        data-quiet
        initial="hidden"
        whileInView="show"
        viewport={{ margin: "0px 0px -10% 0px" }}
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      >
        <div>
          <motion.span
            variants={focusIn(16, 6)}
            transition={{ duration: 0.9, ease: EASE }}
            className="block text-xs uppercase tracking-[0.2em] text-muted"
          >
            {String(index + 1).padStart(2, "0")} — {project.category}
          </motion.span>
          <motion.h3
            variants={focusIn(24, 10)}
            transition={{ duration: 1.1, ease: EASE }}
            className="mt-2 font-display text-3xl font-medium tracking-tight md:text-5xl"
          >
            <Link to={href} className="transition-colors duration-300 hover:text-accent">
              {project.title}
            </Link>
          </motion.h3>
        </div>
        <motion.div
          variants={focusIn(20, 8)}
          transition={{ duration: 1.1, ease: EASE }}
          className="max-w-md md:text-right"
        >
          <p className="text-body">{project.description}</p>
          <div className="mt-3 text-sm text-muted">
            {project.role} · {project.year}
          </div>
          <div className="mt-5 md:flex md:justify-end">
            <Magnetic>
              <Link to={href} className="group/link inline-flex items-center gap-2 text-sm font-medium text-paper">
                Read More
                <span className="grid h-6 w-6 place-items-center rounded-full border border-line-strong transition-transform duration-500 ease-expo group-hover/link:translate-x-0.5 group-hover/link:rotate-45">
                  ↗
                </span>
              </Link>
            </Magnetic>
          </div>
        </motion.div>
      </motion.div>
    </article>
  );
}
