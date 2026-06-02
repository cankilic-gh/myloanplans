"use client";

import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Home,
  TrendingDown,
  Wallet,
  PieChart,
  Lock,
  ShieldCheck,
  FileSpreadsheet,
  Check,
} from "lucide-react";

import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AmbientVideo } from "./AmbientVideo";
import { Reveal, WordsReveal } from "./Reveal";
import { CinematicHero } from "./CinematicHero";
import { Parallax } from "./Parallax";
import { PinnedStat } from "./PinnedStat";
import { useLenis } from "./useLenis";
import { AmortizationCurve } from "./AmortizationCurve";
import { BudgetDonut } from "./BudgetDonut";
import { CompoundBars } from "./CompoundBars";

gsap.registerPlugin(ScrollTrigger);

const TRUST = [
  "No account needed",
  "Data stays in your browser",
  "Export to Excel / CSV",
  "Free forever",
];

export function Landing() {
  // Site-wide buttery smooth scroll, synced to GSAP/ScrollTrigger.
  useLenis();

  return (
    <div className="min-h-screen bg-background text-foreground mesh-bg scroll-thin">
      <SiteNav />

      {/* ---------------- CINEMATIC HERO ---------------- */}
      <CinematicHero />

      {/* ---------------- TRUST STRIP ---------------- */}
      <section className="relative border-y border-border bg-card/40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-mint" />
                <span className="font-medium text-foreground/80">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- TWO-TOOL SECTION ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <Reveal className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Two calculators, one private workspace
          </h2>
          <p className="mt-4 text-muted">
            Purpose-built tools that share the same calm, private home in your browser.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Parallax speed={9}>
            <ToolCard
              href="/loan"
              video={{ webm: undefined, mp4: "/video/loan.mp4" }}
              icon={<Home className="w-5 h-5" />}
              badgeIcon={<TrendingDown className="w-4 h-4" />}
              eyebrow="Mortgage / Loan"
              title="Pay it off, on your terms"
              features={[
                "Full amortization schedule",
                "Extra & one-time payment payoff",
                "Multiple saved plans",
                "Payoff simulator",
                "Excel / CSV export",
              ]}
              accent="#2f6bff"
            />
          </Parallax>
          <Parallax speed={9} className="lg:mt-12">
            <ToolCard
              href="/budget"
              video={{ webm: undefined, mp4: "/video/budget.mp4" }}
              icon={<Wallet className="w-5 h-5" />}
              badgeIcon={<PieChart className="w-4 h-4" />}
              eyebrow="Budget Planner"
              title="Every dollar, accounted for"
              features={[
                "Income & expense tracking",
                "Recurring income & expenses",
                "Savings goals with compound projection",
                "Monthly & yearly cash-flow",
                "CSV import · Excel / CSV export",
              ]}
              accent="#2bd4a4"
            />
          </Parallax>
        </div>
      </section>

      {/* ---------------- PINNED SCRUB STAT ---------------- */}
      <PinnedStat />

      {/* ---------------- SCROLL NARRATIVE ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-8 space-y-28 sm:space-y-40">
        <NarrativeRow
          eyebrow="Amortization"
          title="Watch interest melt away"
          body="Every extra payment reshapes the curve. Scroll and see your balance descend from the first payment all the way to a debt-free zero."
          visual={<AmortizationCurve />}
        />
        <NarrativeRow
          reverse
          eyebrow="Budgeting"
          title="See every dollar"
          body="Categories assemble into a clear picture of where your money goes — so you can decide where it should go next."
          visual={<BudgetDonut />}
        />
        <NarrativeRow
          eyebrow="Savings"
          title="Compound your future"
          body="Set a goal and watch it grow. Projections fold compound interest into year-over-year savings so the long game feels tangible."
          visual={<CompoundBars />}
        />
      </section>

      {/* ---------------- PRIVACY ---------------- */}
      <section className="mx-auto max-w-4xl px-4 py-28 sm:py-36">
        <Reveal>
          <div className="glass rounded-3xl p-8 sm:p-12 text-center">
            <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-brand/10 text-brand mx-auto">
              <Lock className="w-6 h-6" />
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight">
              Your numbers never leave your device
            </h2>
            <p className="mt-4 text-muted max-w-xl mx-auto leading-relaxed">
              There is no backend storing your finances. Everything is computed locally and
              saved to your browser&apos;s storage. No accounts, no analytics on your data,
              nothing to leak. Clear your cache and it&apos;s gone — completely.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-mint" /> localStorage only</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-mint" /> No servers</span>
              <span className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-mint" /> You own the export</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl card-premium p-10 sm:p-16 text-center">
            <div
              aria-hidden
              className="absolute inset-0 z-0"
              style={{
                background:
                  "radial-gradient(70% 80% at 20% 0%, rgba(47,107,255,0.10), transparent 60%)," +
                  "radial-gradient(60% 80% at 90% 20%, rgba(139,123,255,0.10), transparent 60%)," +
                  "radial-gradient(70% 90% at 60% 110%, rgba(43,212,164,0.10), transparent 60%)",
              }}
            />
            <h2 className="relative z-10 text-3xl sm:text-5xl font-semibold tracking-tight max-w-2xl mx-auto leading-[1.1]">
              Start planning <span className="text-gradient">today</span>. It&apos;s instant and private.
            </h2>
            <div className="relative z-10 mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
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
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ---------------- sub-components ---------------- */

function NarrativeRow({
  eyebrow,
  title,
  body,
  visual,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className={reverse ? "lg:order-2" : ""}>
        <Reveal>
          <span className="text-xs font-semibold tracking-widest uppercase text-brand">
            {eyebrow}
          </span>
        </Reveal>
        <h3 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
          <WordsReveal text={title} />
        </h3>
        <Reveal delay={0.15} className="mt-4">
          <p className="text-muted text-base sm:text-lg leading-relaxed max-w-md">{body}</p>
        </Reveal>
      </div>
      {/* Visual parallaxes at a different speed than the copy for depth. */}
      <div className={reverse ? "lg:order-1" : ""}>
        <Parallax speed={12} scaleFrom={0.96}>
          <Reveal y={28}>{visual}</Reveal>
        </Parallax>
      </div>
    </div>
  );
}

function ToolCard({
  href,
  icon,
  badgeIcon,
  eyebrow,
  title,
  features,
  accent,
  video,
}: {
  href: string;
  icon: React.ReactNode;
  badgeIcon: React.ReactNode;
  eyebrow: string;
  title: string;
  features: string[];
  accent: string;
  video: { webm?: string; mp4?: string };
}) {
  return (
    <Reveal y={26}>
      <Link
        href={href}
        className="group relative isolate block card-premium overflow-hidden p-8 sm:p-10 h-full"
      >
        {/* ambient video bg (graceful fallback if missing) */}
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden>
          <AmbientVideo
            webm={video.webm}
            mp4={video.mp4}
            className="absolute inset-0 w-full h-full"
            opacity={0.3}
          />
        </div>
        {/* white veil + soft accent sheen on hover — keeps the card light & text crisp */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to bottom, rgba(255,255,255,0.74), rgba(255,255,255,0.58)), radial-gradient(80% 60% at 80% -10%, ${accent}24, transparent 60%)`,
          }}
        />

        <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span
            className="inline-grid place-items-center w-12 h-12 rounded-xl text-white"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            {icon}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
            {badgeIcon}
            {eyebrow}
          </span>
        </div>

        <h3 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h3>

        <ul className="mt-5 space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
              <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
          Open
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </span>
        </div>
      </Link>
    </Reveal>
  );
}
