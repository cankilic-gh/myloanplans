"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/* Generic on-scroll reveal (fade + rise). Respects reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/* Word-by-word staggered headline reveal. Splits on spaces into spans. */
export function WordsReveal({
  text,
  className = "",
  highlight,
  delay = 0,
}: {
  text: string;
  className?: string;
  highlight?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.045, delayChildren: delay } },
  };
  const word: Variants = {
    hidden: { opacity: 0, y: "0.5em" },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  if (reduce) {
    return (
      <span className={className}>
        {words.map((w, i) =>
          w === highlight ? (
            <span key={i} className="text-gradient">{w} </span>
          ) : (
            <span key={i}>{w} </span>
          )
        )}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      style={{ display: "inline" }}
    >
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
          <motion.span
            variants={word}
            style={{ display: "inline-block" }}
            className={w === highlight ? "text-gradient" : undefined}
          >
            {w}
          </motion.span>
          {" "}
        </span>
      ))}
    </motion.span>
  );
}
