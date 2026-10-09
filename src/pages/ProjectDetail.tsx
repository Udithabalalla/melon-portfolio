import { useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { projects } from "../data/content";
import { Reveal } from "../components/ui/Reveal";
import { SplitReveal } from "../components/ui/SplitReveal";
import { Magnetic } from "../components/ui/Magnetic";
import { fieldMood } from "../components/field/SignalField";
import { prefersReducedMotion } from "../lib/motion";

const META_LABELS = ["Client", "Role & Contributions", "Timeline", "Tools"] as const;

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];

  // Subtle parallax on the cover as you scroll past it.
  const coverRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: coverRef, offset: ["start end", "end start"] });
  const coverY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ["0%", "0%"] : ["-6%", "6%"]);

  if (!project) return <Navigate to="/" replace />;

  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const meta = [project.client, project.role, project.timeline, project.tools.join(", ")];

  return (
    <article className="relative pb-28 pt-32 md:pb-40" {...fieldMood(0.45, 0.25)}>
      <div className="container-wide">
        <Reveal once>
          <Link
            to="/"
            state={{ scrollTo: "#work" }}
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors duration-300 hover:text-paper"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back to Work
          </Link>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2">
          {project.tags.map((tag, i) => (
            <Reveal key={tag} delay={i * 0.05}>
              <span className="rounded-full border border-line px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-muted">
                {tag}
              </span>
            </Reveal>
          ))}
        </div>

        <SplitReveal
          words={project.title.split(" ")}
          as="h1"
          delay={0.1}
          stagger={0.06}
          className="mt-8 max-w-4xl font-display text-[clamp(2.4rem,7vw,5.5rem)] font-medium leading-[1] tracking-tightest text-balance"
        />

        {/* meta grid */}
        <div className="mt-14 grid grid-cols-2 gap-8 border-y border-line py-8 md:grid-cols-4">
          {META_LABELS.map((label, i) => (
            <Reveal key={label} delay={i * 0.06}>
              <div className="text-xs uppercase tracking-[0.2em] text-muted">
                {label}
              </div>
              <div className="mt-2 text-sm text-paper/90">{meta[i]}</div>
            </Reveal>
          ))}
        </div>

        {/* cover */}
        <Reveal className="mt-14 md:mt-20">
          <div
            ref={coverRef}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl md:aspect-[21/9]"
          >
            <motion.div
              className="absolute inset-0"
              style={{
                y: coverY,
                scale: 1.12,
                background: project.coverImage
                  ? undefined
                  : `linear-gradient(135deg, ${project.cover.from}, ${project.cover.to})`,
              }}
            >
              {project.coverImage ? (
                <img
                  src={project.coverImage}
                  alt={project.cover.text}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-display text-[clamp(2rem,6vw,5rem)] font-semibold text-black/85">
                    {project.cover.text}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </Reveal>

        {/* overview */}
        <div className="mt-20 grid gap-8 md:grid-cols-12">
          <Reveal as="p" className="text-xs uppercase tracking-[0.25em] text-muted md:col-span-3">
            (Overview)
          </Reveal>
          <Reveal
            as="p"
            delay={0.08}
            className="max-w-3xl font-display text-2xl font-light leading-[1.35] tracking-tight text-paper text-balance md:col-span-9 md:text-3xl"
          >
            {project.overview}
          </Reveal>
        </div>

        {/* challenge / approach / results */}
        <div className="mt-20 grid gap-10 border-t border-line pt-14 md:grid-cols-3">
          {[
            { label: "Challenge", body: project.challenge },
            { label: "Approach", body: project.approach },
            { label: "Results", body: project.results },
          ].map((block, i) => (
            <Reveal key={block.label} delay={i * 0.08}>
              <h3 className="font-display text-lg font-medium tracking-tight md:text-xl">
                {block.label}
              </h3>
              <p className="mt-4 text-muted">{block.body}</p>
            </Reveal>
          ))}
        </div>

        {/* deep-dive sections */}
        <div className="mt-20 space-y-16 border-t border-line pt-14 md:mt-28 md:space-y-20">
          {project.sections.map((section) => (
            <div key={section.heading} className="grid gap-6 md:grid-cols-12">
              <Reveal
                as="h3"
                className="font-display text-sm uppercase tracking-[0.2em] text-muted md:col-span-3"
              >
                {section.heading}
              </Reveal>
              <div className="md:col-span-9">
                <Reveal
                  as="p"
                  delay={0.08}
                  className="max-w-2xl text-lg leading-relaxed text-paper/90"
                >
                  {section.body}
                </Reveal>
                {section.image && (
                  <Reveal delay={0.12} className="mt-8">
                    <img
                      src={section.image}
                      alt={section.imageAlt ?? section.heading}
                      loading="lazy"
                      className="w-full rounded-2xl border border-line"
                    />
                  </Reveal>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* prev / next */}
        <div className="mt-28 grid gap-4 border-t border-line pt-14 sm:grid-cols-2">
          <Magnetic className="w-full">
            <Link
              to={`/work/${prev.slug}`}
              className="group flex w-full flex-col gap-2 rounded-2xl border border-line p-6 transition-colors duration-300 hover:border-paper/30"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                ← Previous
              </span>
              <span className="font-display text-2xl font-medium tracking-tight">
                {prev.title}
              </span>
            </Link>
          </Magnetic>
          <Magnetic className="w-full">
            <Link
              to={`/work/${next.slug}`}
              className="group flex w-full flex-col gap-2 rounded-2xl border border-line p-6 text-right transition-colors duration-300 hover:border-paper/30"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                Next →
              </span>
              <span className="font-display text-2xl font-medium tracking-tight">
                {next.title}
              </span>
            </Link>
          </Magnetic>
        </div>
      </div>
    </article>
  );
}
