import { careerInterests, education, experience } from "../data/content";
import { Reveal } from "./ui/Reveal";

export function Experience() {
  return (
    <section id="experience" className="relative py-28 md:py-40">
      <div className="container-wide">
        <Reveal
          as="h2"
          className="mb-16 font-display text-[clamp(2.2rem,6vw,5rem)] font-medium tracking-tightest"
        >
          Experience &amp; Education
        </Reveal>

        <div className="grid gap-16 lg:grid-cols-12">
          {/* Experience timeline */}
          <div className="lg:col-span-7">
            <Reveal
              as="p"
              className="mb-6 text-xs uppercase tracking-[0.25em] text-muted"
            >
              Experience
            </Reveal>

            <div className="space-y-10 border-l border-line pl-8">
              {experience.map((role, i) => (
                <Reveal key={role.role} delay={i * 0.08} className="relative">
                  <span className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-paper" />
                  <h3 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
                    {role.role}
                  </h3>
                  <div className="mt-1 text-sm text-muted">
                    {role.org}
                    {role.period ? ` · ${role.period}` : ""}
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {role.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-muted">
                        <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-muted" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Education + career interests */}
          <div className="lg:col-span-5">
            <Reveal
              as="p"
              className="mb-6 text-xs uppercase tracking-[0.25em] text-muted"
            >
              Education
            </Reveal>

            <div className="space-y-6 border-l border-line pl-8">
              {education.map((entry, i) => (
                <Reveal key={entry.title} delay={i * 0.08} className="relative">
                  <span className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-muted" />
                  <h4 className="font-display text-lg font-medium tracking-tight md:text-xl">
                    {entry.title}
                  </h4>
                  {entry.subtitle && (
                    <div className="mt-1 text-sm text-muted">{entry.subtitle}</div>
                  )}
                </Reveal>
              ))}
            </div>

            <Reveal
              as="p"
              delay={0.15}
              className="mb-4 mt-14 text-xs uppercase tracking-[0.25em] text-muted"
            >
              Career Interests
            </Reveal>
            <Reveal delay={0.2} className="flex flex-wrap gap-2">
              {careerInterests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-muted"
                >
                  {interest}
                </span>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
