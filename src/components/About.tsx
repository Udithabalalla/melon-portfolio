import { about } from "../data/content";
import { Reveal } from "./ui/Reveal";
import { SplitReveal } from "./ui/SplitReveal";
import { Marquee } from "./ui/Marquee";

export function About() {
  return (
    <section id="about" className="relative py-28 md:py-40">
      <Marquee
        items={about.capabilities}
        className="mb-24 border-y border-line py-5 font-display text-2xl text-muted/80 md:text-4xl"
      />

      <div className="container-wide grid gap-12 md:grid-cols-12">
        <Reveal
          as="p"
          className="text-xs uppercase tracking-[0.25em] text-muted md:col-span-3"
        >
          ({about.label})
        </Reveal>

        <div className="md:col-span-9">
          <SplitReveal
            words={about.body.split(" ")}
            as="p"
            stagger={0.012}
            className="max-w-4xl font-display text-2xl font-light leading-[1.25] tracking-tight text-paper text-balance md:text-4xl"
          />

          <div className="mt-16 grid grid-cols-2 gap-8 border-t border-line pt-10 sm:grid-cols-3">
            {about.stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08}>
                <div className="font-display text-4xl font-medium tracking-tight md:text-6xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted">{stat.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
