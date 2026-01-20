"use client";

import { motion, useAnimationFrame } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/useUIStore";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  const { openAuthModal } = useUIStore();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    // Set guest mode flag and redirect to dashboard
    sessionStorage.setItem("isGuest", "true");
    sessionStorage.setItem("isAuthenticated", "true");
    sessionStorage.setItem("userName", "Guest User");
    sessionStorage.setItem("userEmail", "guest@local");
    router.push("/dashboard");
  };
  
  // Floating animation
  const floatingY = useRef(0);
  useAnimationFrame((t) => {
    if (ref.current) {
      floatingY.current = Math.sin(t / 2000) * 15;
    }
  });
  
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-emerald-600"
        animate={{
          background: [
            "linear-gradient(to bottom right, rgb(37, 99, 235), rgb(37, 99, 235), rgb(16, 185, 129))",
            "linear-gradient(to bottom right, rgb(37, 99, 235), rgb(59, 130, 246), rgb(16, 185, 129))",
            "linear-gradient(to bottom right, rgb(37, 99, 235), rgb(37, 99, 235), rgb(16, 185, 129))",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Enhanced Decorative Elements */}
      <motion.div 
        className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-white/20 rounded-full blur-sm"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 4) * 20}%`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(i) * 30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}

      <div ref={ref} className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-8"
        >
          {/* Enhanced Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 mb-4 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
            />
            <Sparkles className="h-12 w-12 text-white relative z-10" />
          </motion.div>

          {/* Enhanced Headline */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
          >
            Ready to Take{" "}
            <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
              Control
            </span>{" "}
            of Your Debt?
          </motion.h2>

          {/* Enhanced Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
          >
            Join thousands of users who have turned their financial chaos into
            a clear, actionable plan. Start your journey to financial freedom
            today.
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="relative bg-white text-primary hover:bg-white/90 text-base px-8 py-6 shadow-2xl hover:shadow-3xl transition-all font-semibold overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <span className="relative z-10 flex items-center">
                  Get Started Free
                  <motion.div
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.div>
                </span>
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => openAuthModal("login")}
                variant="outline"
                size="lg"
                className="bg-transparent text-white border-2 border-white/70 hover:bg-white hover:text-primary hover:border-white text-base px-8 py-6 transition-all backdrop-blur-sm hover:backdrop-blur-md"
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Trust Note */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-sm text-white/80 pt-4 flex flex-wrap items-center justify-center gap-2"
          >
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              ✓
            </motion.span>
            No credit card required • Free forever • Cancel anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}



