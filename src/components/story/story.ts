import { motionValue } from "motion/react";

/**
 * The narrative the particle field tells as you scroll: the life of an AI
 * product, from raw complexity to a conversation with a person. Each section
 * of the page shows one chapter (see `storyScene`), and the field builds that
 * chapter's form out of the same particles.
 */
export const STORY = [
  { title: "Noise", line: "Every AI product starts as raw complexity." },
  { title: "Intelligence", line: "Models, data, and the logic underneath." },
  { title: "Craft", line: "Research, design and code, assembled piece by piece." },
  { title: "Journey", line: "Five years of shipping, one role at a time." },
  { title: "Product", line: "Interfaces people can read, trust and use." },
  { title: "People", line: "And in the end, a conversation." },
] as const;

/** The chapter currently on screen; the field writes it, the caption reads it. */
export const storyChapter = motionValue(0);

/** Spread onto a section to make the field build this chapter behind it. */
export function storyScene(chapter: number) {
  return { "data-story-scene": chapter };
}
