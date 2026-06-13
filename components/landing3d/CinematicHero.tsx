"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsap } from "./useGsap";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* Headline split into lines → words for the mask/clip reveal. */
const LINE_ONE = ["Plan", "your", "mortgage", "and", "budget,"];
const HIGHLIGHT = "beautifully.";

export function CinematicHero() {
  const heroRef = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [videoOk, setVideoOk] = useState(true);

  useGsap(
    () => {
      const mm = gsap.matchMedia();

      /* ---------- FULL MOTION ---------- */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = heroRef.current!;
        const videoWrap = videoWrapRef.current!;
        const blobs = blobsRef.current!;
        const copy = copyRef.current!;

        /* --- Cinematic load reveal timeline --- */
        const words = gsap.utils.toArray<HTMLElement>(".hero-word", root);
        const fades = gsap.utils.toArray<HTMLElement>(".hero-fade", root);

        gsap.set(words, { yPercent: 115, filter: "blur(8px)", opacity: 0 });
        gsap.set(fades, { y: 22, opacity: 0, filter: "blur(6px)" });

        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });

        // Soft fade-in only — the camera stays locked so the house sits still
        // and only the in-video ambient motion (water, fountain, birds) plays.
        intro.fromTo(
          videoWrap,
          { opacity: 0 },
          { opacity: 1, duration: 1.4, ease: "power2.out" },
          0
        );

        // Masked word reveal with blur-in, staggered.
        intro.to(
          words,
          {
            yPercent: 0,
            filter: "blur(0px)",
            opacity: 1,
            duration: 1.1,
            stagger: 0.07,
          },
          0.25
        );

        // Eyebrow, subline, CTAs fade/slide up in sequence after.
        intro.to(
          fades,
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
          },
          0.7
        );

        /* --- Cursor-follow parallax (lerped, single rAF) --- */
        const target = { x: 0, y: 0 };
        const current = { vx: 0, vy: 0, bx: 0, by: 0, hx: 0, hy: 0 };
        let rafId = 0;
        let active = false;

        const onMove = (e: PointerEvent) => {
          const r = root.getBoundingClientRect();
          // -0.5..0.5 from center
          target.x = (e.clientX - r.left) / r.width - 0.5;
          target.y = (e.clientY - r.top) / r.height - 0.5;
          if (!active) {
            active = true;
            rafId = requestAnimationFrame(tick);
          }
        };

        const tick = () => {
          // Lerp each layer toward target with its own depth factor.
          // Video moves only slightly so the house reads as essentially still.
          current.vx += (target.x * 8 - current.vx) * 0.08;
          current.vy += (target.y * 8 - current.vy) * 0.08;
          current.bx += (target.x * -42 - current.bx) * 0.06;
          current.by += (target.y * -42 - current.by) * 0.06;
          current.hx += (target.x * 6 - current.hx) * 0.1;
          current.hy += (target.y * 6 - current.hy) * 0.1;

          gsap.set(videoWrap, { x: current.vx, y: current.vy });
          gsap.set(blobs, { x: current.bx, y: current.by });
          gsap.set(copy, { x: current.hx, y: current.hy });

          rafId = requestAnimationFrame(tick);
        };

        root.addEventListener("pointermove", onMove);

        /* --- Scroll-driven hero exit (scrub) --- */
        const exit = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        exit
          .to(videoWrap, { opacity: 0.3, yPercent: -6, ease: "none" }, 0)
          .to(copy, { yPercent: -22, opacity: 0, ease: "none" }, 0)
          .to(blobs, { yPercent: -14, opacity: 0.4, ease: "none" }, 0)
          .to(".hero-exit-wipe", { opacity: 1, ease: "none" }, 0);

        return () => {
          root.removeEventListener("pointermove", onMove);
          cancelAnimationFrame(rafId);
        };
      });

      /* ---------- REDUCED MOTION: static, legible, no parallax ---------- */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".hero-word", { yPercent: 0, filter: "blur(0px)", opacity: 1 });
        gsap.set(".hero-fade", { y: 0, opacity: 1, filter: "blur(0px)" });
      });
    },
    heroRef
  );

  return (
    <section
      ref={heroRef}
      className="relative isolate min-h-[100svh] flex flex-col items-center justify-start overflow-hidden bg-white pb-16"
    >
      {/* --- Layer 0: barely-there light blobs (kept for parallax depth) --- */}
      <div
        ref={blobsRef}
        className="absolute inset-0 z-0 pointer-events-none will-change-transform opacity-[0.18]"
        aria-hidden
      >
        <div
          className="absolute -left-[8%] top-[12%] w-[42vw] h-[42vw] max-w-[560px] max-h-[560px] rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(circle, rgba(47,107,255,0.22), transparent 65%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute right-[2%] top-[6%] w-[40vw] h-[40vw] max-w-[520px] max-h-[520px] rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(circle, rgba(139,123,255,0.22), transparent 65%)",
            filter: "blur(44px)",
          }}
        />
        <div
          className="absolute left-[38%] -bottom-[10%] w-[44vw] h-[44vw] max-w-[600px] max-h-[600px] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(43,212,164,0.20), transparent 65%)",
            filter: "blur(48px)",
          }}
        />
      </div>

      {/* --- Layer 2: top white scrim → headline stays crisp --- */}
      <div
        className="absolute inset-x-0 top-0 h-[46%] z-[2] pointer-events-none"
        aria-hidden
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.5) 24%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* --- Layer 3: scroll-exit white wipe at the bottom --- */}
      <div
        className="hero-exit-wipe absolute inset-x-0 bottom-0 h-[42%] z-[3] pointer-events-none opacity-0"
        aria-hidden
        style={{ background: "linear-gradient(to top, #fbfcfe 8%, transparent)" }}
      />
      {/* Always-on soft fade into the trust strip. */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 z-[3] pointer-events-none"
        aria-hidden
        style={{ background: "linear-gradient(to top, #fbfcfe, transparent)" }}
      />

      {/* --- Layer 10: hero copy (top) --- */}
      <div
        ref={copyRef}
        className="relative z-10 mx-auto max-w-3xl px-4 text-center pt-24 pb-2 will-change-transform"
      >
        <div className="hero-fade">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            Private · No signup · Free
          </span>
        </div>

        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.08]">
          <span className="block">
            {LINE_ONE.map((w, i) => (
              <MaskWord key={i} last={i === LINE_ONE.length - 1}>
                {w}
              </MaskWord>
            ))}
          </span>
          <span className="block mt-1">
            <MaskWord className="text-gradient" last>
              {HIGHLIGHT}
            </MaskWord>
          </span>
        </h1>

        <div className="hero-fade mt-6">
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Amortization schedules, payoff simulations, and savings projections —
            calculated instantly and stored privately in your browser. No servers,
            no accounts, no tracking.
          </p>
        </div>

        <div className="hero-fade mt-9">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/loan"
              className="btn-brand inline-flex items-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold"
            >
              Open Loan Calculator
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/budget"
              className="glass inline-flex items-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold text-foreground hover:text-brand transition-colors"
            >
              Open Budget Planner
            </Link>
          </div>
        </div>
      </div>

      {/* --- Floating isometric diorama (in flow, fills the lower area) --- */}
      <div
        ref={videoWrapRef}
        className="relative z-[1] w-full max-w-6xl flex-1 min-h-0 -mt-2 will-change-transform hidden sm:block"
        aria-hidden
      >
        {videoOk ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/hero-bg.jpg"
            onError={() => setVideoOk(false)}
            className="absolute inset-0 w-full h-full object-contain object-bottom"
            style={{
              // brightness() clamps the codec's near-white (~250) up to true 255,
              // then multiply blends that pure white into the page → the plate
              // disappears, leaving only the diorama + its soft shadow. No box.
              filter: "brightness(1.08)",
              mixBlendMode: "multiply",
            }}
          >
            <source src="/video/hero.webm" type="video/webm" />
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
        ) : null}
      </div>

      {/* Scroll cue */}
      <div className="hero-fade absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-muted">
        <span className="text-[11px] tracking-wide uppercase">Scroll to explore</span>
        <ChevronDown className="w-4 h-4 animate-float" />
      </div>
    </section>
  );
}

/* A single word wrapped in an overflow-hidden mask for the clip reveal. */
function MaskWord({
  children,
  className = "",
  last = false,
}: {
  children: React.ReactNode;
  className?: string;
  last?: boolean;
}) {
  return (
    <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
      <span
        className={`hero-word inline-block will-change-transform ${
          last ? "" : "mr-[0.28em]"
        } ${className}`}
      >
        {children}
      </span>
    </span>
  );
}
