import { useNDAStore } from "@/lib/ndaStore";
import { DEFAULT_PURPOSE } from "@/lib/constants";

// Reset store before each test
beforeEach(() => {
  useNDAStore.getState().reset();
});

describe("useNDAStore", () => {
  describe("initial state", () => {
    it("starts at step 1", () => {
      expect(useNDAStore.getState().currentStep).toBe(1);
    });

    it("has default purpose", () => {
      expect(useNDAStore.getState().formData.purpose).toBe(DEFAULT_PURPOSE);
    });

    it("has today's date as effective date", () => {
      const today = new Date().toISOString().split("T")[0];
      expect(useNDAStore.getState().formData.effectiveDate).toBe(today);
    });

    it("defaults to fixed term types", () => {
      const { formData } = useNDAStore.getState();
      expect(formData.mndaTermType).toBe("fixed");
      expect(formData.confidentialityTermType).toBe("fixed");
    });

    it("has empty party details", () => {
      const { formData } = useNDAStore.getState();
      expect(formData.party1.name).toBe("");
      expect(formData.party1.company).toBe("");
      expect(formData.party2.name).toBe("");
      expect(formData.party2.company).toBe("");
    });
  });

  describe("setStep", () => {
    it("updates current step", () => {
      useNDAStore.getState().setStep(2);
      expect(useNDAStore.getState().currentStep).toBe(2);
    });

    it("can set to step 3", () => {
      useNDAStore.getState().setStep(3);
      expect(useNDAStore.getState().currentStep).toBe(3);
    });
  });

  describe("updateForm", () => {
    it("updates a single field", () => {
      useNDAStore.getState().updateForm({ governingLaw: "California" });
      expect(useNDAStore.getState().formData.governingLaw).toBe("California");
    });

    it("updates multiple fields at once", () => {
      useNDAStore.getState().updateForm({
        governingLaw: "Delaware",
        jurisdiction: "Wilmington, DE",
      });
      const { formData } = useNDAStore.getState();
      expect(formData.governingLaw).toBe("Delaware");
      expect(formData.jurisdiction).toBe("Wilmington, DE");
    });

    it("does not overwrite unrelated fields", () => {
      useNDAStore.getState().updateForm({ governingLaw: "Texas" });
      expect(useNDAStore.getState().formData.purpose).toBe(DEFAULT_PURPOSE);
    });
  });

  describe("updateParty1", () => {
    it("updates party1 without affecting party2", () => {
      useNDAStore.getState().updateParty1({ name: "Alice", company: "AliceCorp" });
      useNDAStore.getState().updateParty2({ name: "Bob", company: "BobCorp" });

      const { formData } = useNDAStore.getState();
      expect(formData.party1.name).toBe("Alice");
      expect(formData.party1.company).toBe("AliceCorp");
      expect(formData.party2.name).toBe("Bob");
      expect(formData.party2.company).toBe("BobCorp");
    });

    it("partially updates party fields", () => {
      useNDAStore.getState().updateParty1({ name: "Alice" });
      expect(useNDAStore.getState().formData.party1.name).toBe("Alice");
      expect(useNDAStore.getState().formData.party1.company).toBe("");
    });
  });

  describe("reset", () => {
    it("resets to initial state", () => {
      useNDAStore.getState().setStep(3);
      useNDAStore.getState().updateForm({ governingLaw: "New York" });
      useNDAStore.getState().updateParty1({ name: "Test" });

      useNDAStore.getState().reset();

      expect(useNDAStore.getState().currentStep).toBe(1);
      expect(useNDAStore.getState().formData.governingLaw).toBe("");
      expect(useNDAStore.getState().formData.party1.name).toBe("");
    });
  });
});
