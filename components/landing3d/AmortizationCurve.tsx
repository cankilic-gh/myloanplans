"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsap } from "./useGsap";

gsap.registerPlugin(ScrollTrigger);

/* Build a smooth descending amortization-like curve path. */
function buildPath(w: number, h: number, pad: number) {
  const pts: [number, number][] = [];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // Outstanding-balance shape: slow at first, accelerating to zero.
    const bal = Math.pow(1 - t, 1.7);
    const x = pad + t * (w - pad * 2);
    const y = pad + (1 - bal) * (h - pad * 2);
    pts.push([x, y]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return { d, end: pts[pts.length - 1], start: pts[0] };
}

const W = 560;
const H = 320;
const PAD = 24;

export function AmortizationCurve() {
  const root = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const { d, end } = buildPath(W, H, PAD);

  useGsap(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const line = root.current!.querySelector<SVGPathElement>(".amort-line")!;
        const area = root.current!.querySelector<SVGPathElement>(".amort-area")!;
        const dot = root.current!.querySelector<SVGCircleElement>(".amort-dot")!;
        const len = line.getTotalLength();

        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        gsap.set(area, { opacity: 0 });

        const counter = { val: 400000 };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            end: "bottom 30%",
            scrub: 1,
          },
        });

        const progress = { p: 0 };

        tl.to(line, { strokeDashoffset: 0, ease: "none" }, 0)
          .to(area, { opacity: 1, ease: "none" }, 0.1)
          .to(
            progress,
            {
              p: 1,
              ease: "none",
              onUpdate: () => {
                // Keep the dot riding the visible end of the line.
                const pt = line.getPointAtLength(len * progress.p);
                dot.setAttribute("cx", String(pt.x));
                dot.setAttribute("cy", String(pt.y));
              },
            },
            0
          )
          .to(
            counter,
            {
              val: 0,
              ease: "none",
              onUpdate: () => {
                if (numRef.current) {
                  numRef.current.textContent =
                    "$" + Math.round(counter.val).toLocaleString("en-US");
                }
              },
            },
            0
          );
      });

      // Reduced motion: show final state, no scrub.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const line = root.current!.querySelector<SVGPathElement>(".amort-line")!;
        gsap.set(line, { strokeDashoffset: 0 });
        gsap.set(root.current!.querySelector(".amort-area"), { opacity: 1 });
        if (numRef.current) numRef.current.textContent = "$0";
      });
    },
    root
  );

  return (
    <div ref={root} className="relative">
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-sm font-medium text-muted">Outstanding balance</span>
          <span
            ref={numRef}
            className="balance-num text-2xl sm:text-3xl font-semibold tracking-tight"
          >
            $400,000
          </span>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          role="img"
          aria-label="Loan balance descending to zero"
        >
          <defs>
            <linearGradient id="amortStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2f6bff" />
              <stop offset="55%" stopColor="#8b7bff" />
              <stop offset="100%" stopColor="#2bd4a4" />
            </linearGradient>
            <linearGradient id="amortFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(47,107,255,0.18)" />
              <stop offset="100%" stopColor="rgba(43,212,164,0.02)" />
            </linearGradient>
          </defs>

          {/* horizontal guide lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <line
              key={g}
              x1={PAD}
              x2={W - PAD}
              y1={PAD + g * (H - PAD * 2)}
              y2={PAD + g * (H - PAD * 2)}
              stroke="rgba(11,18,32,0.06)"
              strokeWidth={1}
            />
          ))}

          <path className="amort-area" d={`${d} L ${end[0]} ${H - PAD} L ${PAD} ${H - PAD} Z`} fill="url(#amortFill)" />
          <path
            className="amort-line"
            d={d}
            fill="none"
            stroke="url(#amortStroke)"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <circle className="amort-dot" cx={PAD} cy={PAD} r={6} fill="#2bd4a4" stroke="#fff" strokeWidth={2} />
        </svg>
      </div>
    </div>
  );
}
