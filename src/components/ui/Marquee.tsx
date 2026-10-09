import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { wrap } from "motion";
import { prefersReducedMotion } from "../../lib/motion";

type MarqueeProps = {
  items: string[];
  className?: string;
  speed?: number; // seconds per loop at rest
};

/**
 * An infinite marquee wired to scroll: it speeds up and leans with scroll
 * velocity, and reverses when you scroll back up.
 */
export function Marquee({ items, className = "", speed = 22 }: MarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const skewX = useTransform(velocity, [-2500, 0, 2500], [7, 0, -7]);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(-1);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion) return;
    let move = direction.current * (50 / speed) * (delta / 1000);
    const b = boost.get();
    if (b < 0) direction.current = 1;
    else if (b > 0) direction.current = -1;
    move += direction.current * Math.abs(move) * Math.abs(b);
    baseX.set(baseX.get() + move);
  });

  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-10">
          <span>{item}</span>
          <span className="text-muted/40">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div style={{ x, skewX }} className="flex w-max">
        {row}
        {row}
      </motion.div>
    </div>
  );
}
