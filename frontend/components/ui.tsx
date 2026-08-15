import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

// ---------- Spinner / loaders ----------

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500"
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ---------- Button ----------

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

const BTN_VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:bg-brand-700",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700",
  ghost:
    "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
  danger:
    "border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950",
};

const BTN_SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex select-none items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

// ---------- Card ----------

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`card ${className}`.trim()}>{children}</div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------- Badge / pill ----------

export function Pill({ className = "", children }: { className?: string; children: ReactNode }) {
  return <span className={`chip ${className}`.trim()}>{children}</span>;
}

// ---------- Input ----------

type FieldInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label?: string;
  hint?: string;
};

export function Field({ label, hint, id, ...input }: FieldInputProps) {
  const inputId = id ?? input.name ?? "field";
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input id={inputId} className="input" {...input} />
      {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

// ---------- Empty / error states ----------

export function EmptyState({ icon, title, body, action }: { icon?: string; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      {icon && <span className="text-4xl" aria-hidden="true">{icon}</span>}
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      {body && <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onBack }: { message: string; onBack?: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-4xl" aria-hidden="true">⚠️</span>
      <p className="text-slate-600 dark:text-slate-300">{message}</p>
      {onBack && (
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
      )}
    </div>
  );
}