"use client";

import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle2, Award } from "lucide-react";

const trustSignals = [
  {
    icon: Shield,
    title: "Bank-Level Encryption",
    description: "256-bit SSL encryption protects all your data",
  },
  {
    icon: Lock,
    title: "Zero Data Sharing",
    description: "We never sell or share your financial information",
  },
  {
    icon: CheckCircle2,
    title: "No Hidden Fees",
    description: "Completely free. No subscriptions, no surprises",
  },
  {
    icon: Award,
    title: "Trusted & Secure",
    description: "Built with security best practices from day one",
  },
];

export function TrustSignals() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {trustSignals.map((signal, index) => {
            const Icon = signal.icon;
            return (
              <motion.div
                key={signal.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-white mb-4 shadow-lg">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {signal.title}
                </h3>
                <p className="text-sm text-slate-600">{signal.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

