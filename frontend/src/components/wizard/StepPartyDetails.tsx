"use client";

import { useNDAStore } from "@/lib/ndaStore";
import { FormField } from "@/components/ui/FormField";
import type { PartyDetails } from "@/lib/ndaSchema";

interface StepPartyDetailsProps {
  errors: Record<string, string>;
}

function PartyFieldset({
  label,
  partyNumber,
  party,
  onChange,
  errors,
}: {
  label: string;
  partyNumber: number;
  party: PartyDetails;
  onChange: (patch: Partial<PartyDetails>) => void;
  errors: Record<string, string>;
}) {
  const inputClass =
    "w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-amber-20 focus:border-amber placeholder:text-warm-gray-light";

  return (
    <div className="bg-white rounded-xl border border-border p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-3 pb-3 border-b border-border-light">
        <div className="w-7 h-7 rounded-full bg-charcoal text-white flex items-center justify-center text-xs font-display font-semibold">
          {partyNumber}
        </div>
        <h3 className="text-sm font-semibold text-charcoal tracking-tight">
          {label}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Full Name" required error={errors.name}>
          <input
            type="text"
            value={party.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="John Doe"
            className={inputClass}
          />
        </FormField>

        <FormField label="Title" error={errors.title}>
          <input
            type="text"
            value={party.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Chief Executive Officer"
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="Company" required error={errors.company}>
        <input
          type="text"
          value={party.company}
          onChange={(e) => onChange({ company: e.target.value })}
          placeholder="Acme Inc."
          className={inputClass}
        />
      </FormField>

      <FormField
        label="Notice Address"
        hint="Email or postal address for formal notices"
        error={errors.noticeAddress}
      >
        <input
          type="text"
          value={party.noticeAddress}
          onChange={(e) => onChange({ noticeAddress: e.target.value })}
          placeholder="legal@acme.com"
          className={inputClass}
        />
      </FormField>

      <FormField label="Date" error={errors.date}>
        <input
          type="date"
          value={party.date}
          onChange={(e) => onChange({ date: e.target.value })}
          className={inputClass}
        />
      </FormField>
    </div>
  );
}

export function StepPartyDetails({ errors }: StepPartyDetailsProps) {
  const { formData, updateParty1, updateParty2 } = useNDAStore();

  const party1Errors: Record<string, string> = {};
  const party2Errors: Record<string, string> = {};
  for (const [key, val] of Object.entries(errors)) {
    if (key.startsWith("party1."))
      party1Errors[key.replace("party1.", "")] = val;
    if (key.startsWith("party2."))
      party2Errors[key.replace("party2.", "")] = val;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-semibold text-charcoal tracking-tight">
          Party Details
        </h2>
        <p className="text-sm text-warm-gray mt-1.5">
          Enter the details for both parties entering into this agreement.
        </p>
      </div>

      <PartyFieldset
        label="Disclosing & Receiving Party"
        partyNumber={1}
        party={formData.party1}
        onChange={updateParty1}
        errors={party1Errors}
      />

      <div className="flex items-center gap-4 px-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-warm-gray-light font-medium uppercase tracking-widest">
          and
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <PartyFieldset
        label="Disclosing & Receiving Party"
        partyNumber={2}
        party={formData.party2}
        onChange={updateParty2}
        errors={party2Errors}
      />
    </div>
  );
}
