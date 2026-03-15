import { z } from "zod";

const partySchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string(),
  company: z.string().min(1, "Company is required"),
  noticeAddress: z.string(),
  date: z.string(),
});

export const generalTermsSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  mndaTermType: z.enum(["fixed", "until_terminated"]),
  mndaTermYears: z.number().min(1).max(99),
  confidentialityTermType: z.enum(["fixed", "perpetuity"]),
  confidentialityTermYears: z.number().min(1).max(99),
  governingLaw: z.string().min(1, "Governing law state is required"),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  modifications: z.string(),
});

export const partyDetailsSchema = z.object({
  party1: partySchema,
  party2: partySchema,
});

export const ndaFormSchema = generalTermsSchema.merge(partyDetailsSchema);

export type NDAFormData = z.infer<typeof ndaFormSchema>;
export type PartyDetails = z.infer<typeof partySchema>;
export type GeneralTerms = z.infer<typeof generalTermsSchema>;
