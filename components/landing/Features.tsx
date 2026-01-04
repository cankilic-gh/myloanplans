"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calculator, TrendingUp, PieChart, Target, Wallet, BarChart3, Sparkles } from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Loan Calculator",
    description: "Calculate your payments with precision and explore different payment scenarios",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Payment Optimization",
    description: "See exactly when you'll be debt-free with optimized payment strategies",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: PieChart,
    title: "Budget Tracking",
    description: "Track your income and expenses to free up cash for debt payoff",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Target,
    title: "Multi-Loan Management",
    description: "Track all your loans in one place and prioritize payments",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Wallet,
    title: "Recurring Expenses",
    description: "Automate tracking of recurring income and expenses",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description: "Get clear insights with charts and visualizations",
    gradient: "from-rose-500 to-orange-500",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(37,99,235,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(16,185,129,0.05),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
          >
            Everything You{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              Need
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Powerful features to help you take control of your finances and become debt-free faster
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 h-full flex flex-col overflow-hidden"
              >
                {/* Gradient background on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
                
                {/* Animated border gradient */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
                  style={{ zIndex: -1 }}
                />
                
                {/* Icon container with enhanced animation */}
                <motion.div 
                  className="mb-4 relative z-10"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all`}
                    animate={{
                      boxShadow: [
                        "0 4px 6px rgba(0, 0, 0, 0.1)",
                        "0 10px 25px rgba(0, 0, 0, 0.15)",
                        "0 4px 6px rgba(0, 0, 0, 0.1)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </motion.div>
                </motion.div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-2 relative z-10 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 flex-1 relative z-10 group-hover:text-slate-700 transition-colors">
                  {feature.description}
                </p>
                
                {/* Decorative corner element */}
                <motion.div
                  className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-300`}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

