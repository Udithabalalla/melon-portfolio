import type { PointerEvent } from "react";

/**
 * Pointer handler for `.lens-surface` elements: tracks the cursor so the
 * surface's soft glow follows it (see `.lens-surface` in index.css).
 */
export function trackLens(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--lx", `${e.clientX - rect.left}px`);
  el.style.setProperty("--ly", `${e.clientY - rect.top}px`);
}
