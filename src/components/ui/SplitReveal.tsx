import { useLayoutEffect, useRef, type ElementType } from "react";
import { gsap } from "../../lib/gsap";

type SplitRevealProps = {
  words: string[];
  as?: ElementType;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  /** start the animation on load rather than on scroll */
  onLoad?: boolean;
  /** if true, plays once and never reverses when scrolled past */
  once?: boolean;
};

/**
 * Renders an array of words, each masked, then reveals them with a
 * staggered upward slide. Great for hero headlines.
 */
export function SplitReveal({
  words,
  as,
  className = "",
  wordClassName = "",
  delay = 0,
  stagger = 0.09,
  onLoad = false,
  once = false,
}: SplitRevealProps) {
  const Tag = (as ?? "h1") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inners = el.querySelectorAll<HTMLElement>("[data-word-inner]");
    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 1 });
      gsap.fromTo(
        inners,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.1,
          delay,
          ease: "expo.out",
          stagger,
          scrollTrigger: onLoad
            ? undefined
            : {
                trigger: el,
                start: "top 80%",
                toggleActions: once ? "play none none none" : "play none none reverse",
              },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [delay, stagger, onLoad, once]);

  return (
    <Tag ref={ref} className={`will-reveal ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.08em", marginBottom: "-0.08em" }}
        >
          <span data-word-inner className={`inline-block ${wordClassName}`}>
            {word}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
