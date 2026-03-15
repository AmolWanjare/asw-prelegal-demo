import { render, screen } from "@testing-library/react";
import { NDACoverPage } from "@/components/preview/NDACoverPage";
import type { NDAFormData } from "@/lib/ndaSchema";

const mockData: NDAFormData = {
  purpose: "exploring a potential partnership",
  effectiveDate: "2026-01-15",
  mndaTermType: "fixed",
  mndaTermYears: 2,
  confidentialityTermType: "perpetuity",
  confidentialityTermYears: 3,
  governingLaw: "Delaware",
  jurisdiction: "courts located in Wilmington, DE",
  modifications: "Section 8 is deleted.",
  party1: {
    name: "Alice Johnson",
    title: "CEO",
    company: "AlphaCorp",
    noticeAddress: "alice@alphacorp.com",
    date: "2026-01-15",
  },
  party2: {
    name: "Bob Smith",
    title: "CTO",
    company: "BetaInc",
    noticeAddress: "bob@betainc.com",
    date: "2026-01-16",
  },
};

describe("NDACoverPage", () => {
  it("renders the document title", () => {
    render(<NDACoverPage data={mockData} />);
    expect(
      screen.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })
    ).toBeInTheDocument();
  });

  it("renders the purpose", () => {
    render(<NDACoverPage data={mockData} />);
    expect(
      screen.getByText("exploring a potential partnership")
    ).toBeInTheDocument();
  });

  it("formats and displays the effective date", () => {
    render(<NDACoverPage data={mockData} />);
    const matches = screen.getAllByText("January 15, 2026");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows fixed MNDA term text", () => {
    render(<NDACoverPage data={mockData} />);
    expect(
      screen.getByText(
        "Expires 2 year(s) from Effective Date."
      )
    ).toBeInTheDocument();
  });

  it("shows 'until terminated' text when mndaTermType is until_terminated", () => {
    const data = { ...mockData, mndaTermType: "until_terminated" as const };
    render(<NDACoverPage data={data} />);
    expect(
      screen.getByText(
        "Continues until terminated in accordance with the terms of the MNDA."
      )
    ).toBeInTheDocument();
  });

  it("shows perpetuity confidentiality term", () => {
    render(<NDACoverPage data={mockData} />);
    expect(screen.getByText("In perpetuity.")).toBeInTheDocument();
  });

  it("shows fixed confidentiality term when type is fixed", () => {
    const data = {
      ...mockData,
      confidentialityTermType: "fixed" as const,
      confidentialityTermYears: 5,
    };
    render(<NDACoverPage data={data} />);
    expect(
      screen.getByText(/5 year\(s\) from Effective Date/)
    ).toBeInTheDocument();
  });

  it("renders governing law", () => {
    render(<NDACoverPage data={mockData} />);
    expect(screen.getByText("Delaware")).toBeInTheDocument();
  });

  it("renders jurisdiction", () => {
    render(<NDACoverPage data={mockData} />);
    expect(
      screen.getByText("courts located in Wilmington, DE")
    ).toBeInTheDocument();
  });

  it("renders modifications when provided", () => {
    render(<NDACoverPage data={mockData} />);
    expect(screen.getByText("Section 8 is deleted.")).toBeInTheDocument();
  });

  it("does not render modifications section when empty", () => {
    const data = { ...mockData, modifications: "" };
    render(<NDACoverPage data={data} />);
    // "Modifications" heading should not be present
    expect(screen.queryByText("Modifications")).not.toBeInTheDocument();
  });

  it("renders party 1 details", () => {
    render(<NDACoverPage data={mockData} />);
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("CEO")).toBeInTheDocument();
    expect(screen.getByText("AlphaCorp")).toBeInTheDocument();
    expect(screen.getByText("alice@alphacorp.com")).toBeInTheDocument();
  });

  it("renders party 2 details", () => {
    render(<NDACoverPage data={mockData} />);
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getByText("CTO")).toBeInTheDocument();
    expect(screen.getByText("BetaInc")).toBeInTheDocument();
    expect(screen.getByText("bob@betainc.com")).toBeInTheDocument();
  });

  it("shows placeholder lines for empty fields", () => {
    const data = {
      ...mockData,
      governingLaw: "",
      party1: { ...mockData.party1, name: "", title: "" },
    };
    render(<NDACoverPage data={data} />);
    // Empty fields should show placeholder underlines
    const placeholders = screen.getAllByText("_______________");
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it("renders both Party 1 and Party 2 headings", () => {
    render(<NDACoverPage data={mockData} />);
    expect(screen.getByText("Party 1")).toBeInTheDocument();
    expect(screen.getByText("Party 2")).toBeInTheDocument();
  });

  it("has pageBreakAfter style for PDF generation", () => {
    const { container } = render(<NDACoverPage data={mockData} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.pageBreakAfter).toBe("always");
  });
});
