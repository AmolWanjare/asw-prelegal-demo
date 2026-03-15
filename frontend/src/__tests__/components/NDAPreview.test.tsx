import { render, screen, fireEvent } from "@testing-library/react";
import { NDAPreview } from "@/components/preview/NDAPreview";
import type { NDAFormData } from "@/lib/ndaSchema";

// Mock generatePdf to avoid actual PDF generation in tests
jest.mock("@/lib/generatePdf", () => ({
  generatePdf: jest.fn().mockResolvedValue(undefined),
}));

const mockData: NDAFormData = {
  purpose: "exploring a potential partnership",
  effectiveDate: "2026-01-15",
  mndaTermType: "fixed",
  mndaTermYears: 2,
  confidentialityTermType: "perpetuity",
  confidentialityTermYears: 3,
  governingLaw: "Delaware",
  jurisdiction: "courts located in Wilmington, DE",
  modifications: "",
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

describe("NDAPreview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Review & Download heading", () => {
    render(<NDAPreview data={mockData} />);
    expect(
      screen.getByRole("heading", { name: "Review & Download" })
    ).toBeInTheDocument();
  });

  it("renders the Download PDF button", () => {
    render(<NDAPreview data={mockData} />);
    expect(
      screen.getByRole("button", { name: /download pdf/i })
    ).toBeInTheDocument();
  });

  it("download button has type=button", () => {
    render(<NDAPreview data={mockData} />);
    const btn = screen.getByRole("button", { name: /download pdf/i });
    expect(btn).toHaveAttribute("type", "button");
  });

  it("download button has aria-busy=false by default", () => {
    render(<NDAPreview data={mockData} />);
    const btn = screen.getByRole("button", { name: /download pdf/i });
    expect(btn).toHaveAttribute("aria-busy", "false");
  });

  it("calls generatePdf when download button is clicked", async () => {
    const { generatePdf } = require("@/lib/generatePdf");
    render(<NDAPreview data={mockData} />);

    fireEvent.click(
      screen.getByRole("button", { name: /download pdf/i })
    );

    // Wait for async call
    await screen.findByRole("button", { name: /download pdf/i });
    expect(generatePdf).toHaveBeenCalledTimes(1);
  });

  it("passes sanitized filename to generatePdf", async () => {
    const { generatePdf } = require("@/lib/generatePdf");
    render(<NDAPreview data={mockData} />);

    fireEvent.click(
      screen.getByRole("button", { name: /download pdf/i })
    );

    await screen.findByRole("button", { name: /download pdf/i });
    const [, filename] = generatePdf.mock.calls[0];
    expect(filename).toBe("Mutual-NDA_AlphaCorp_BetaInc.pdf");
  });

  it("sanitizes special characters from company names in filename", async () => {
    const { generatePdf } = require("@/lib/generatePdf");
    const data = {
      ...mockData,
      party1: { ...mockData.party1, company: "Alpha/Corp" },
      party2: { ...mockData.party2, company: "../Evil" },
    };
    render(<NDAPreview data={data} />);

    fireEvent.click(
      screen.getByRole("button", { name: /download pdf/i })
    );

    await screen.findByRole("button", { name: /download pdf/i });
    const [, filename] = generatePdf.mock.calls[0];
    expect(filename).toBe("Mutual-NDA_AlphaCorp_Evil.pdf");
    expect(filename).not.toContain("/");
    expect(filename).not.toContain("..");
  });

  it("renders NDACoverPage and NDAStandardTerms", () => {
    render(<NDAPreview data={mockData} />);
    // Cover page content
    expect(
      screen.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })
    ).toBeInTheDocument();
    // Standard Terms content
    expect(
      screen.getByRole("heading", { name: "Standard Terms" })
    ).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<NDAPreview data={mockData} />);
    expect(
      screen.getByText(
        "Review the completed agreement below, then download as PDF."
      )
    ).toBeInTheDocument();
  });

  it("SVG icons have aria-hidden", () => {
    const { container } = render(<NDAPreview data={mockData} />);
    // The download icon SVG should be aria-hidden
    const svgs = container.querySelectorAll("button svg");
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });
});
