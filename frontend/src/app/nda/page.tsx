"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/wizard/WizardShell";
import { StepGeneralTerms } from "@/components/wizard/StepGeneralTerms";
import { StepPartyDetails } from "@/components/wizard/StepPartyDetails";
import { useNDAStore } from "@/lib/ndaStore";
import { generalTermsSchema, partyDetailsSchema } from "@/lib/ndaSchema";
import { ZodError } from "zod";

export default function NDAPage() {
  const router = useRouter();
  const { currentStep, setStep, formData } = useNDAStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    useNDAStore.persist.rehydrate();
  }, []);

  const validateAndAdvance = useCallback(() => {
    setErrors({});
    try {
      if (currentStep === 1) {
        generalTermsSchema.parse(formData);
        setStep(2);
      } else if (currentStep === 2) {
        partyDetailsSchema.parse(formData);
        router.push("/nda/preview");
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of err.issues) {
          const path = issue.path.join(".");
          fieldErrors[path] = issue.message;
        }
        setErrors(fieldErrors);
      }
    }
  }, [currentStep, formData, router, setStep]);

  const handleBack =
    currentStep > 1 ? () => { setErrors({}); setStep(currentStep - 1); } : undefined;

  return (
    <WizardShell
      currentStep={currentStep}
      onBack={handleBack}
      onNext={validateAndAdvance}
      nextLabel={currentStep === 2 ? "Generate NDA" : "Next"}
    >
      {currentStep === 1 && <StepGeneralTerms errors={errors} />}
      {currentStep === 2 && <StepPartyDetails errors={errors} />}
    </WizardShell>
  );
}
