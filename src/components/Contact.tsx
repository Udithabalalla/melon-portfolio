import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { contact, site } from "../data/content";
import { EASE, SPRINGS } from "../lib/motion";
import { storyScene } from "./story/story";
import { ScrambleText } from "./ui/ScrambleText";
import { Reveal } from "./ui/Reveal";
import { Magnetic } from "./ui/Magnetic";
import { SectionIntro } from "./ui/SectionIntro";
import { trackLens } from "./ui/lens";

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
    // The finale: the particles spell "hello." while the heading decodes itself.
    <section id="contact" className="relative py-28 md:py-40" {...storyScene(5)}>
      <div className="container-wide">
        <SectionIntro index="05" label={contact.label} className="mb-8" />

        <ScrambleText
          text={contact.heading}
          className="max-w-[14ch] font-display text-[clamp(2.6rem,8vw,7rem)] font-medium leading-[0.98] tracking-tightest text-balance"
        />

        <Reveal as="p" delay={0.1} quiet className="mt-8 max-w-lg text-lg text-body">
          {contact.body}
        </Reveal>

        <Reveal delay={0.2} className="mt-14">
          <Magnetic>
            <motion.button
              onClick={copyEmail}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-4 rounded-full bg-paper py-4 pl-8 pr-4 font-display text-lg font-medium text-ink"
            >
              {/* Both labels share one grid cell; invisible copies hold the width steady. */}
              <span className="relative grid overflow-hidden">
                <span aria-hidden className="invisible col-start-1 row-start-1">
                  {site.email}
                </span>
                <span aria-hidden className="invisible col-start-1 row-start-1">
                  Copied to clipboard
                </span>
                <AnimatePresence initial={false}>
                  <motion.span
                    key={copied ? "copied" : "email"}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={SPRINGS.snappy}
                    className="col-start-1 row-start-1"
                  >
                    {copied ? "Copied to clipboard" : site.email}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 ease-expo group-hover:rotate-45">
                ↗
              </span>
            </motion.button>
          </Magnetic>
        </Reveal>

        <motion.div
          className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ margin: "0px 0px -10% 0px" }}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        >
          {contact.socials.map((s) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              onPointerMove={trackLens}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
              }}
              className="lens-surface group/social flex h-full flex-col justify-between gap-8 bg-ink p-6"
            >
              <span className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted">
                {s.label}
                <span className="translate-y-1 opacity-0 transition-all duration-500 ease-expo group-hover/social:translate-y-0 group-hover/social:opacity-100">
                  ↗
                </span>
              </span>
              <span className="text-sm text-body">{s.handle}</span>
            </motion.a>
          ))}
        </motion.div>

        <Reveal
          as="p"
          delay={0.2}
          quiet
          className="mx-auto mt-20 max-w-2xl text-balance text-center font-serif text-2xl italic text-body md:text-3xl"
        >
          "{contact.quote}"
        </Reveal>
      </div>
    </section>
  );
}
