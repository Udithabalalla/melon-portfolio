import { motion } from "motion/react";
import { about } from "../data/content";
import { EASE } from "../lib/motion";
import { fieldMood } from "./field/SignalField";
import { Reveal } from "./ui/Reveal";
import { Marquee } from "./ui/Marquee";
import { SectionIntro } from "./ui/SectionIntro";
import { ScrollWords } from "./ui/ScrollWords";
import { CountUp } from "./ui/CountUp";

export function About() {
  return (
    <section id="about" className="relative py-28 md:py-40" {...fieldMood(0.55, 0.08)}>
      <Marquee
        items={about.capabilities}
        className="mb-24 border-y border-line py-5 font-display text-2xl text-muted/80 md:text-4xl"
      />

      <div className="container-wide grid gap-12 md:grid-cols-12">
        <SectionIntro index="01" label={about.label} className="md:col-span-3 md:self-start" />

        <div className="md:col-span-9">
          <ScrollWords
            text={about.body}
            className="max-w-4xl font-display text-2xl font-light leading-[1.25] tracking-tight text-paper text-balance md:text-4xl"
          />

          <div className="relative mt-16 grid grid-cols-2 gap-8 pt-10 sm:grid-cols-3">
            <motion.span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px origin-left bg-line"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 1.4, ease: EASE }}
            />
            {about.stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.1}>
                <CountUp
                  value={stat.value}
                  className="font-display text-4xl font-medium tracking-tight md:text-6xl"
                />
                <div className="mt-2 text-sm text-muted">{stat.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
