import { render, screen } from "@testing-library/react";
import { NDAStandardTerms } from "@/components/preview/NDAStandardTerms";
import type { NDAFormData } from "@/lib/ndaSchema";

const mockData: NDAFormData = {
  purpose: "evaluating a potential business relationship",
  effectiveDate: "2026-03-01",
  mndaTermType: "fixed",
  mndaTermYears: 3,
  confidentialityTermType: "fixed",
  confidentialityTermYears: 5,
  governingLaw: "California",
  jurisdiction: "courts in San Francisco, CA",
  modifications: "",
  party1: {
    name: "Test User",
    title: "CEO",
    company: "TestCorp",
    noticeAddress: "test@test.com",
    date: "2026-03-01",
  },
  party2: {
    name: "Other User",
    title: "CTO",
    company: "OtherCorp",
    noticeAddress: "other@other.com",
    date: "2026-03-01",
  },
};

describe("NDAStandardTerms", () => {
  it("renders the Standard Terms heading", () => {
    render(<NDAStandardTerms data={mockData} />);
    expect(
      screen.getByRole("heading", { name: "Standard Terms" })
    ).toBeInTheDocument();
  });

  it("renders all 11 section titles", () => {
    render(<NDAStandardTerms data={mockData} />);
    expect(screen.getByText(/1\. Introduction\./)).toBeInTheDocument();
    expect(
      screen.getByText(/2\. Use and Protection of Confidential Information\./)
    ).toBeInTheDocument();
    expect(screen.getByText(/3\. Exceptions\./)).toBeInTheDocument();
    expect(
      screen.getByText(/4\. Disclosures Required by Law\./)
    ).toBeInTheDocument();
    expect(screen.getByText(/5\. Term and Termination\./)).toBeInTheDocument();
    expect(
      screen.getByText(
        /6\. Return or Destruction of Confidential Information\./
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/7\. Proprietary Rights\./)).toBeInTheDocument();
    expect(screen.getByText(/8\. Disclaimer\./)).toBeInTheDocument();
    expect(
      screen.getByText(/9\. Governing Law and Jurisdiction\./)
    ).toBeInTheDocument();
    expect(screen.getByText(/10\. Equitable Relief\./)).toBeInTheDocument();
    expect(screen.getByText(/11\. General\./)).toBeInTheDocument();
  });

  it("injects the purpose into section text", () => {
    render(<NDAStandardTerms data={mockData} />);
    // The purpose should appear highlighted in the document
    const highlighted = screen.getAllByText(
      "evaluating a potential business relationship"
    );
    expect(highlighted.length).toBeGreaterThan(0);
  });

  it("injects the governing law into section 9", () => {
    render(<NDAStandardTerms data={mockData} />);
    const californiaSpans = screen.getAllByText("California");
    expect(californiaSpans.length).toBeGreaterThan(0);
  });

  it("injects the jurisdiction into section 9", () => {
    render(<NDAStandardTerms data={mockData} />);
    const jurisdictionSpans = screen.getAllByText(
      "courts in San Francisco, CA"
    );
    expect(jurisdictionSpans.length).toBeGreaterThan(0);
  });

  it("injects effective date into section 5", () => {
    render(<NDAStandardTerms data={mockData} />);
    expect(screen.getByText("March 1, 2026")).toBeInTheDocument();
  });

  it("injects MNDA term years into section 5 for fixed type", () => {
    render(<NDAStandardTerms data={mockData} />);
    expect(
      screen.getByText("3 year(s) from the Effective Date")
    ).toBeInTheDocument();
  });

  it("shows 'until terminated' text for until_terminated type", () => {
    const data = { ...mockData, mndaTermType: "until_terminated" as const };
    render(<NDAStandardTerms data={data} />);
    expect(
      screen.getByText("until terminated by either party")
    ).toBeInTheDocument();
  });

  it("injects confidentiality term for fixed type", () => {
    render(<NDAStandardTerms data={mockData} />);
    expect(screen.getByText("5 year(s)")).toBeInTheDocument();
  });

  it("shows 'in perpetuity' for perpetuity confidentiality type", () => {
    const data = {
      ...mockData,
      confidentialityTermType: "perpetuity" as const,
    };
    render(<NDAStandardTerms data={data} />);
    expect(screen.getByText("in perpetuity")).toBeInTheDocument();
  });

  it("renders highlighted values with distinct styling", () => {
    const { container } = render(<NDAStandardTerms data={mockData} />);
    // Highlighted values should have the amber text class
    const highlighted = container.querySelectorAll("span.text-amber");
    expect(highlighted.length).toBeGreaterThan(0);
  });

  it("does not break when user input contains special regex characters", () => {
    const data = {
      ...mockData,
      purpose: "testing (with) special [chars] and $dollars",
    };
    expect(() => render(<NDAStandardTerms data={data} />)).not.toThrow();
    expect(
      screen.getAllByText("testing (with) special [chars] and $dollars")
    ).toHaveLength(3); // appears in sections 1 and 2 (twice in 2)
  });

  it("renders CC BY 4.0 attribution footer", () => {
    render(<NDAStandardTerms data={mockData} />);
    expect(screen.getByText(/CC BY 4\.0/)).toBeInTheDocument();
  });
});
