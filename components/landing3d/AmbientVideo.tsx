"use client";

import { useRef, useState } from "react";

/**
 * Optional ambient video layer. The source files may not exist yet —
 * on any error (or reduced-motion) the element hides itself so the page
 * never breaks. Purely an enhancement on top of the coded visuals.
 */
export function AmbientVideo({
  webm,
  mp4,
  className = "",
  opacity = 0.5,
}: {
  webm?: string;
  mp4?: string;
  className?: string;
  opacity?: number;
}) {
  const [hidden, setHidden] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  if (hidden) return null;

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      onError={() => setHidden(true)}
      className={`pointer-events-none object-cover ${className}`}
      style={{ opacity }}
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      {mp4 ? <source src={mp4} type="video/mp4" /> : null}
    </video>
  );
}
