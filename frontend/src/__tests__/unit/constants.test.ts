import { US_STATES, DEFAULT_PURPOSE, DEFAULT_PARTY } from "@/lib/constants";

describe("US_STATES", () => {
  it("contains all 50 states", () => {
    expect(US_STATES).toHaveLength(50);
  });

  it("starts with Alabama and ends with Wyoming", () => {
    expect(US_STATES[0]).toBe("Alabama");
    expect(US_STATES[US_STATES.length - 1]).toBe("Wyoming");
  });

  it("is sorted alphabetically", () => {
    const sorted = [...US_STATES].sort();
    expect(US_STATES).toEqual(sorted);
  });

  it("includes commonly referenced states", () => {
    expect(US_STATES).toContain("California");
    expect(US_STATES).toContain("Delaware");
    expect(US_STATES).toContain("New York");
    expect(US_STATES).toContain("Texas");
  });
});

describe("DEFAULT_PURPOSE", () => {
  it("matches the CommonPaper template default", () => {
    expect(DEFAULT_PURPOSE).toBe(
      "Evaluating whether to enter into a business relationship with the other party."
    );
  });
});

describe("DEFAULT_PARTY", () => {
  it("has all required fields as empty strings", () => {
    expect(DEFAULT_PARTY).toEqual({
      name: "",
      title: "",
      company: "",
      noticeAddress: "",
      date: "",
    });
  });
});
