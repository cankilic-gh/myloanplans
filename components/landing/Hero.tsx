"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/useUIStore";
import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const { openAuthModal } = useUIStore();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7.5, -7.5]), {
    stiffness: 100,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7.5, 7.5]), {
    stiffness: 100,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-32 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)]" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center lg:text-left space-y-8 relative z-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-slate-200 border-emerald-200 rounded-full text-emerald-700 text-sm font-medium"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Trusted by thousands of users</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold text-slate-900 leading-[1.2]"
            >
              Turn Financial{" "}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Chaos
              </span>{" "}
              Into a Clear Plan
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-loose"
            >
              See exactly when you'll be debt-free.{" "}
              <strong>Take control of your monthly budget to free up cash</strong>, and track all your loans in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                onClick={() => openAuthModal("signup")}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => openAuthModal("login")}
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 border-2 bg-white hover:bg-slate-100 text-slate-900 hover:text-primary transition-colors"
              >
                Sign In
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-slate-500 pt-4"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Bank-level encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>No hidden fees</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Interactive 3D Dashboard Mockup */}
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              perspective: "1000px",
            }}
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-emerald-500/30 to-primary/30 rounded-3xl blur-3xl opacity-60" />

            {/* Dashboard Preview Card - Glassmorphism */}
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 p-6">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-500 font-mono">Dashboard</div>
              </div>

              {/* Mock Dashboard Content - Enhanced 3D */}
              <div className="space-y-4">
                {/* Loan Plan Card with Gradient */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="bg-gradient-to-br from-primary/10 via-blue-50 to-emerald-50 rounded-xl p-4 border border-slate-200 border-primary/30 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">Home Mortgage</h3>
                    <span className="text-xs text-emerald-600 font-medium px-2 py-1 bg-emerald-100 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-slate-500">Monthly Payment</p>
                      <p className="text-xl font-bold text-slate-900">$2,450</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Remaining</p>
                      <p className="text-xl font-bold text-slate-900">$185K</p>
                    </div>
                  </div>
                </motion.div>

                {/* Progress Chart with Glow */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200 shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-slate-700">Payment Progress</p>
                    <span className="text-sm font-bold text-emerald-600">68%</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "68%" }}
                      transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-full relative"
                      style={{
                        boxShadow: "0 0 15px rgba(16, 185, 129, 0.6)",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Stats Grid with Icons */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Plans", value: "3", color: "from-blue-500 to-blue-600" },
                    { label: "Total Debt", value: "$245K", color: "from-purple-500 to-purple-600" },
                    { label: "Payoff", value: "8.5y", color: "from-emerald-500 to-emerald-600" },
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + idx * 0.15, duration: 0.5 }}
                      className="bg-white rounded-xl p-3 border border-slate-200 text-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color} mx-auto mb-2`} />
                      <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                      <p className="text-base font-bold text-slate-900">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Floating Payoff Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.6, type: "spring" }}
                  className="mt-4 p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-xl border border-slate-200 border-emerald-400"
                >
                  <p className="text-xs text-emerald-50 mb-1">Today's Payoff</p>
                  <p className="text-2xl font-bold text-white">$185,230</p>
                  <p className="text-xs text-emerald-100 mt-1">Your freedom price</p>
                </motion.div>
              </div>

              {/* Floating Budget Surplus Card - Glassmorphism */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.7, duration: 0.6, type: "spring" }}
                className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200/80 p-3 z-20"
                style={{
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 0 20px rgba(16, 185, 129, 0.2)",
                }}
              >
                <p className="text-xs font-medium text-slate-600 mb-1">Budget Surplus</p>
                <p className="text-xl font-bold text-emerald-600 mb-0.5">+$450</p>
                <p className="text-[10px] text-slate-500">Auto-allocated to Principal</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



