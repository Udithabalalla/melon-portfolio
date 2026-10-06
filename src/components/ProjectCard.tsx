import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../data/content";
import { gsap, prefersReducedMotion } from "../lib/gsap";
import { Magnetic } from "./ui/Magnetic";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal the cover with a clip-path wipe + the meta row rising.
      gsap.fromTo(
        mediaRef.current,
        { clipPath: "inset(12% 8% round 24px)", scale: 1.06 },
        {
          clipPath: "inset(0% 0% round 24px)",
          scale: 1,
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        labelRef.current?.children ?? [],
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Parallax the inner image as the card travels through the viewport.
      if (!prefersReducedMotion) {
        gsap.to("[data-cover-inner]", {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, cardRef);
    return () => ctx.revert();
  }, []);

  return (
    <article ref={cardRef} className="group">
      <div
        ref={mediaRef}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl md:aspect-[16/8]"
        style={{ clipPath: "inset(12% 8% round 24px)" }}
      >
        {/* Real cover image when provided, otherwise a gradient placeholder. */}
        <div
          data-cover-inner
          className="absolute inset-0 scale-110"
          style={
            project.coverImage
              ? undefined
              : {
                  background: `linear-gradient(135deg, ${project.cover.from}, ${project.cover.to})`,
                }
          }
        >
          {project.coverImage ? (
            <img
              src={project.coverImage}
              alt={project.cover.text}
              loading="lazy"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-[clamp(2rem,7vw,6rem)] font-semibold text-black/85">
                {project.cover.text}
              </span>
            </div>
          )}
        </div>

        {/* hover tools chip row */}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-5 opacity-0 transition-opacity duration-500 ease-expo group-hover:opacity-100">
          {project.tools.map((tool) => (
            <span
              key={tool}
              className="rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-black/90 backdrop-blur-sm"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      <div
        ref={labelRef}
        className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            {String(index + 1).padStart(2, "0")} — {project.category}
          </span>
          <h3 className="mt-2 font-display text-3xl font-medium tracking-tight md:text-5xl">
            {project.title}
          </h3>
        </div>
        <div className="max-w-md md:text-right">
          <p className="text-muted">{project.description}</p>
          <div className="mt-3 text-sm text-paper/80">
            {project.role} · {project.year}
          </div>
          <div className="mt-5 md:flex md:justify-end">
            <Magnetic>
              <Link
                to={`/work/${project.slug}`}
                className="group/link inline-flex items-center gap-2 text-sm font-medium text-paper"
              >
                Read More
                <span className="grid h-6 w-6 place-items-center rounded-full border border-line transition-transform duration-500 ease-expo group-hover/link:translate-x-0.5 group-hover/link:rotate-45">
                  ↗
                </span>
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>
    </article>
  );
}
