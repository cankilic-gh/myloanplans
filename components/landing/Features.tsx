"use client";

import { motion } from "framer-motion";
import {
  Calculator,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Target,
  Eye,
  Lock,
  Wallet,
  Repeat,
} from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Smart Calculations",
    description:
      "Real-time amortization schedules show exactly how each payment affects your principal and interest.",
    gradient: "from-blue-500 to-blue-600",
    delay: 0.1,
  },
  {
    icon: TrendingUp,
    title: "Payment Optimization",
    description:
      "See the impact of extra payments. Find the fastest path to becoming debt-free without breaking the bank.",
    gradient: "from-emerald-500 to-emerald-600",
    delay: 0.2,
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description:
      "Your financial data is encrypted end-to-end. We never store your passwords or share your information.",
    gradient: "from-[#2563EB] to-[#1E3A8A]",
    delay: 0.3,
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Instant calculations. No waiting, no loading screens. Get answers the moment you need them.",
    gradient: "from-purple-500 to-purple-600",
    delay: 0.4,
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description:
      "Beautiful charts and graphs make complex loan data easy to understand at a glance.",
    gradient: "from-indigo-500 to-indigo-600",
    delay: 0.5,
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description:
      "Set payoff goals and track your progress. Celebrate milestones as you move closer to financial freedom.",
    gradient: "from-rose-500 to-rose-600",
    delay: 0.6,
  },
  {
    icon: Eye,
    title: "Complete Transparency",
    description:
      "No hidden fees, no surprises. See every dollar of interest and exactly where your money goes.",
    gradient: "from-cyan-500 to-cyan-600",
    delay: 0.7,
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Your data stays on your device. We use industry-standard encryption and never sell your information.",
    gradient: "from-slate-500 to-slate-600",
    delay: 0.8,
  },
  {
    icon: Wallet,
    title: "Budget Tracking",
    description:
      "Track your income and expenses with ease. Get insights into your spending patterns and stay on top of your financial goals.",
    gradient: "from-emerald-500 to-emerald-600",
    delay: 0.9,
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description:
      "Beautiful charts and graphs show your income vs expenses over time. Understand your financial flow at a glance.",
    gradient: "from-indigo-500 to-indigo-600",
    delay: 1.0,
  },
  {
    icon: Repeat,
    title: "Recurring Expenses",
    description:
      "Automatically track recurring bills and subscriptions. Never miss a payment and see your monthly commitments clearly.",
    gradient: "from-violet-500 to-violet-600",
    delay: 1.1,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

export function Features() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              Master Your Debt
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful tools designed to give you clarity, control, and confidence
            in your financial journey.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = index === 0 || index === 4;
            const isWide = index === 2;

            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                custom={feature.delay}
                className={`group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 ${
                  isLarge ? "md:row-span-2" : ""
                } ${isWide ? "md:col-span-2" : ""}`}
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                />

                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Indicator */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

