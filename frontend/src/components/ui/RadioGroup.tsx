"use client";

interface RadioOption {
  value: string;
  label: string;
  subInput?: {
    type: "number";
    value: number;
    onChange: (v: number) => void;
    suffix: string;
  };
}

interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  legendId?: string;
}

export function RadioGroup({ name, value, onChange, options, legendId }: RadioGroupProps) {
  return (
    <div role="radiogroup" aria-labelledby={legendId} className="space-y-2">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex items-center gap-3.5 p-3.5 rounded-lg border cursor-pointer transition-all duration-200 ${
              isSelected
                ? "border-amber-border bg-amber-muted"
                : "border-border hover:border-amber-border-50 hover:bg-cream-dark-50"
            }`}
          >
            <div
              aria-hidden="true"
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
                isSelected ? "border-amber" : "border-warm-gray-light"
              }`}
            >
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-amber" />
              )}
            </div>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={isSelected}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span className="text-sm text-charcoal flex items-center gap-2 flex-wrap">
              {opt.subInput && isSelected ? (
                <>
                  <span>Expires</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    aria-label={`Number of years for ${name}`}
                    value={opt.subInput.value}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      opt.subInput!.onChange(
                        Math.max(1, Math.min(99, e.target.valueAsNumber || 1))
                      )
                    }
                    className="w-14 px-2 py-1 border border-amber-border rounded text-center text-sm bg-white focus:outline-none focus:ring-1 focus:ring-amber"
                  />
                  <span className="text-warm-gray">{opt.subInput.suffix}</span>
                </>
              ) : (
                opt.label
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
