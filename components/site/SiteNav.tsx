"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/loan", label: "Loan" },
    { href: "/budget", label: "Budget" },
    { href: "/auto", label: "Auto" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <nav
          className={`flex items-center justify-between rounded-2xl px-3 sm:px-5 h-14 transition-all duration-300 ${
            scrolled ? "glass-nav" : "bg-transparent"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-[linear-gradient(135deg,#3b76ff,#8b7bff_55%,#2bd4a4)] text-white text-sm font-bold">
              M
            </span>
            <span className="hidden sm:inline text-[15px]">MyLoanPlans</span>
          </Link>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {links.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-2 sm:px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-brand bg-brand/8"
                      : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
