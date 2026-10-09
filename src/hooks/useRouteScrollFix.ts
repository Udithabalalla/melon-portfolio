import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import type Lenis from "lenis";

/**
 * On every route change (except the very first mount), jump scroll back to
 * the top. Without this, navigating to /work/:slug and back leaves you
 * mid-scroll on the new page.
 */
export function useRouteScrollFix() {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);
}
