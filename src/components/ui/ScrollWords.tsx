import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { prefersReducedMotion } from "../../lib/motion";

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}

/**
 * A paragraph that lights up word by word as you scroll through it, so the
 * text is read at the pace of the scroll.
 */
export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 50%"] });
  const words = text.split(" ");

  if (prefersReducedMotion) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
  );
}
