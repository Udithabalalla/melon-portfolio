import { motion } from "motion/react";
import { EASE } from "../../lib/motion";

/**
 * Chapter marker that opens each section: its index, a rule that draws
 * itself, then the label coming into focus.
 */
export function SectionIntro({
  index,
  label,
  className = "",
}: {
  index: string;
  label: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-muted ${className}`}
      data-quiet
      initial="hidden"
      whileInView="show"
      viewport={{ margin: "0px 0px -10% 0px" }}
    >
      <motion.span
        className="font-display tabular-nums tracking-[0.15em] text-paper"
        variants={{
          hidden: { opacity: 0, y: 10 },
          show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
        }}
      >
        {index}
      </motion.span>
      <motion.span
        className="h-px w-12 origin-left bg-line-strong"
        variants={{
          hidden: { scaleX: 0 },
          show: { scaleX: 1, transition: { duration: 1, ease: EASE, delay: 0.15 } },
        }}
      />
      <motion.span
        variants={{
          hidden: { opacity: 0, x: -8, filter: "blur(6px)" },
          show: {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            transition: { duration: 0.9, ease: EASE, delay: 0.35 },
          },
        }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
