import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { site } from "../data/content";
import { scrollToHash } from "../hooks/useSmoothScroll";
import { EASE } from "../lib/motion";

export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const backToTop = () => {
    if (isHome) {
      scrollToHash("#top");
    } else {
      navigate("/", { state: { scrollTo: "#top" } });
    }
  };

  return (
    <motion.footer
      className="border-t border-line py-10"
      data-quiet
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: EASE }}
    >
      <div className="container-wide flex flex-col items-center justify-between gap-6 text-sm text-muted md:flex-row">
        <span>
          © {new Date().getFullYear()} {site.owner}. {site.location}.
        </span>
        <button onClick={backToTop} className="group inline-flex items-center gap-2 transition-colors hover:text-paper">
          Back to top
          <span className="inline-block transition-transform duration-500 ease-expo group-hover:-translate-y-1">↑</span>
        </button>
        <span className="font-display">Designed &amp; built with care.</span>
      </div>
    </motion.footer>
  );
}
