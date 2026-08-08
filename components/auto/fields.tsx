"use client";

import React from "react";

// ─── Shared input primitives for the Auto planner ───────────────────────────
// Local string/focus state keeps typing smooth (partial input like "5." isn't
// clobbered) while staying in sync with the store-driven `value` prop.

interface NumberFieldProps {
  id: string;
  label: string;
  sublabel?: string;
  prefix?: React.ReactNode;
  suffix?: string;
  value: number;
  onCommit: (n: number) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
  allowNegative?: boolean;
}

export function NumberField({
  id, label, sublabel, prefix, suffix, value, onCommit,
  placeholder, min, max, step, allowNegative = false,
}: NumberFieldProps) {
  const [local, setLocal] = React.useState(() => (Number.isFinite(value) ? String(value) : ""));
  const focused = React.useRef(false);

  React.useEffect(() => {
    if (!focused.current) setLocal(Number.isFinite(value) ? String(value) : "");
  }, [value]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {sublabel && <span className="text-xs text-muted balance-num shrink-0">{sublabel}</span>}
      </div>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-muted pointer-events-none select-none text-sm">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={local}
          min={allowNegative ? undefined : min ?? "0"}
          max={max}
          step={step ?? "1"}
          placeholder={placeholder}
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={() => {
            focused.current = false;
            setLocal(Number.isFinite(value) ? String(value) : "");
          }}
          onChange={(e) => {
            const v = e.target.value;
            setLocal(v);
            const n = parseFloat(v);
            onCommit(Number.isFinite(n) ? n : 0);
          }}
          className={`w-full h-11 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all balance-num placeholder:text-muted/50 ${
            prefix ? "pl-8" : "pl-3"
          } ${suffix ? "pr-14" : "pr-3"}`}
        />
        {suffix && (
          <span className="absolute right-3 text-muted pointer-events-none select-none text-xs">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
}

export function TextField({ id, label, value, onCommit, placeholder }: TextFieldProps) {
  const [local, setLocal] = React.useState(value);
  const focused = React.useRef(false);

  React.useEffect(() => {
    if (!focused.current) setLocal(value);
  }, [value]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={local}
        placeholder={placeholder}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          setLocal(value);
        }}
        onChange={(e) => {
          setLocal(e.target.value);
          onCommit(e.target.value);
        }}
        className="w-full h-11 px-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all placeholder:text-muted/50"
      />
    </div>
  );
}

interface SliderNumberFieldProps {
  id: string;
  label: string;
  value: number;
  onCommit: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  formatValue?: (v: number) => string;
}

export function SliderNumberField({
  id, label, value, onCommit, min, max, step = 1, suffix = "", formatValue,
}: SliderNumberFieldProps) {
  const display = formatValue ? formatValue(value) : `${value}${suffix}`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <span className="text-xs font-semibold balance-num text-brand">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : min}
        onChange={(e) => onCommit(Number(e.target.value))}
        className="w-full h-2 accent-brand cursor-pointer"
        aria-valuetext={display}
      />
      <div className="flex justify-between text-[10px] text-muted">
        <span>{formatValue ? formatValue(min) : `${min}${suffix}`}</span>
        <span>{formatValue ? formatValue(max) : `${max}${suffix}`}</span>
      </div>
    </div>
  );
}

export function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

export function PresetRow({
  options,
  active,
  onSelect,
}: {
  options: { label: string; value: number }[];
  active: number;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onSelect(o.value)}
          className={`flex-1 h-9 rounded-lg text-xs font-semibold border transition-colors ${
            active === o.value
              ? "border-brand bg-brand/10 text-brand"
              : "border-border bg-card text-muted hover:border-border-strong hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
