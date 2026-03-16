"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { NDAFormData } from "./ndaSchema";
import { DEFAULT_PURPOSE, DEFAULT_PARTY } from "./constants";

interface NDAStore {
  currentStep: number;
  formData: NDAFormData;
  setStep: (step: number) => void;
  updateForm: (patch: Partial<NDAFormData>) => void;
  updateParty1: (patch: Partial<NDAFormData["party1"]>) => void;
  updateParty2: (patch: Partial<NDAFormData["party2"]>) => void;
  reset: () => void;
}

export const initialFormData: NDAFormData = {
  purpose: DEFAULT_PURPOSE,
  effectiveDate: new Date().toISOString().split("T")[0],
  mndaTermType: "fixed",
  mndaTermYears: 1,
  confidentialityTermType: "fixed",
  confidentialityTermYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  party1: { ...DEFAULT_PARTY },
  party2: { ...DEFAULT_PARTY },
};

export const useNDAStore = create<NDAStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      formData: { ...initialFormData },
      setStep: (step) => set({ currentStep: step }),
      updateForm: (patch) =>
        set((state) => ({
          formData: { ...state.formData, ...patch },
        })),
      updateParty1: (patch) =>
        set((state) => ({
          formData: {
            ...state.formData,
            party1: { ...state.formData.party1, ...patch },
          },
        })),
      updateParty2: (patch) =>
        set((state) => ({
          formData: {
            ...state.formData,
            party2: { ...state.formData.party2, ...patch },
          },
        })),
      reset: () => set({ currentStep: 1, formData: { ...initialFormData } }),
    }),
    {
      name: "nda-form-storage",
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
