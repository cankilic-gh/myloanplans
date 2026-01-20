"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/useUIStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Sparkles } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { openAuthModal } = useUIStore();
  const router = useRouter();

  const handleGetStarted = () => {
    // Set guest mode flag and redirect to dashboard
    sessionStorage.setItem("isGuest", "true");
    sessionStorage.setItem("isAuthenticated", "true");
    sessionStorage.setItem("userName", "Guest User");
    sessionStorage.setItem("userEmail", "guest@local");
    router.push("/dashboard");
  };

  const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.95]);
  const blurAmount = useTransform(scrollY, [0, 100], [0, 16]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      style={{
        backgroundColor: isScrolled ? `rgba(255, 255, 255, ${backgroundOpacity.get()})` : "transparent",
        backdropFilter: isScrolled ? `blur(${blurAmount.get()}px)` : "none",
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "shadow-lg shadow-slate-200/50 border-b border-slate-200/50"
          : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Enhanced Brand Name */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="hidden sm:block"
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </motion.div>
              <span className="font-bold text-black text-xl tracking-tight group-hover:text-primary transition-colors bg-gradient-to-r from-slate-900 to-slate-700 group-hover:from-primary group-hover:to-emerald-600 bg-clip-text text-transparent">
                My Loan Plans
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <motion.button
              onClick={() => openAuthModal("login")}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="text-slate-700 hover:text-primary transition-colors font-medium relative group"
            >
              Sign In
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleGetStarted}
                variant="default"
                size="lg"
                className="relative bg-gradient-to-r from-primary via-blue-600 to-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl transition-all overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
                <span className="relative z-10">Get Started</span>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>
          </div>

          {/* Enhanced Mobile Sign In Button */}
          <motion.button
            className="md:hidden p-2 text-slate-700 hover:text-primary transition-colors relative"
            onClick={() => openAuthModal("login")}
            aria-label="Sign in"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <LogIn className="h-6 w-6" />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}



