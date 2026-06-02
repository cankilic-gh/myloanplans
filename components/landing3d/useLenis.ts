"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide buttery smooth scroll (motionsites-tier).
 *
 * Wires Lenis into GSAP's single rAF loop:
 *   - gsap.ticker drives lenis.raf  (one rAF for the whole page)
 *   - lenis "scroll" → ScrollTrigger.update()  (keeps every trigger in sync)
 *   - ScrollTrigger.scrollerProxy is NOT needed because Lenis still drives the
 *     native window scroll position — we just smooth it. window.scrollY stays
 *     authoritative, so SiteNav's scroll listener and default scroller keep working.
 *
 * Respects prefers-reduced-motion: skips Lenis entirely (native scroll).
 */
export function useLenis() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      // Let native touch scrolling drive mobile (smoother on iOS, lighter CPU).
      syncTouch: false,
    });

    // Keep ScrollTrigger perfectly in sync with Lenis' smoothed position.
    lenis.on("scroll", ScrollTrigger.update);

    // Single rAF: GSAP ticker advances Lenis (ticker time is seconds → ms).
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Refresh once everything (fonts, videos, images) settles.
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);
}
