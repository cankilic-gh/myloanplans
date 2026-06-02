"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface ExportMenuProps {
  onCSV: () => void;
  onXLS: () => void;
  label?: string;
  align?: "left" | "right";
}

export function ExportMenu({ onCSV, onXLS, label = "Export", align = "right" }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-sm font-medium border border-border bg-card hover:border-border-strong transition-colors"
      >
        <Download className="w-4 h-4" />
        {label}
      </button>
      {open && (
        <div
          className={`absolute z-30 mt-2 w-44 rounded-xl border border-border bg-card shadow-lg p-1 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <button
            onClick={() => { onXLS(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-foreground/[0.04] text-left"
          >
            <FileSpreadsheet className="w-4 h-4 text-mint" />
            Excel (.xls)
          </button>
          <button
            onClick={() => { onCSV(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-foreground/[0.04] text-left"
          >
            <FileText className="w-4 h-4 text-brand" />
            CSV (.csv)
          </button>
        </div>
      )}
    </div>
  );
}
