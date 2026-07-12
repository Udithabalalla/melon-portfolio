import { useLayoutEffect, useRef, type ReactNode, type ElementType } from "react";
import { gsap } from "../../lib/gsap";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** delay in seconds */
  delay?: number;
  /** vertical travel distance in px */
  y?: number;
  once?: boolean;
};

/**
 * Fades + rises its content into view when scrolled to.
 * Uses a `.will-reveal` class so the element is hidden before GSAP runs
 * (no flash of unstyled content).
 */
export function Reveal({
  children,
  as,
  className = "",
  delay = 0,
  y = 40,
  once = false,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          delay,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: once ? "play none none none" : "play none none reverse",
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [delay, y, once]);

  return (
    <Tag ref={ref} className={`will-reveal ${className}`}>
      {children}
    </Tag>
  );
}
