"use client";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} My Loan Plans. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs">
            Made with ❤️ for financial freedom
          </p>
        </div>
      </div>
    </footer>
  );
}





