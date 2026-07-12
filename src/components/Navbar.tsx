import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import { nav, site } from "../data/content";
import { scrollToHash } from "../hooks/useSmoothScroll";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { useTheme } from "../theme";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface/60 text-paper backdrop-blur-md transition-colors duration-300 hover:bg-surface"
    >
      <span className="relative block h-4 w-4">
        <FiSun
          className={`absolute inset-0 h-4 w-4 transition-all duration-500 ease-expo ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
        <FiMoon
          className={`absolute inset-0 h-4 w-4 transition-all duration-500 ease-expo ${
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
      </span>
    </button>
  );
}

export function Navbar() {
  const [active, setActive] = useState<string>("#about");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    // Animate the bar in on first load only.
    gsap.fromTo(
      "[data-nav]",
      { y: -60, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1, ease: "expo.out", delay: 0.2 }
    );
  }, []);

  useEffect(() => {
    // Track which section is in view for the active link + shrink the bar.
    // Section triggers only make sense on the home page — on a project
    // detail page there's nothing in `nav` to highlight.
    if (!isHome) {
      setActive("");
    }

    const triggers = isHome
      ? nav.map((item) =>
          ScrollTrigger.create({
            trigger: item.href,
            start: "top 45%",
            end: "bottom 45%",
            onToggle: (self) => self.isActive && setActive(item.href),
          })
        )
      : [];

    const st = ScrollTrigger.create({
      start: "top -80",
      end: 99999,
      onUpdate: (self) => setScrolled(self.scroll() > 40),
    });

    return () => {
      triggers.forEach((t) => t.kill());
      st.kill();
    };
  }, [isHome]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (isHome) {
      scrollToHash(href);
    } else {
      navigate("/", { state: { scrollTo: href } });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      scrollToHash("#top");
    }
    // else: let the Link navigate to "/" normally
  };

  return (
    <header
      data-nav
      className="fixed inset-x-0 top-0 z-50 will-change-transform"
      style={{ opacity: 0 }}
    >
      <div
        className={`container-wide flex items-center justify-between transition-all duration-500 ease-expo ${
          scrolled ? "py-4" : "py-6"
        }`}
      >
        <Link
          to="/"
          onClick={handleLogoClick}
          className="group flex items-center gap-2 font-display text-sm font-medium tracking-tight"
        >
          <span className="text-paper">✦</span>
          <span>{site.owner}</span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 rounded-full border border-line bg-surface/60 p-1 backdrop-blur-md">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative rounded-full px-4 py-1.5 text-sm transition-colors duration-300 ${
                  active === item.href ? "text-ink" : "text-muted hover:text-paper"
                }`}
              >
                {active === item.href && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-paper" />
                )}
                {item.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
