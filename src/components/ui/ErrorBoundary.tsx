import { Component, type ReactNode } from "react";

/**
 * Minimal error boundary. Used to isolate the site's canvas particle field so
 * a rendering failure degrades to a plain background instead of taking down
 * the whole page.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.warn("Particle field failed, using fallback:", error);
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
