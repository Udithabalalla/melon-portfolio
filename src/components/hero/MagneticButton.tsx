import { useRef, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { prefersReducedMotion } from "../../lib/motion";

const SPRING = { stiffness: 260, damping: 18, mass: 0.5 };

/** A pill link that leans toward the cursor and springs back on leave. */
export function MagneticButton({
  href,
  children,
  variant = "primary",
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  const onMove = (e: PointerEvent) => {
    if (prefersReducedMotion || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.28);
    y.set((e.clientY - r.top - r.height / 2) * 0.4);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const styles =
    variant === "primary"
      ? "bg-paper text-ink"
      : "border border-line text-paper hover:border-paper/40";

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center gap-3 rounded-full py-2.5 pl-6 pr-2.5 text-sm font-medium transition-colors duration-300 ${styles}`}
    >
      {children}
      <motion.span
        variants={{ rest: { rotate: -45, scale: 1 }, hover: { rotate: 0, scale: 1.08 } }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className={`grid h-8 w-8 place-items-center rounded-full text-base ${
          variant === "primary" ? "bg-ink/10" : "bg-paper/10"
        }`}
        aria-hidden
      >
        →
      </motion.span>
    </motion.a>
  );
}
