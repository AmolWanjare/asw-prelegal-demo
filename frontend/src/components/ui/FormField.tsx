import { useId, Children, cloneElement, isValidElement, type ReactElement } from "react";

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
  const id = useId();
  const inputId = `field-${id}`;
  const hintId = hint ? `hint-${id}` : undefined;
  const errorId = error ? `error-${id}` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  // Clone the first form element child to inject id and aria attributes
  const ariaProps = {
    id: inputId,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
  };

  const enhancedChildren = Children.map(children, (child) => {
    if (isValidElement(child)) {
      const el = child as ReactElement<Record<string, unknown>>;
      const tagName = typeof el.type === "string" ? el.type : "";
      // Native form elements or custom components (like StateSelect)
      if (
        ["input", "textarea", "select"].includes(tagName) ||
        typeof el.type === "function"
      ) {
        return cloneElement(el, ariaProps);
      }
    }
    return child;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-charcoal tracking-tight"
        >
          {label}
          {required && (
            <span className="text-amber ml-1 text-xs font-normal">
              required
            </span>
          )}
        </label>
      </div>
      {hint && (
        <p
          id={hintId}
          className="text-xs text-warm-gray-light leading-relaxed"
        >
          {hint}
        </p>
      )}
      {enhancedChildren}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-error flex items-center gap-1.5"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
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
