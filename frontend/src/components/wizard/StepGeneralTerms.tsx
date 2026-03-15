"use client";

import { useNDAStore } from "@/lib/ndaStore";
import { FormField } from "@/components/ui/FormField";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { StateSelect } from "@/components/ui/StateSelect";

interface StepGeneralTermsProps {
  errors: Record<string, string>;
}

export function StepGeneralTerms({ errors }: StepGeneralTermsProps) {
  const { formData, updateForm } = useNDAStore();

  const inputClass =
    "w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-amber-20 focus:border-amber placeholder:text-warm-gray-light";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-semibold text-charcoal tracking-tight">
          General Terms
        </h2>
        <p className="text-sm text-warm-gray mt-1.5">
          Define the scope, duration, and governing provisions of the agreement.
        </p>
      </div>

      {/* Agreement Scope */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-border-light">
          <div className="w-1 h-4 bg-amber rounded-full" />
          <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-widest">
            Agreement Scope
          </h3>
        </div>

        <FormField
          label="Purpose"
          required
          hint="Describe how Confidential Information may be used by the parties"
          error={errors.purpose}
        >
          <textarea
            value={formData.purpose}
            onChange={(e) => updateForm({ purpose: e.target.value })}
            rows={3}
            className={inputClass + " resize-none"}
          />
        </FormField>

        <FormField label="Effective Date" required error={errors.effectiveDate}>
          <input
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => updateForm({ effectiveDate: e.target.value })}
            className={inputClass}
          />
        </FormField>
      </div>

      {/* Duration */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-border-light">
          <div className="w-1 h-4 bg-amber rounded-full" />
          <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-widest">
            Duration
          </h3>
        </div>

        <FormField
          label="MNDA Term"
          hint="The length of this MNDA"
          error={errors.mndaTermType}
        >
          <RadioGroup
            name="mndaTermType"
            value={formData.mndaTermType}
            onChange={(v) =>
              updateForm({ mndaTermType: v as "fixed" | "until_terminated" })
            }
            options={[
              {
                value: "fixed",
                label: `Expires ${formData.mndaTermYears} year(s) from Effective Date`,
                subInput: {
                  type: "number",
                  value: formData.mndaTermYears,
                  onChange: (v) => updateForm({ mndaTermYears: v }),
                  suffix: "year(s) from Effective Date",
                },
              },
              {
                value: "until_terminated",
                label: "Continues until terminated per MNDA terms",
              },
            ]}
          />
        </FormField>

        <FormField
          label="Term of Confidentiality"
          hint="How long Confidential Information remains protected"
          error={errors.confidentialityTermType}
        >
          <RadioGroup
            name="confidentialityTermType"
            value={formData.confidentialityTermType}
            onChange={(v) =>
              updateForm({
                confidentialityTermType: v as "fixed" | "perpetuity",
              })
            }
            options={[
              {
                value: "fixed",
                label: `${formData.confidentialityTermYears} year(s) from Effective Date`,
                subInput: {
                  type: "number",
                  value: formData.confidentialityTermYears,
                  onChange: (v) =>
                    updateForm({ confidentialityTermYears: v }),
                  suffix: "year(s) from Effective Date, trade secrets protected under law",
                },
              },
              { value: "perpetuity", label: "In perpetuity" },
            ]}
          />
        </FormField>
      </div>

      {/* Governing Provisions */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-border-light">
          <div className="w-1 h-4 bg-amber rounded-full" />
          <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-widest">
            Governing Provisions
          </h3>
        </div>

        <FormField
          label="Governing Law"
          required
          hint="State whose laws govern this agreement"
          error={errors.governingLaw}
        >
          <StateSelect
            value={formData.governingLaw}
            onChange={(v) => updateForm({ governingLaw: v })}
          />
        </FormField>

        <FormField
          label="Jurisdiction"
          required
          hint='City or county and state for legal proceedings (e.g., "courts located in New Castle, DE")'
          error={errors.jurisdiction}
        >
          <input
            type="text"
            value={formData.jurisdiction}
            onChange={(e) => updateForm({ jurisdiction: e.target.value })}
            placeholder="courts located in New Castle, DE"
            className={inputClass}
          />
        </FormField>

        <FormField
          label="MNDA Modifications"
          hint="List any modifications to the standard terms (optional)"
        >
          <textarea
            value={formData.modifications}
            onChange={(e) => updateForm({ modifications: e.target.value })}
            rows={3}
            placeholder="None"
            className={inputClass + " resize-none"}
          />
        </FormField>
      </div>
    </div>
  );
}
