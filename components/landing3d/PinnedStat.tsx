"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsap } from "./useGsap";
import { TrendingDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned, scroll-scrubbed narrative beat: the section stays fixed while the
 * big number counts up, the label clip-reveals, and a progress meter fills.
 * Reduced motion → static final state, never pinned.
 */
export function PinnedStat() {
  const root = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const TARGET = 184350; // illustrative interest saved with extra payments

  useGsap(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = gsap.utils.toArray<HTMLElement>(".pin-word", root.current!);

      // 1) Reveal the heading + number crisply on enter (NOT scrubbed) so the
      //    copy is reliably there as soon as the section reaches you.
      gsap.set(words, { yPercent: 115, opacity: 0, filter: "blur(8px)" });
      gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        filter: "blur(0px)",
        stagger: 0.1,
        ease: "power3.out",
        duration: 0.9,
        scrollTrigger: {
          trigger: root.current,
          start: "top 72%",
          toggleActions: "play none none none",
        },
      });

      // 2) Scrub ONLY the counter + progress bar over a short range, finishing
      //    well before the section leaves — so the full number always lands.
      const counter = { val: 0 };
      const setNum = () => {
        if (numRef.current)
          numRef.current.textContent =
            "$" + Math.round(counter.val).toLocaleString("en-US");
      };
      setNum();
      gsap.to(counter, {
        val: TARGET,
        ease: "none",
        onUpdate: setNum,
        scrollTrigger: {
          trigger: root.current,
          start: "top 68%",
          end: "center 58%",
          scrub: 0.4,
        },
      });
      gsap.fromTo(
        fillRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 68%",
            end: "center 58%",
            scrub: 0.4,
          },
        }
      );
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".pin-word", { yPercent: 0, opacity: 1, filter: "blur(0px)" });
      if (numRef.current)
        numRef.current.textContent = "$" + TARGET.toLocaleString("en-US");
      gsap.set(fillRef.current, { scaleX: 1 });
    });
  }, root);

  return (
    <section
      ref={root}
      className="relative isolate min-h-[100svh] flex items-center justify-center overflow-hidden"
    >
      {/* soft ambient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 30%, rgba(47,107,255,0.10), transparent 70%)," +
            "radial-gradient(50% 50% at 80% 80%, rgba(43,212,164,0.10), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-3xl px-4 text-center">
        <span className="hidden">{/* spacer */}</span>
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted">
          <TrendingDown className="w-3.5 h-3.5 text-mint" />
          Payoff simulator
        </div>

        <h2 className="mt-7 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
          <span className="block overflow-hidden">
            <span className="pin-word inline-block will-change-transform">
              Extra payments could save you
            </span>
          </span>
        </h2>

        <div className="mt-6 overflow-hidden">
          <span
            ref={numRef}
            className="pin-word balance-num inline-block will-change-transform text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight text-gradient"
          >
            $0
          </span>
        </div>

        <div className="mx-auto mt-10 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-border">
          <div
            ref={fillRef}
            className="h-full w-full origin-left rounded-full"
            style={{
              background:
                "linear-gradient(90deg,#2f6bff 0%,#8b7bff 55%,#2bd4a4 100%)",
            }}
          />
        </div>

        <p className="mx-auto mt-7 max-w-md text-muted leading-relaxed">
          Over the life of the loan, in interest alone. Model it with your own
          numbers — extra monthly, one-time, or both.
        </p>
      </div>
    </section>
  );
}
