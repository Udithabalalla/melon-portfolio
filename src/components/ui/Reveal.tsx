import type { ReactNode } from "react";
import { motion } from "motion/react";
import { EASE, focusIn } from "../../lib/motion";

type Tag = "div" | "p" | "span" | "h2" | "h3" | "h4" | "li";

type RevealProps = {
  children: ReactNode;
  as?: Tag;
  className?: string;
  /** delay in seconds */
  delay?: number;
  /** vertical travel distance in px */
  y?: number;
  once?: boolean;
  /** keep the particle field clear behind this block (body copy, labels) */
  quiet?: boolean;
};

/**
 * Brings its content into focus — rising, fading in and un-blurring — when it
 * scrolls into view. Replays each time it re-enters unless `once` is set.
 */
export function Reveal({
  children,
  as = "div",
  className = "",
  delay = 0,
  y = 32,
  once = false,
  quiet = false,
}: RevealProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      data-quiet={quiet || undefined}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "0px 0px -15% 0px" }}
      variants={focusIn(y)}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </Component>
  );
}
