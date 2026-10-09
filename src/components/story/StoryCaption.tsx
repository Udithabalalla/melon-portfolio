import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent } from "motion/react";
import { EASE } from "../../lib/motion";
import { STORY, storyChapter } from "./story";

/**
 * A quiet caption naming the chapter the particle field is building, with a
 * rail showing where you are in the story. Glass-backed so it reads over
 * anything scrolling beneath it, including white UI screenshots.
 */
export function StoryCaption() {
  const [chapter, setChapter] = useState(storyChapter.get());
  useMotionValueEvent(storyChapter, "change", (c) => setChapter(c));
  const { title, line } = STORY[chapter] ?? STORY[0];

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[45] hidden w-72 rounded-2xl border border-line bg-ink/60 px-4 py-3 text-right backdrop-blur-md md:block lg:right-10">
      <div className="mb-3 flex justify-end gap-1.5" aria-hidden>
        {STORY.map((_, i) => (
          <span
            key={i}
            className={`h-[3px] rounded-full transition-all duration-700 ease-expo ${
              i === chapter ? "w-6 bg-paper" : i < chapter ? "w-2 bg-paper/50" : "w-2 bg-paper/15"
            }`}
          />
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={chapter}
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted">
            <span className="tabular-nums text-paper">Fig. {String(chapter + 1).padStart(2, "0")}</span>
            <span className="mx-2 text-paper/30">—</span>
            {title}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted/80">{line}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
