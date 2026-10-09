import { motion, type Variants } from "motion/react";
import { skills } from "../data/content";
import { EASE, SPRINGS, focusIn } from "../lib/motion";
import { storyScene } from "./story/story";
import { Reveal } from "./ui/Reveal";
import { SplitReveal } from "./ui/SplitReveal";
import { SectionIntro } from "./ui/SectionIntro";
import { trackLens } from "./ui/lens";

// Cards swing up into place from their bottom edge, one after another, like
// pieces being set — the "Craft" chapter, while the dome builds behind them.
const card: Variants = {
  hidden: { opacity: 0, rotateX: -72, y: 60 },
  show: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: { ...SPRINGS.settle, staggerChildren: 0.035, delayChildren: 0.25 },
  },
};
const pill: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

export function Skills() {
  return (
    <section id="skills" className="relative py-28 md:py-40" {...storyScene(2)}>
      <div className="container-wide">
        <SectionIntro index="02" label="Toolkit" className="mb-8" />
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-quiet>
          <SplitReveal
            words={["Skills"]}
            as="h2"
            className="font-display text-[clamp(2.2rem,6vw,5rem)] font-medium tracking-tightest"
          />
          <Reveal as="p" delay={0.1} className="max-w-sm text-body md:text-right">
            A toolkit spanning research, AI, design, and the code underneath.
          </Reveal>
        </div>

        <motion.div
          // overflow-x-clip: mid-flip, a card's top edge leans toward the viewer and
          // would otherwise widen the page on phones.
          className="grid gap-4 overflow-x-clip sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ margin: "0px 0px -10% 0px" }}
          style={{ perspective: 1200 }}
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
        >
          {skills.map((group) => (
            <motion.div
              key={group.category}
              variants={card}
              style={{ transformOrigin: "50% 100%" }}
              onPointerMove={trackLens}
              className="lens-surface rounded-2xl border border-line bg-surface/90 p-6 transition-colors duration-500 hover:border-line-strong md:p-8"
            >
              <motion.h3
                variants={focusIn(10, 6)}
                className="font-display text-lg font-medium tracking-tight text-paper md:text-xl"
              >
                {group.category}
              </motion.h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <motion.span
                    key={item}
                    variants={pill}
                    className="rounded-full border border-line px-3 py-1.5 text-sm text-muted transition-colors duration-300 hover:border-line-strong hover:text-paper"
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
