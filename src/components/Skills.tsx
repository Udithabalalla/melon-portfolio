import { useLayoutEffect, useRef } from "react";
import { skills } from "../data/content";
import { Reveal } from "./ui/Reveal";
import { gsap } from "../lib/gsap";

function SkillGroupCard({
  category,
  items,
  index,
}: {
  category: string;
  items: string[];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-pill]"),
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "expo.out",
          stagger: 0.035,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <Reveal delay={index * 0.06} className="rounded-2xl border border-line p-6 md:p-8">
      <div ref={ref}>
        <h3 className="font-display text-lg font-medium tracking-tight text-paper md:text-xl">
          {category}
        </h3>
        <div className="mt-5 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              data-pill
              className="rounded-full border border-line px-3 py-1.5 text-sm text-muted transition-colors duration-300 hover:border-paper/30 hover:text-paper"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export function Skills() {
  return (
    <section id="skills" className="relative py-28 md:py-40">
      <div className="container-wide">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal
            as="h2"
            className="font-display text-[clamp(2.2rem,6vw,5rem)] font-medium tracking-tightest"
          >
            Skills
          </Reveal>
          <Reveal as="p" delay={0.1} className="max-w-sm text-muted md:text-right">
            A toolkit spanning delivery, analysis, design, and the code underneath.
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, i) => (
            <SkillGroupCard key={group.category} index={i} {...group} />
          ))}
        </div>
      </div>
    </section>
  );
}
