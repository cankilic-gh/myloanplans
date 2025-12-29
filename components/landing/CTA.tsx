"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/useUIStore";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  const { openAuthModal } = useUIStore();
  
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-emerald-600" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-slate-200 border-white/30 mb-4"
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Ready to Take Control of Your Debt?
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who have turned their financial chaos into
            a clear, actionable plan. Start your journey to financial freedom
            today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              onClick={() => openAuthModal("signup")}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-base px-8 py-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => openAuthModal("login")}
              variant="outline"
              size="lg"
              className="bg-transparent text-white border-2 border-white/70 hover:bg-white hover:text-primary hover:border-white text-base px-8 py-6 transition-all"
            >
              Sign In
            </Button>
          </div>

          {/* Trust Note */}
          <p className="text-sm text-white/70 pt-4">
            No credit card required • Free forever • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}



