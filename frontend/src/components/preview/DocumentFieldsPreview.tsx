"use client";

import { useRef } from "react";
import { getDocumentEntry } from "@/lib/documentCatalog";
import { generatePdf } from "@/lib/generatePdf";

function camelToTitle(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

interface DocumentFieldsPreviewProps {
  data: Record<string, unknown>;
  documentType: string;
  hideDownload?: boolean;
}

export function DocumentFieldsPreview({
  data,
  documentType,
  hideDownload = false,
}: DocumentFieldsPreviewProps) {
  const documentRef = useRef<HTMLDivElement>(null);
  const entry = getDocumentEntry(documentType);
  const displayName = entry?.name || camelToTitle(documentType);

  const hasData = Object.keys(data).length > 0;

  // Separate flat fields from object (nested) fields
  const flatFields: [string, unknown][] = [];
  const objectFields: [string, Record<string, unknown>][] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      objectFields.push([key, value as Record<string, unknown>]);
    } else if (value != null) {
      flatFields.push([key, value]);
    }
  }

  const handleDownload = async () => {
    if (documentRef.current) {
      await generatePdf(documentRef.current, `${documentType}.pdf`);
    }
  };

  return (
    <div>
      {!hideDownload && (
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!hasData}
            className="px-4 py-2 text-sm font-semibold text-white bg-purple hover:bg-purple-hover rounded-lg transition-all duration-200 disabled:opacity-30 shadow-sm"
          >
            Download PDF
          </button>
        </div>
      )}

      <div
        ref={documentRef}
        className="bg-white rounded-lg shadow-md border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="bg-navy px-8 py-6">
          <h1 className="text-xl font-display font-bold text-white">
            {displayName}
          </h1>
          {entry?.description && (
            <p className="text-sm text-white/70 mt-1">{entry.description}</p>
          )}
        </div>

        <div className="px-8 py-6">
          {!hasData ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-amber-muted mx-auto mb-4 flex items-center justify-center">
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-amber"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="text-sm text-warm-gray">
                Fields will appear here as you answer questions
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Flat fields */}
              {flatFields.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-3">
                    General Terms
                  </h2>
                  <div className="space-y-2">
                    {flatFields.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-baseline gap-3 py-2 border-b border-border/50 last:border-0"
                      >
                        <span className="text-xs font-medium text-warm-gray min-w-[140px] shrink-0">
                          {camelToTitle(key)}
                        </span>
                        <span className="text-sm text-charcoal">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Object fields (parties, etc.) */}
              {objectFields.map(([groupKey, groupData]) => {
                const entries = Object.entries(groupData).filter(
                  ([, v]) => v != null && v !== ""
                );
                if (entries.length === 0) return null;
                return (
                  <div key={groupKey}>
                    <h2 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-3">
                      {camelToTitle(groupKey)}
                    </h2>
                    <div className="space-y-2">
                      {entries.map(([key, value]) => (
                        <div
                          key={`${groupKey}.${key}`}
                          className="flex items-baseline gap-3 py-2 border-b border-border/50 last:border-0"
                        >
                          <span className="text-xs font-medium text-warm-gray min-w-[140px] shrink-0">
                            {camelToTitle(key)}
                          </span>
                          <span className="text-sm text-charcoal">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
