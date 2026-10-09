import { MotionConfig, motion } from "motion/react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useRouteScrollFix } from "./hooks/useRouteScrollFix";
import { EASE, prefersReducedMotion } from "./lib/motion";
import { useTheme } from "./theme";
import { SignalField } from "./components/field/SignalField";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Navbar } from "./components/Navbar";
import { ScrollProgress } from "./components/ScrollProgress";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { ProjectDetail } from "./pages/ProjectDetail";

export default function App() {
  useSmoothScroll();
  useRouteScrollFix();
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
      <div className="grain relative">
        {/* One particle field behind every page, so it persists across routes.
            100lvh keeps it from resizing as mobile browser bars show and hide. */}
        <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100lvh]">
          <ErrorBoundary>
            <SignalField className="h-full w-full" theme={theme} />
          </ErrorBoundary>
        </div>

        <ScrollProgress />
        <Navbar />
        <main>
          {/* Each page comes into focus as you arrive on it. */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, filter: "blur(12px)" }}
            animate={{ opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/work/:slug" element={<ProjectDetail />} />
            </Routes>
          </motion.div>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
