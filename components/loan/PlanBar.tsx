"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, ChevronDown } from "lucide-react";
import { useLoanStore, type LoanPlanMeta } from "@/stores/useLoanStore";

// ─── Rename / edit popover ───────────────────────────────────────────────────
interface EditPopoverProps {
  plan: LoanPlanMeta;
  onClose: () => void;
}

function EditPopover({ plan, onClose }: EditPopoverProps) {
  const { renamePlan, deletePlan, plans } = useLoanStore();
  const [name, setName] = useState(plan.name);
  const [startDate, setStartDate] = useState(plan.startDate.slice(0, 10));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const save = () => {
    if (name.trim()) {
      renamePlan(plan.id, name.trim(), startDate || undefined);
    }
    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deletePlan(plan.id);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <div className="absolute z-50 top-full mt-2 left-0 w-72 card-premium p-4 shadow-xl">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted block mb-1">Plan name</label>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted block mb-1">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={save}
            className="flex-1 h-8 rounded-lg btn-brand text-xs font-semibold flex items-center justify-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Save
          </button>
          <button
            onClick={onClose}
            className="h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-foreground/[0.04] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {plans.length > 1 && (
            <button
              onClick={handleDelete}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                confirmDelete
                  ? "bg-rose text-white"
                  : "border border-border hover:border-rose hover:text-rose"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmDelete ? "Confirm" : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Plan pill ────────────────────────────────────────────────────────────────
interface PlanPillProps {
  plan: LoanPlanMeta;
  active: boolean;
  onSelect: () => void;
}

function PlanPill({ plan, active, onSelect }: PlanPillProps) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!editing) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setEditing(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [editing]);

  const displayDate = (() => {
    try {
      return new Date(plan.startDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  })();

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <div
        className={`flex items-center h-9 rounded-xl border transition-all duration-200 ${
          active
            ? "border-brand bg-brand/[0.06] text-brand"
            : "border-border bg-card text-foreground hover:border-border-strong"
        }`}
      >
        <button
          onClick={onSelect}
          className="pl-3 pr-1.5 h-full flex items-center gap-1.5 text-sm font-medium min-w-0"
        >
          <span className="truncate max-w-[120px]">{plan.name}</span>
          {displayDate && (
            <span
              className={`text-xs shrink-0 ${active ? "text-brand/70" : "text-muted"}`}
            >
              · {displayDate}
            </span>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!active) onSelect();
            setEditing((v) => !v);
          }}
          className={`h-full px-2 rounded-r-xl flex items-center transition-colors ${
            active ? "hover:bg-brand/10" : "hover:bg-foreground/[0.05]"
          }`}
          aria-label="Edit plan"
        >
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>

      {editing && (
        <EditPopover plan={plan} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}

// ─── PlanBar ─────────────────────────────────────────────────────────────────
export function PlanBar() {
  const { plans, activePlanId, setActivePlan, createPlan } = useLoanStore();

  const handleNew = () => {
    createPlan();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {plans.map((plan) => (
        <PlanPill
          key={plan.id}
          plan={plan}
          active={plan.id === activePlanId}
          onSelect={() => setActivePlan(plan.id)}
        />
      ))}
      <button
        onClick={handleNew}
        className="flex-shrink-0 h-9 px-3.5 rounded-xl border border-dashed border-border-strong text-muted hover:border-brand hover:text-brand text-sm font-medium flex items-center gap-1.5 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        New plan
      </button>
    </div>
  );
}
