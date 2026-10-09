import { useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { careerInterests, education, experience } from "../data/content";
import { EASE, SPRINGS, prefersReducedMotion } from "../lib/motion";
import { storyScene } from "./story/story";
import { Reveal } from "./ui/Reveal";
import { SplitReveal } from "./ui/SplitReveal";
import { SectionIntro } from "./ui/SectionIntro";

/**
 * A vertical timeline whose line draws itself as you scroll through it.
 * Each entry's marker "locks in" as it arrives, like a particle settling.
 */
function Timeline({ children, gap }: { children: ReactNode; gap: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className={`relative pl-8 ${gap}`}>
      <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-line" />
      <motion.span
        aria-hidden
        style={{ scaleY: prefersReducedMotion ? 1 : scaleY }}
        className="absolute bottom-0 left-0 top-0 w-px origin-top bg-gradient-to-b from-cyan-400 via-blue-500 to-violet-400"
      />
      {children}
    </div>
  );
}

function Marker({ strong = false }: { strong?: boolean }) {
  return (
    <motion.span
      aria-hidden
      className={`absolute -left-[calc(2rem+4.5px)] top-2 h-2.5 w-2.5 rounded-full ${
        strong ? "bg-paper" : "bg-muted"
      }`}
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ margin: "0px 0px -45% 0px" }}
      transition={SPRINGS.snappy}
    >
      {strong && (
        <motion.span
          className="absolute inset-0 rounded-full bg-blue-400"
          initial={{ scale: 1, opacity: 0.6 }}
          whileInView={{ scale: 3.2, opacity: 0 }}
          viewport={{ margin: "0px 0px -45% 0px" }}
          transition={{ duration: 1.2, ease: EASE }}
        />
      )}
    </motion.span>
  );
}

export function Experience() {
  return (
    <section id="experience" className="relative py-28 md:py-40" {...storyScene(3)}>
      <div className="container-wide">
        <SectionIntro index="03" label="Career" className="mb-8" />
        <SplitReveal
          words={["Experience", "&", "Education"]}
          as="h2"
          className="mb-16 font-display text-[clamp(2.2rem,6vw,5rem)] font-medium tracking-tightest"
        />

        <div className="grid gap-16 lg:grid-cols-12">
          {/* Experience timeline */}
          <div className="lg:col-span-7">
            <Reveal as="p" className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">
              Experience
            </Reveal>

            <Timeline gap="space-y-12">
              {experience.map((role) => (
                <div key={role.role + role.org} className="relative">
                  <Marker strong />
                  <Reveal>
                    <h3 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
                      {role.role}
                    </h3>
                    <div className="mt-1 text-sm text-muted">
                      {role.org}
                      {role.period ? ` · ${role.period}` : ""}
                    </div>
                  </Reveal>
                  <motion.ul
                    className="mt-5 space-y-2.5"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ margin: "0px 0px -15% 0px" }}
                    variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
                  >
                    {role.bullets.map((bullet) => (
                      <motion.li
                        key={bullet}
                        className="flex gap-3 text-muted"
                        variants={{
                          hidden: { opacity: 0, x: -12 },
                          show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
                        }}
                      >
                        <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-muted" />
                        <span>{bullet}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              ))}
            </Timeline>
          </div>

          {/* Education + career interests */}
          <div className="lg:col-span-5">
            <Reveal as="p" className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">
              Education
            </Reveal>

            <Timeline gap="space-y-6">
              {education.map((entry) => (
                <div key={entry.title} className="relative">
                  <Marker />
                  <Reveal y={20}>
                    <h4 className="font-display text-lg font-medium tracking-tight md:text-xl">
                      {entry.title}
                    </h4>
                    {entry.subtitle && <div className="mt-1 text-sm text-muted">{entry.subtitle}</div>}
                  </Reveal>
                </div>
              ))}
            </Timeline>

            <Reveal as="p" delay={0.15} className="mb-4 mt-14 text-xs uppercase tracking-[0.25em] text-muted">
              Career Interests
            </Reveal>
            <motion.div
              className="flex flex-wrap gap-2"
              initial="hidden"
              whileInView="show"
              viewport={{ margin: "0px 0px -10% 0px" }}
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              {careerInterests.map((interest) => (
                <motion.span
                  key={interest}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9, filter: "blur(6px)" },
                    show: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
                  }}
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-muted"
                >
                  {interest}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
