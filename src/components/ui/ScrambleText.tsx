import { Fragment, useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { prefersReducedMotion } from "../../lib/motion";

const GLYPHS = "!<>-_/[]{}=+*^?#%&01";
const HIDDEN = "";

type Tag = "h2" | "h3";

/**
 * Text that decodes itself: each letter flickers through random glyphs, then
 * resolves, left to right — noise turning into language. Every letter keeps
 * its final width throughout, so the line never reflows. Replays when it
 * re-enters the viewport.
 */
export function ScrambleText({
  text,
  as = "h2",
  className = "",
  duration = 1.6,
}: {
  text: string;
  as?: Tag;
  className?: string;
  duration?: number;
}) {
  const Tag = as;
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -20% 0px" });
  const chars = Array.from(text);
  // Per letter: HIDDEN, a scramble glyph, or null once resolved. null overall = done.
  const [frame, setFrame] = useState<(string | null)[] | null>(() =>
    prefersReducedMotion ? null : chars.map(() => HIDDEN)
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!inView) {
      setFrame(chars.map(() => HIDDEN));
      return;
    }
    const total = duration * 1000;
    const n = chars.length;
    const resolveAt = (i: number) => total * (0.25 + (0.75 * i) / n);
    const scrambleAt = (i: number) => resolveAt(i) - total * 0.4;
    const start = performance.now();
    let raf = 0;
    let lastPaint = 0;
    const tick = (now: number) => {
      const t = now - start;
      if (t >= total) {
        setFrame(null);
        return;
      }
      if (now - lastPaint > 45) {
        lastPaint = now;
        setFrame(
          chars.map((ch, i) => {
            if (ch === " " || t >= resolveAt(i)) return null;
            if (t < scrambleAt(i)) return HIDDEN;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, text, duration]);

  // Group letters into words so lines still wrap between words.
  const words: { ch: string; i: number }[][] = [[]];
  chars.forEach((ch, i) => {
    if (ch === " ") words.push([]);
    else words[words.length - 1].push({ ch, i });
  });

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((letters, wi) => (
        <Fragment key={wi}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {letters.map(({ ch, i }) => {
              const state = frame === null ? null : frame[i];
              const scrambling = typeof state === "string" && state !== HIDDEN;
              return (
                <span key={i} className="relative inline-block">
                  <span className={state === null ? "opacity-100 transition-opacity duration-300" : "opacity-0"}>
                    {ch}
                  </span>
                  {scrambling && (
                    <span className="absolute inset-0 flex justify-center text-cyan-400 [[data-theme=light]_&]:text-blue-600">
                      {state}
                    </span>
                  )}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
