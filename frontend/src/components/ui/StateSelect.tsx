import { US_STATES } from "@/lib/constants";

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function StateSelect({ value, onChange }: StateSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber appearance-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6880' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
      }}
    >
      <option value="">Select a state...</option>
      {US_STATES.map((state) => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  );
}
