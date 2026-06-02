"use client";

// Shared lightweight UI primitives for budget2 components.
// Keeps each feature file lean — no third-party form libs needed.

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";

// ---------- CollapsibleCard ----------

interface CollapsibleCardProps {
  title: string;
  defaultOpen?: boolean;
  badge?: string | number;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  defaultOpen = false,
  badge,
  action,
  children,
  className = "",
}) => {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={`card-premium overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-foreground/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge !== undefined && (
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-semibold bg-brand/10 text-brand">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
          <ChevronDown
            className={`w-4 h-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------- Modal ----------

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  footer,
}) => {
  // Close on Escape
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/30 backdrop-blur-sm p-0 md:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full ${maxWidth} bg-card border border-border rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[92vh]`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-foreground/[0.06] flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4">{children}</div>
            {footer && (
              <div className="px-5 py-4 border-t border-border shrink-0">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ---------- ConfirmModal ----------

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
}) => (
  <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
    <p className="text-sm text-muted">{message}</p>
    <div className="flex gap-3 mt-5">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 h-10 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-foreground/[0.04] transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="flex-1 h-10 rounded-xl bg-rose text-white text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-90"
      >
        {loading ? "Deleting..." : confirmLabel}
      </button>
    </div>
  </Modal>
);

// ---------- FormField ----------

export const FormField: React.FC<{
  label: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}> = ({ label, error, children, className = "" }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-rose">{error}</p>}
  </div>
);

// ---------- Input / Select / Textarea ----------

const inputBase =
  "w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors balance-num";

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`${inputBase} ${props.className ?? ""}`} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className={`${inputBase} cursor-pointer ${props.className ?? ""}`} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none ${props.className ?? ""}`}
  />
);

// ---------- Badge ----------

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: "income" | "expense" | "neutral" | "brand";
}> = ({ children, variant = "neutral" }) => {
  const cls = {
    income: "bg-mint/10 text-mint border-mint/20",
    expense: "bg-rose/10 text-rose border-rose/20",
    neutral: "bg-foreground/[0.05] text-muted border-border",
    brand: "bg-brand/10 text-brand border-brand/20",
  }[variant];
  return (
    <span className={`inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-semibold border ${cls}`}>
      {children}
    </span>
  );
};

// ---------- Skeleton ----------

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-foreground/[0.06] ${className}`} />
);

// Need React in scope for useState/useEffect in this file
import React from "react";
