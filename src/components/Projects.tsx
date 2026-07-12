import { projects } from "../data/content";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./ui/Reveal";

export function Projects() {
  return (
    <section id="work" className="relative py-28 md:py-40">
      <div className="container-wide">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal as="h2" className="font-display text-[clamp(2.2rem,6vw,5rem)] font-medium tracking-tightest">
            Selected Work
          </Reveal>
          <Reveal as="p" delay={0.1} className="max-w-sm text-muted md:text-right">
            A few projects spanning product strategy, research, and end-to-end design.
          </Reveal>
        </div>

        <div className="flex flex-col gap-24 md:gap-36">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
