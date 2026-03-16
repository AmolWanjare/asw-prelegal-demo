"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface DocumentStore {
  documentType: string;
  documentData: Record<string, unknown>;
  setDocumentType: (t: string) => void;
  setDocumentData: (d: Record<string, unknown>) => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      documentType: "",
      documentData: {},
      setDocumentType: (t) => set({ documentType: t }),
      setDocumentData: (d) => set({ documentData: d }),
      reset: () => set({ documentType: "", documentData: {} }),
    }),
    {
      name: "document-store",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return sessionStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      skipHydration: true,
    }
  )
);
