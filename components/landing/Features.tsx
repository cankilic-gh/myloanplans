"use client";

import { motion } from "framer-motion";
import { Calculator, TrendingUp, PieChart, Target, Wallet, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Loan Calculator",
    description: "Calculate your payments with precision and explore different payment scenarios",
  },
  {
    icon: TrendingUp,
    title: "Payment Optimization",
    description: "See exactly when you'll be debt-free with optimized payment strategies",
  },
  {
    icon: PieChart,
    title: "Budget Tracking",
    description: "Track your income and expenses to free up cash for debt payoff",
  },
  {
    icon: Target,
    title: "Multi-Loan Management",
    description: "Track all your loans in one place and prioritize payments",
  },
  {
    icon: Wallet,
    title: "Recurring Expenses",
    description: "Automate tracking of recurring income and expenses",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description: "Get clear insights with charts and visualizations",
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Powerful features to help you take control of your finances and become debt-free faster
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col"
              >
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 flex-1">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

