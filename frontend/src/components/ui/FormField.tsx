interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required,
  hint,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="block text-sm font-medium text-charcoal tracking-tight">
          {label}
          {required && (
            <span className="text-amber ml-1 text-xs font-normal">required</span>
          )}
        </label>
      </div>
      {hint && (
        <p className="text-xs text-warm-gray-light leading-relaxed">{hint}</p>
      )}
      {children}
      {error && (
        <p className="text-xs text-error flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
