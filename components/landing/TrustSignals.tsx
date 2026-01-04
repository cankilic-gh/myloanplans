"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Lock, CheckCircle2, Award } from "lucide-react";

const trustSignals = [
  {
    icon: Shield,
    title: "Bank-Level Encryption",
    description: "256-bit SSL encryption protects all your data",
    gradient: "from-blue-500 to-cyan-500",
    delay: 0,
  },
  {
    icon: Lock,
    title: "Zero Data Sharing",
    description: "We never sell or share your financial information",
    gradient: "from-emerald-500 to-teal-500",
    delay: 0.1,
  },
  {
    icon: CheckCircle2,
    title: "No Hidden Fees",
    description: "Completely free. No subscriptions, no surprises",
    gradient: "from-purple-500 to-pink-500",
    delay: 0.2,
  },
  {
    icon: Award,
    title: "Trusted & Secure",
    description: "Built with security best practices from day one",
    gradient: "from-orange-500 to-red-500",
    delay: 0.3,
  },
];

export function TrustSignals() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {trustSignals.map((signal, index) => {
            const Icon = signal.icon;
            return (
              <motion.div
                key={signal.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  delay: signal.delay, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  transition: { duration: 0.3 }
                }}
                className="group relative flex flex-col items-center text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 hover:border-transparent hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient background on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${signal.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
                
                {/* Animated border glow */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${signal.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
                  style={{ zIndex: -1 }}
                />
                
                {/* Enhanced Icon with animation */}
                <motion.div
                  className="relative mb-4"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${signal.gradient} text-white shadow-xl group-hover:shadow-2xl transition-all relative overflow-hidden`}
                    animate={{
                      boxShadow: [
                        `0 10px 25px rgba(0, 0, 0, 0.15)`,
                        `0 15px 35px rgba(0, 0, 0, 0.2)`,
                        `0 10px 25px rgba(0, 0, 0, 0.15)`,
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Icon className="h-8 w-8 relative z-10" />
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%", y: "-100%" }}
                      animate={{ x: "100%", y: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                </motion.div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-primary transition-colors relative z-10">
                  {signal.title}
                </h3>
                <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors relative z-10">
                  {signal.description}
                </p>
                
                {/* Decorative corner element */}
                <motion.div
                  className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${signal.gradient} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-300`}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}






