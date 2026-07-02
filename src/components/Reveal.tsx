"use client";

import { Children, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface RevealProps {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
}

/** Fades + lifts a single block into view, once. (Headings, panels, bands.) */
export function Reveal({ children, className, y = 26, delay = 0 }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.99 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * A grid whose children bloom in from the center outward — each scales up with a
 * brief brightness pop as the grid enters view. Ported from the awwwards
 * "OneElementScroll" related-cards reveal (scale-from-0, stagger from center).
 */
export function StaggerGrid({ children, className }: StaggerGridProps) {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);
  const center = (items.length - 1) / 2;

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {items.map((child, i) => {
        const variants: Variants = {
          hidden: { opacity: 0, scale: 0.55, filter: "brightness(150%)" },
          show: {
            opacity: 1,
            scale: 1,
            filter: "brightness(100%)",
            transition: { duration: 0.7, ease: EASE, delay: Math.abs(i - center) * 0.06 },
          },
        };
        return (
          <motion.div key={i} variants={variants} className="h-full">
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
