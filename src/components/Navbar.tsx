import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMoon, FiSun, FiX, FiMenu } from "react-icons/fi";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Animate drawer in/out
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    if (menuOpen) {
      gsap.fromTo(
        drawer,
        { x: "100%", autoAlpha: 0 },
        { x: "0%", autoAlpha: 1, duration: 0.4, ease: "expo.out" }
      );
    } else {
      gsap.to(drawer, { x: "100%", autoAlpha: 0, duration: 0.3, ease: "expo.in" });
    }
  }, [menuOpen]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
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
    <>
      <header
        data-nav
        className="fixed inset-x-0 top-0 z-[60] will-change-transform"
        style={{ opacity: 0 }}
      >
        <div
          className={`container-wide flex items-center justify-between transition-all duration-500 ease-expo ${
            scrolled ? "py-4" : "py-6"
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="group flex items-center gap-2 font-display text-sm font-medium tracking-tight"
          >
            <span className="text-paper">✦</span>
            <span>{site.owner}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface/60 text-paper backdrop-blur-md transition-colors duration-300 hover:bg-surface"
            >
              {menuOpen ? <FiX className="h-4 w-4" /> : <FiMenu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 z-50 h-full w-72 max-w-[80vw] border-l border-line bg-ink/95 backdrop-blur-xl md:hidden"
        style={{ transform: "translateX(100%)", opacity: 0 }}
        aria-hidden={!menuOpen}
      >
        <div className="flex h-full flex-col px-6 pt-24 pb-10">
          <nav className="flex flex-col gap-1">
            {nav.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                style={{ transitionDelay: menuOpen ? `${i * 40}ms` : "0ms" }}
                className={`relative flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-colors duration-200 ${
                  active === item.href
                    ? "bg-paper text-ink"
                    : "text-muted hover:bg-surface hover:text-paper"
                }`}
              >
                <span>{item.label}</span>
                {active === item.href && (
                  <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                )}
              </a>
            ))}
          </nav>

          <div className="mt-auto border-t border-line pt-6 text-xs text-muted">
            {site.owner} · {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </>
  );
}
