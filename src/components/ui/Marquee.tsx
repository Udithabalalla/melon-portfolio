import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../../lib/gsap";

type MarqueeProps = {
  items: string[];
  className?: string;
  speed?: number; // seconds per loop
};

/** An infinite horizontal marquee that also nudges with scroll velocity. */
export function Marquee({ items, className = "", speed = 22 }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const track = trackRef.current;
    if (!track) return;
    const ctx = gsap.context(() => {
      gsap.to(track, {
        xPercent: -50,
        repeat: -1,
        duration: speed,
        ease: "none",
      });
    }, track);
    return () => ctx.revert();
  }, [speed]);

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
      <div ref={trackRef} className="flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}
