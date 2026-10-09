import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { FiMoon, FiSun, FiX, FiMenu } from "react-icons/fi";
import { nav, site } from "../data/content";
import { scrollToHash } from "../hooks/useSmoothScroll";
import { EASE, SPRINGS } from "../lib/motion";
import { useTheme } from "../theme";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface/60 text-paper backdrop-blur-md transition-colors duration-300 hover:bg-surface"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, scale: 0, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0, opacity: 0 }}
          transition={SPRINGS.snappy}
          className="block"
        >
          {isDark ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export function Navbar() {
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  // Shrink once scrolled; tuck away while scrolling down, return on the way up.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    if (Math.abs(y - prev) > 4) setHidden(y > prev && y > 480);
  });

  // Highlight the section crossing a line 45% down the viewport.
  useEffect(() => {
    setActive("");
    if (!isHome) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -55% 0px" }
    );
    for (const item of nav) {
      const el = document.querySelector(item.href);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [isHome]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
      <motion.header
        className="fixed inset-x-0 top-0 z-[60]"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: hidden && !menuOpen ? "-110%" : 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay: hidden ? 0 : 0.05 }}
      >
        <div
          className={`container-wide flex items-center justify-between transition-[padding] duration-500 ease-expo ${
            scrolled ? "py-4" : "py-6"
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="group flex items-center gap-2 font-display text-sm font-medium tracking-tight"
          >
            <span className="inline-block text-paper transition-transform duration-700 ease-expo group-hover:rotate-180">
              ✦
            </span>
            <span>{site.owner}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-2 md:flex">
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
                    <motion.span
                      layoutId="nav-active"
                      transition={SPRINGS.snappy}
                      className="absolute inset-0 -z-10 rounded-full bg-paper"
                    />
                  )}
                  {item.label}
                </a>
              ))}
            </nav>
            <ThemeToggle />
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
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
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Mobile drawer */}
            <motion.div
              key="drawer"
              className="fixed right-0 top-0 z-50 h-full w-72 max-w-[80vw] border-l border-line bg-ink/95 backdrop-blur-xl md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <motion.div
                className="flex h-full flex-col px-6 pb-10 pt-24"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } } }}
              >
                <nav className="flex flex-col gap-1">
                  {nav.map((item) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      variants={{
                        hidden: { opacity: 0, x: 24, filter: "blur(6px)" },
                        show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
                      }}
                      className={`relative flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-colors duration-200 ${
                        active === item.href
                          ? "bg-paper text-ink"
                          : "text-muted hover:bg-surface hover:text-paper"
                      }`}
                    >
                      <span>{item.label}</span>
                      {active === item.href && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
                    </motion.a>
                  ))}
                </nav>

                <div className="mt-auto border-t border-line pt-6 text-xs text-muted">
                  {site.owner} · {new Date().getFullYear()}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
