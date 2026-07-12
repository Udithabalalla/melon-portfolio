import { useLocation, useNavigate } from "react-router-dom";
import { site } from "../data/content";
import { scrollToHash } from "../hooks/useSmoothScroll";

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
    <footer className="border-t border-line py-10">
      <div className="container-wide flex flex-col items-center justify-between gap-6 text-sm text-muted md:flex-row">
        <span>
          © {new Date().getFullYear()} {site.owner}. {site.location}.
        </span>
        <button onClick={backToTop} className="transition-colors hover:text-paper">
          Back to top ↑
        </button>
        <span className="font-display">Designed &amp; built with care.</span>
      </div>
    </footer>
  );
}
