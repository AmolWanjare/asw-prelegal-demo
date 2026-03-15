import { render, screen, fireEvent } from "@testing-library/react";
import { RadioGroup } from "@/components/ui/RadioGroup";

const basicOptions = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
  { value: "c", label: "Option C" },
];

describe("RadioGroup", () => {
  it("renders all options", () => {
    render(
      <RadioGroup
        name="test"
        value="a"
        onChange={() => {}}
        options={basicOptions}
      />
    );
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();
  });

  it("has role=radiogroup on container", () => {
    render(
      <RadioGroup
        name="test"
        value="a"
        onChange={() => {}}
        options={basicOptions}
      />
    );
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("sets aria-labelledby when legendId is provided", () => {
    render(
      <>
        <h3 id="my-legend">Pick one</h3>
        <RadioGroup
          name="test"
          value="a"
          onChange={() => {}}
          options={basicOptions}
          legendId="my-legend"
        />
      </>
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-labelledby",
      "my-legend"
    );
  });

  it("renders radio inputs for each option", () => {
    render(
      <RadioGroup
        name="test"
        value="a"
        onChange={() => {}}
        options={basicOptions}
      />
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("checks the selected radio", () => {
    render(
      <RadioGroup
        name="test"
        value="b"
        onChange={() => {}}
        options={basicOptions}
      />
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
    expect(radios[2]).not.toBeChecked();
  });

  it("calls onChange when a radio is clicked", () => {
    const onChange = jest.fn();
    render(
      <RadioGroup
        name="test"
        value="a"
        onChange={onChange}
        options={basicOptions}
      />
    );
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[2]);
    expect(onChange).toHaveBeenCalledWith("c");
  });

  it("renders sub-input when option is selected and has subInput config", () => {
    const onSubChange = jest.fn();
    const options = [
      {
        value: "fixed",
        label: "Fixed term",
        subInput: {
          type: "number" as const,
          value: 2,
          onChange: onSubChange,
          suffix: "year(s)",
        },
      },
      { value: "perpetual", label: "Perpetual" },
    ];

    render(
      <RadioGroup
        name="term"
        value="fixed"
        onChange={() => {}}
        options={options}
      />
    );

    // Should show the number input
    const numberInput = screen.getByRole("spinbutton");
    expect(numberInput).toBeInTheDocument();
    expect(numberInput).toHaveValue(2);
    expect(screen.getByText("year(s)")).toBeInTheDocument();
  });

  it("does not render sub-input when option is not selected", () => {
    const options = [
      {
        value: "fixed",
        label: "Fixed term",
        subInput: {
          type: "number" as const,
          value: 2,
          onChange: jest.fn(),
          suffix: "year(s)",
        },
      },
      { value: "perpetual", label: "Perpetual" },
    ];

    render(
      <RadioGroup
        name="term"
        value="perpetual"
        onChange={() => {}}
        options={options}
      />
    );

    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("sub-input has aria-label for accessibility", () => {
    const options = [
      {
        value: "fixed",
        label: "Fixed term",
        subInput: {
          type: "number" as const,
          value: 3,
          onChange: jest.fn(),
          suffix: "year(s)",
        },
      },
    ];

    render(
      <RadioGroup
        name="mndaTerm"
        value="fixed"
        onChange={() => {}}
        options={options}
      />
    );

    const numberInput = screen.getByRole("spinbutton");
    expect(numberInput).toHaveAttribute(
      "aria-label",
      "Number of years for mndaTerm"
    );
  });

  it("sub-input onChange clamps values between 1 and 99", () => {
    const onSubChange = jest.fn();
    const options = [
      {
        value: "fixed",
        label: "Fixed term",
        subInput: {
          type: "number" as const,
          value: 5,
          onChange: onSubChange,
          suffix: "year(s)",
        },
      },
    ];

    render(
      <RadioGroup
        name="term"
        value="fixed"
        onChange={() => {}}
        options={options}
      />
    );

    const numberInput = screen.getByRole("spinbutton");

    // Simulate changing to 0 — should clamp to 1
    fireEvent.change(numberInput, { target: { value: "0", valueAsNumber: 0 } });
    expect(onSubChange).toHaveBeenCalledWith(1);

    onSubChange.mockClear();

    // Simulate changing to 100 — should clamp to 99
    fireEvent.change(numberInput, {
      target: { value: "100", valueAsNumber: 100 },
    });
    expect(onSubChange).toHaveBeenCalledWith(99);
  });

  it("decorative radio indicator has aria-hidden", () => {
    const { container } = render(
      <RadioGroup
        name="test"
        value="a"
        onChange={() => {}}
        options={basicOptions}
      />
    );
    const decorative = container.querySelector('[aria-hidden="true"]');
    expect(decorative).toBeInTheDocument();
  });
});
