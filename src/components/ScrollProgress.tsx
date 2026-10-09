import { motion, useScroll, useSpring } from "motion/react";

/** Thin progress bar pinned to the top of the viewport, in the field's colours. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return (
    <div className="fixed inset-x-0 top-0 z-[55] h-[2px] bg-transparent">
      <motion.div
        style={{ scaleX }}
        className="h-full origin-left bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-400"
      />
    </div>
  );
}
