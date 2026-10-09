import { Fragment } from "react";
import { motion, type Variants } from "motion/react";
import { SPRINGS } from "../../lib/motion";

type Tag = "h1" | "h2" | "h3" | "p" | "div";

type SplitRevealProps = {
  words: string[];
  as?: Tag;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  /** start the animation on load rather than on scroll */
  onLoad?: boolean;
  /** if true, plays once and never replays when scrolled past */
  once?: boolean;
};

const WORD: Variants = {
  hidden: { y: "110%", opacity: 0, filter: "blur(8px)" },
  show: { y: "0%", opacity: 1, filter: "blur(0px)", transition: SPRINGS.settle },
};

/**
 * Renders an array of words, each masked, then brings them up into focus with
 * a staggered spring. Used for headlines across the site.
 */
export function SplitReveal({
  words,
  as = "h1",
  className = "",
  wordClassName = "",
  delay = 0,
  stagger = 0.06,
  onLoad = false,
  once = false,
}: SplitRevealProps) {
  const Component = motion[as];
  const trigger = onLoad
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once, margin: "0px 0px -20% 0px" } };

  return (
    <Component
      className={className}
      initial="hidden"
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...trigger}
    >
      {words.map((word, i) => (
        // The space sits outside the mask: a trailing space inside an
        // inline-block is dropped, which would glue the words together.
        <Fragment key={i}>
          <span
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: "0.08em", marginBottom: "-0.08em" }}
          >
            <motion.span variants={WORD} className={`inline-block ${wordClassName}`}>
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Component>
  );
}
