import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5 font-semibold">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-[linear-gradient(135deg,#3b76ff,#8b7bff_55%,#2bd4a4)] text-white text-sm font-bold">
              M
            </span>
            MyLoanPlans
          </div>
          <p className="mt-3 text-sm text-muted max-w-xs">
            A private, no-signup mortgage, budget & auto planner. Your data lives only in your browser.
          </p>
        </div>
        <div className="text-sm">
          <div className="font-semibold mb-3">Tools</div>
          <ul className="space-y-2 text-muted">
            <li><Link href="/loan" className="hover:text-foreground">Mortgage / Loan Calculator</Link></li>
            <li><Link href="/budget" className="hover:text-foreground">Budget Planner</Link></li>
            <li><Link href="/auto" className="hover:text-foreground">Lease vs. Finance Calculator</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="font-semibold mb-3">Private by design</div>
          <p className="text-muted">
            No accounts. No servers storing your numbers. Everything is computed locally and saved
            to your browser cache. Clear your cache and it&apos;s gone.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted flex flex-col sm:flex-row gap-2 justify-between">
          <span>© {new Date().getFullYear()} MyLoanPlans. For educational purposes; not financial advice.</span>
          <span>Built for clarity.</span>
        </div>
      </div>
    </footer>
  );
}
