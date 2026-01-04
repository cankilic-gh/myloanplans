"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 border-t border-slate-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.1),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Enhanced Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <motion.p 
            className="text-slate-400 text-sm"
            whileHover={{ scale: 1.05, color: "rgb(148, 163, 184)" }}
            transition={{ duration: 0.2 }}
          >
            © {new Date().getFullYear()} My Loan Plans. All rights reserved.
          </motion.p>
          <motion.div
            className="flex items-center gap-2 text-slate-500 text-xs"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            </motion.div>
            <span>for financial freedom</span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}






