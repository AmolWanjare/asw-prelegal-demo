import { render, screen, fireEvent } from "@testing-library/react";
import { StateSelect } from "@/components/ui/StateSelect";
import { US_STATES } from "@/lib/constants";

describe("StateSelect", () => {
  it("renders a select element", () => {
    render(<StateSelect value="" onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders all 50 US states plus placeholder", () => {
    render(<StateSelect value="" onChange={() => {}} />);
    const options = screen.getAllByRole("option");
    // 50 states + 1 placeholder
    expect(options).toHaveLength(51);
  });

  it("has a placeholder option", () => {
    render(<StateSelect value="" onChange={() => {}} />);
    expect(screen.getByText("Select a state...")).toBeInTheDocument();
  });

  it("renders each US state as an option", () => {
    render(<StateSelect value="" onChange={() => {}} />);
    expect(screen.getByText("California")).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
    expect(screen.getByText("Texas")).toBeInTheDocument();
    expect(screen.getByText("Delaware")).toBeInTheDocument();
  });

  it("displays the selected value", () => {
    render(<StateSelect value="California" onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toHaveValue("California");
  });

  it("calls onChange with selected state", () => {
    const onChange = jest.fn();
    render(<StateSelect value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "New York" },
    });
    expect(onChange).toHaveBeenCalledWith("New York");
  });

  it("forwards id prop to select element", () => {
    render(<StateSelect value="" onChange={() => {}} id="gov-law" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("id", "gov-law");
  });

  it("forwards aria-describedby prop", () => {
    render(
      <StateSelect
        value=""
        onChange={() => {}}
        aria-describedby="hint-123"
      />
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-describedby",
      "hint-123"
    );
  });

  it("forwards aria-invalid prop", () => {
    render(
      <StateSelect value="" onChange={() => {}} aria-invalid={true} />
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("lists states in the same order as US_STATES constant", () => {
    render(<StateSelect value="" onChange={() => {}} />);
    const options = screen.getAllByRole("option");
    // Skip placeholder (index 0)
    US_STATES.forEach((state, i) => {
      expect(options[i + 1]).toHaveTextContent(state);
    });
  });
});
