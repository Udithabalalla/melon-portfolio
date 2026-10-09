import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { EASE, prefersReducedMotion } from "../../lib/motion";

/**
 * Counts a stat up from zero when it comes into view. Leading digits count;
 * anything after them ("+", "st") is kept as a suffix. Non-numeric values
 * render as-is.
 */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : 0;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const count = useMotionValue(prefersReducedMotion ? target : 0);
  const text = useTransform(count, (v) => String(Math.round(v)));

  useEffect(() => {
    if (!match || !inView || prefersReducedMotion) return;
    const controls = animate(count, target, { duration: 1.6, ease: EASE });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target]);

  if (!match) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={`tabular-nums ${className}`} aria-label={value}>
      <motion.span aria-hidden>{text}</motion.span>
      <span aria-hidden>{match[2]}</span>
    </span>
  );
}
