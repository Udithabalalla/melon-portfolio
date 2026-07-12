import { useState } from "react";
import { contact, site } from "../data/content";
import { SplitReveal } from "./ui/SplitReveal";
import { Reveal } from "./ui/Reveal";
import { Magnetic } from "./ui/Magnetic";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section id="contact" className="relative py-28 md:py-40">
      <div className="container-wide">
        <Reveal as="p" className="mb-8 text-xs uppercase tracking-[0.25em] text-muted">
          ({contact.label})
        </Reveal>

        <SplitReveal
          words={contact.heading.split(" ")}
          as="h2"
          stagger={0.05}
          className="max-w-[14ch] font-display text-[clamp(2.6rem,8vw,7rem)] font-medium leading-[0.98] tracking-tightest text-balance"
        />

        <Reveal as="p" delay={0.1} className="mt-8 max-w-lg text-lg text-muted">
          {contact.body}
        </Reveal>

        <div className="mt-14">
          <Magnetic>
            <button
              onClick={copyEmail}
              className="group inline-flex items-center gap-4 rounded-full bg-paper px-8 py-5 font-display text-lg font-medium text-ink transition-transform"
            >
              {copied ? "Copied!" : site.email}
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 ease-expo group-hover:rotate-45">
                ↗
              </span>
            </button>
          </Magnetic>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {contact.socials.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-full flex-col justify-between gap-8 bg-ink p-6 transition-colors duration-300 hover:bg-surface"
              >
                <span className="text-xs uppercase tracking-[0.2em] text-muted">
                  {s.label}
                </span>
                <span className="text-sm text-paper/90">{s.handle}</span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal
          as="p"
          delay={0.3}
          className="mx-auto mt-20 max-w-2xl text-balance text-center font-serif text-2xl italic text-muted md:text-3xl"
        >
          "{contact.quote}"
        </Reveal>
      </div>
    </section>
  );
}
