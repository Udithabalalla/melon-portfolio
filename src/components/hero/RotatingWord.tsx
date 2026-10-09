import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { prefersReducedMotion } from "../../lib/gsap";

const letter: Variants = {
  enter: { y: "105%", opacity: 0, filter: "blur(6px)" },
  center: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
  exit: {
    y: "-105%",
    opacity: 0,
    filter: "blur(6px)",
    transition: { duration: 0.32, ease: [0.7, 0, 0.84, 0] },
  },
};

/**
 * Cycles through `words`, letter by letter. Every word sits stacked in one
 * grid cell (invisible copies reserve the widest), so swapping never reflows
 * the headline around it.
 */
export function RotatingWord({
  words,
  colors,
  interval = 2600,
}: {
  words: string[];
  colors?: string[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion || words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  const word = words[index];

  return (
    <span className="relative -mb-[0.12em] inline-grid overflow-hidden pb-[0.12em] pr-[0.08em] align-top">
      {words.map((w) => (
        <span key={w} className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {w}
        </span>
      ))}
      <AnimatePresence initial={false}>
        <motion.span
          key={word}
          className="col-start-1 row-start-1 whitespace-nowrap"
          initial="enter"
          animate="center"
          exit="exit"
          variants={{
            center: { transition: { staggerChildren: 0.035 } },
            exit: { transition: { staggerChildren: 0.018 } },
          }}
          style={{ color: colors?.[index % colors.length] }}
        >
          {Array.from(word).map((ch, i) => (
            <motion.span key={i} variants={letter} className="inline-block">
              {ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
