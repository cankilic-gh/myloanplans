"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsap } from "./useGsap";

gsap.registerPlugin(ScrollTrigger);

const SEGMENTS = [
  { label: "Housing", value: 34, color: "#2f6bff" },
  { label: "Food", value: 18, color: "#8b7bff" },
  { label: "Transport", value: 14, color: "#2bd4a4" },
  { label: "Savings", value: 20, color: "#f7b955" },
  { label: "Other", value: 14, color: "#ff6b8b" },
];

const R = 70;
const C = 2 * Math.PI * R;

export function BudgetDonut() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const arcs = gsap.utils.toArray<SVGCircleElement>(".donut-arc");
        const chips = gsap.utils.toArray<HTMLElement>(".cat-chip");

        gsap.set(arcs, { strokeDashoffset: C });
        gsap.set(chips, { y: 16, opacity: 0 });

        ScrollTrigger.create({
          trigger: root.current,
          start: "top 72%",
          once: true,
          onEnter: () => {
            const tl = gsap.timeline();
            let offset = 0;
            arcs.forEach((arc, i) => {
              const frac = SEGMENTS[i].value / 100;
              tl.to(
                arc,
                {
                  strokeDashoffset: C - C * frac,
                  duration: 0.7,
                  ease: "power2.out",
                },
                i === 0 ? 0 : "-=0.45"
              );
              offset += frac;
            });
            tl.to(
              chips,
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: "power2.out" },
              0.2
            );
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.utils.toArray<SVGCircleElement>(".donut-arc").forEach((arc, i) => {
          arc.style.strokeDashoffset = String(C - C * (SEGMENTS[i].value / 100));
        });
        gsap.set(".cat-chip", { y: 0, opacity: 1 });
      });
    },
    root
  );

  // Pre-compute rotation per segment so arcs stack around the ring.
  let acc = 0;
  const rotations = SEGMENTS.map((s) => {
    const rot = acc * 360 - 90;
    acc += s.value / 100;
    return rot;
  });

  return (
    <div ref={root} className="card-premium p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <svg viewBox="0 0 180 180" className="w-44 h-44 shrink-0" role="img" aria-label="Spending by category">
          <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(11,18,32,0.05)" strokeWidth="18" />
          {SEGMENTS.map((s, i) => (
            <circle
              key={s.label}
              className="donut-arc"
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={C}
              transform={`rotate(${rotations[i]} 90 90)`}
            />
          ))}
        </svg>

        <ul className="grid grid-cols-1 gap-2.5 w-full">
          {SEGMENTS.map((s) => (
            <li
              key={s.label}
              className="cat-chip flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-sm"
            >
              <span className="flex items-center gap-2.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="balance-num text-muted">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
