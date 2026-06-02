"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsap } from "./useGsap";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-driven parallax + optional scale for a layer. Moves the wrapped
 * content at a different speed than the page for layered depth.
 * GPU-friendly (transform only). No-op under reduced motion.
 */
export function Parallax({
  children,
  speed = 14,
  scaleFrom,
  className = "",
}: {
  children: ReactNode;
  /** yPercent travelled across the viewport pass. Positive = moves up faster. */
  speed?: number;
  /** if set, scales from this value to 1 across the scroll pass */
  scaleFrom?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const el = ref.current!;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
      tl.fromTo(el, { yPercent: speed }, { yPercent: -speed, ease: "none" }, 0);
      if (scaleFrom != null) {
        tl.fromTo(el, { scale: scaleFrom }, { scale: 1, ease: "none" }, 0);
      }
    });
  }, ref);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
