"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DocumentFieldsPreview } from "@/components/preview/DocumentFieldsPreview";
import { useDocumentStore } from "@/lib/documentStore";

export function DocumentPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const docType = params.type as string;
  const { documentData, documentType } = useDocumentStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const unsub = useDocumentStore.persist.onFinishHydration(() => {
      setMounted(true);
    });
    useDocumentStore.persist.rehydrate();
    return unsub;
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-charcoal-20 border-t-charcoal rounded-full" />
      </div>
    );
  }

  if (Object.keys(documentData).length === 0) {
    router.replace("/chat");
    return null;
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-warm-gray hover:text-charcoal transition-colors flex items-center gap-1"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Chat
          </button>
        </div>
        <DocumentFieldsPreview
          data={documentData}
          documentType={docType || documentType}
        />
      </div>
    </div>
  );
}
