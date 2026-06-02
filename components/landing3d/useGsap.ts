"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";

/**
 * Minimal useGSAP replacement (the @gsap/react package isn't installed).
 * Runs `callback` inside a scoped gsap.context and reverts on cleanup,
 * which auto-kills tweens and ScrollTriggers created within the scope.
 */
export function useGsap(
  callback: (ctx: gsap.Context) => void,
  scope: RefObject<HTMLElement | null>
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      cbRef.current(self);
    }, scope.current ?? undefined);

    return () => ctx.revert();
    // Run once on mount; scope is stable for a given component instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
