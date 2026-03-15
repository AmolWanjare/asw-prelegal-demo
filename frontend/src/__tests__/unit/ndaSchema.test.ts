import { generalTermsSchema, partyDetailsSchema, ndaFormSchema } from "@/lib/ndaSchema";

describe("generalTermsSchema", () => {
  const validTerms = {
    purpose: "Evaluating a business relationship",
    effectiveDate: "2026-03-15",
    mndaTermType: "fixed" as const,
    mndaTermYears: 1,
    confidentialityTermType: "fixed" as const,
    confidentialityTermYears: 1,
    governingLaw: "California",
    jurisdiction: "courts located in San Francisco, CA",
    modifications: "",
  };

  it("accepts valid general terms", () => {
    const result = generalTermsSchema.safeParse(validTerms);
    expect(result.success).toBe(true);
  });

  it("rejects empty purpose", () => {
    const result = generalTermsSchema.safeParse({ ...validTerms, purpose: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty effective date", () => {
    const result = generalTermsSchema.safeParse({ ...validTerms, effectiveDate: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty governing law", () => {
    const result = generalTermsSchema.safeParse({ ...validTerms, governingLaw: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty jurisdiction", () => {
    const result = generalTermsSchema.safeParse({ ...validTerms, jurisdiction: "" });
    expect(result.success).toBe(false);
  });

  it("accepts until_terminated term type", () => {
    const result = generalTermsSchema.safeParse({
      ...validTerms,
      mndaTermType: "until_terminated",
    });
    expect(result.success).toBe(true);
  });

  it("accepts perpetuity confidentiality term", () => {
    const result = generalTermsSchema.safeParse({
      ...validTerms,
      confidentialityTermType: "perpetuity",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mndaTermYears below 1", () => {
    const result = generalTermsSchema.safeParse({ ...validTerms, mndaTermYears: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects mndaTermYears above 99", () => {
    const result = generalTermsSchema.safeParse({ ...validTerms, mndaTermYears: 100 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid mndaTermType", () => {
    const result = generalTermsSchema.safeParse({ ...validTerms, mndaTermType: "invalid" });
    expect(result.success).toBe(false);
  });

  it("allows empty modifications", () => {
    const result = generalTermsSchema.safeParse({ ...validTerms, modifications: "" });
    expect(result.success).toBe(true);
  });
});

describe("partyDetailsSchema", () => {
  const validParties = {
    party1: {
      name: "John Doe",
      title: "CEO",
      company: "Acme Inc",
      noticeAddress: "legal@acme.com",
      date: "2026-03-15",
    },
    party2: {
      name: "Jane Smith",
      title: "CTO",
      company: "Beta Corp",
      noticeAddress: "legal@beta.com",
      date: "2026-03-15",
    },
  };

  it("accepts valid party details", () => {
    const result = partyDetailsSchema.safeParse(validParties);
    expect(result.success).toBe(true);
  });

  it("rejects empty party1 name", () => {
    const result = partyDetailsSchema.safeParse({
      ...validParties,
      party1: { ...validParties.party1, name: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty party1 company", () => {
    const result = partyDetailsSchema.safeParse({
      ...validParties,
      party1: { ...validParties.party1, company: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty party2 name", () => {
    const result = partyDetailsSchema.safeParse({
      ...validParties,
      party2: { ...validParties.party2, name: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty party2 company", () => {
    const result = partyDetailsSchema.safeParse({
      ...validParties,
      party2: { ...validParties.party2, company: "" },
    });
    expect(result.success).toBe(false);
  });

  it("allows empty title, noticeAddress, date", () => {
    const result = partyDetailsSchema.safeParse({
      party1: { name: "A", title: "", company: "B", noticeAddress: "", date: "" },
      party2: { name: "C", title: "", company: "D", noticeAddress: "", date: "" },
    });
    expect(result.success).toBe(true);
  });
});

describe("ndaFormSchema", () => {
  it("validates full form data", () => {
    const fullData = {
      purpose: "Business evaluation",
      effectiveDate: "2026-03-15",
      mndaTermType: "fixed" as const,
      mndaTermYears: 2,
      confidentialityTermType: "perpetuity" as const,
      confidentialityTermYears: 1,
      governingLaw: "Delaware",
      jurisdiction: "courts in Wilmington, DE",
      modifications: "None",
      party1: { name: "A", title: "CEO", company: "X", noticeAddress: "a@x.com", date: "2026-03-15" },
      party2: { name: "B", title: "CTO", company: "Y", noticeAddress: "b@y.com", date: "2026-03-15" },
    };
    const result = ndaFormSchema.safeParse(fullData);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields across both schemas", () => {
    const result = ndaFormSchema.safeParse({
      purpose: "",
      effectiveDate: "",
      mndaTermType: "fixed",
      mndaTermYears: 1,
      confidentialityTermType: "fixed",
      confidentialityTermYears: 1,
      governingLaw: "",
      jurisdiction: "",
      modifications: "",
      party1: { name: "", title: "", company: "", noticeAddress: "", date: "" },
      party2: { name: "", title: "", company: "", noticeAddress: "", date: "" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("purpose");
      expect(paths).toContain("effectiveDate");
      expect(paths).toContain("governingLaw");
      expect(paths).toContain("jurisdiction");
      expect(paths).toContain("party1.name");
      expect(paths).toContain("party1.company");
      expect(paths).toContain("party2.name");
      expect(paths).toContain("party2.company");
    }
  });
});
