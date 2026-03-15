"use client";

import { useRef, useState } from "react";
import type { NDAFormData } from "@/lib/ndaSchema";
import { NDACoverPage } from "./NDACoverPage";
import { NDAStandardTerms } from "./NDAStandardTerms";
import { generatePdf } from "@/lib/generatePdf";

export function NDAPreview({ data }: { data: NDAFormData }) {
  const documentRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!documentRef.current) return;
    setDownloading(true);
    try {
      const company1 = data.party1.company || "Party1";
      const company2 = data.party2.company || "Party2";
      const filename = `Mutual-NDA_${company1}_${company2}.pdf`;
      await generatePdf(documentRef.current, filename);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with download */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-charcoal tracking-tight">
            Review & Download
          </h2>
          <p className="text-sm text-warm-gray mt-1.5">
            Review the completed agreement below, then download as PDF.
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="no-print shrink-0 px-5 py-2.5 text-sm font-semibold text-white bg-charcoal rounded-lg hover:bg-charcoal-light disabled:opacity-40 transition-all duration-200 flex items-center gap-2.5 shadow-sm"
        >
          {downloading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Document preview — styled like actual paper */}
      <div className="relative">
        {/* Paper shadow layers for depth */}
        <div className="absolute inset-0 bg-white rounded-xl translate-y-1 translate-x-0.5 opacity-40" />
        <div className="absolute inset-0 bg-white rounded-xl translate-y-0.5 translate-x-px opacity-60" />

        {/* Main document */}
        <div
          className="relative bg-white rounded-xl border border-border shadow-lg"
          style={{
            boxShadow:
              "0 1px 3px rgba(26, 26, 46, 0.04), 0 8px 24px rgba(26, 26, 46, 0.06), 0 20px 48px rgba(26, 26, 46, 0.04)",
          }}
        >
          {/* Decorative top border */}
          <div className="h-1 bg-gradient-to-r from-charcoal via-amber to-charcoal rounded-t-xl" />

          <div
            ref={documentRef}
            className="px-10 py-10 sm:px-14 sm:py-12 max-w-none font-serif"
          >
            <NDACoverPage data={data} />
            <NDAStandardTerms data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
