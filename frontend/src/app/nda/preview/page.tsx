"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/wizard/WizardShell";
import { NDAPreview } from "@/components/preview/NDAPreview";
import { useNDAStore } from "@/lib/ndaStore";

export default function PreviewPage() {
  const router = useRouter();
  const { formData, setStep } = useNDAStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useNDAStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <WizardShell currentStep={3}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-200 border-t-indigo-700 rounded-full" />
        </div>
      </WizardShell>
    );
  }

  if (!formData.party1.name || !formData.party1.company) {
    router.push("/nda");
    return null;
  }

  return (
    <WizardShell
      currentStep={3}
      onBack={() => {
        setStep(2);
        router.push("/nda");
      }}
    >
      <NDAPreview data={formData} />
    </WizardShell>
  );
}
