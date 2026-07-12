import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { Skills } from "../components/Skills";
import { Experience } from "../components/Experience";
import { Projects } from "../components/Projects";
import { Contact } from "../components/Contact";
import { scrollToHash } from "../hooks/useSmoothScroll";

export function Home() {
  const location = useLocation();

  useEffect(() => {
    // Support navigating here from another route with a target section,
    // e.g. Navbar links clicked while on a /work/:slug page.
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) return;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => scrollToHash(target))
    );
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Contact />
    </>
  );
}
