import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";

/** Thin progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.set(barRef.current, { scaleX: self.progress });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[55] h-[2px] bg-transparent">
      <div
        ref={barRef}
        className="h-full origin-left bg-paper"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
