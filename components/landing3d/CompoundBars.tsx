"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsap } from "./useGsap";

gsap.registerPlugin(ScrollTrigger);

/* Compounding savings over 10 years (illustrative). */
const YEARS = Array.from({ length: 10 }, (_, i) => {
  const principalPerYear = 6000;
  const rate = 0.07;
  let bal = 0;
  for (let y = 0; y <= i; y++) bal = (bal + principalPerYear) * (1 + rate);
  return Math.round(bal);
});
const MAX = YEARS[YEARS.length - 1];

export function CompoundBars() {
  const root = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useGsap(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const bars = gsap.utils.toArray<HTMLElement>(".cb-bar");
        gsap.set(bars, { scaleY: 0, transformOrigin: "bottom" });

        const counter = { val: 0 };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            end: "bottom 45%",
            scrub: 1,
          },
        });

        tl.to(bars, { scaleY: 1, ease: "none", stagger: 0.12 }, 0).to(
          counter,
          {
            val: MAX,
            ease: "none",
            onUpdate: () => {
              if (numRef.current)
                numRef.current.textContent =
                  "$" + Math.round(counter.val).toLocaleString("en-US");
            },
          },
          0
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".cb-bar", { scaleY: 1, transformOrigin: "bottom" });
        if (numRef.current) numRef.current.textContent = "$" + MAX.toLocaleString("en-US");
      });
    },
    root
  );

  return (
    <div ref={root} className="card-premium p-6 sm:p-8">
      <div className="flex items-baseline justify-between mb-6">
        <span className="text-sm font-medium text-muted">Projected savings · 10 yrs</span>
        <span ref={numRef} className="balance-num text-2xl sm:text-3xl font-semibold tracking-tight text-gradient">
          $0
        </span>
      </div>
      <div className="flex items-end gap-2 sm:gap-3 h-48">
        {YEARS.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="cb-bar w-full rounded-t-lg"
              style={{
                height: `${(v / MAX) * 100}%`,
                background:
                  "linear-gradient(180deg,#2bd4a4 0%,#8b7bff 60%,#2f6bff 100%)",
              }}
            />
            <span className="text-[10px] text-muted">Y{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
