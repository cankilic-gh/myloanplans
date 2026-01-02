"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface SessionWarningProps {
  show: boolean;
}

export function SessionWarning({ show }: SessionWarningProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 right-4 z-[100] max-w-sm"
        >
          <div className="bg-amber-500 text-white rounded-lg shadow-2xl p-4 border border-slate-200 border-amber-400">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">
                  Session Expiring Soon
                </h3>
                <p className="text-xs text-amber-50">
                  Your session will expire in 1 minute due to inactivity. Move your mouse to stay logged in.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}






