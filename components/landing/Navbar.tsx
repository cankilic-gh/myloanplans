"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/useUIStore";
import Link from "next/link";
import { LogIn, Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { openAuthModal } = useUIStore();
  const { isDark, toggle: toggleDarkMode, mounted } = useDarkMode();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-slate-200/50 dark:border-slate-700/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Brand Name (No Logo) */}
          <Link href="/" className="flex items-center">
            <span className="font-bold text-black dark:text-white text-xl tracking-tight">
              My Loan Plans
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={() => openAuthModal("login")}
              className="text-slate-700 dark:text-slate-300 hover:text-primary transition-colors font-medium"
            >
              Sign In
            </button>
            <Button
              onClick={() => openAuthModal("signup")}
              variant="default"
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}
            <button
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
              onClick={() => openAuthModal("login")}
              aria-label="Sign in"
            >
              <LogIn className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}



