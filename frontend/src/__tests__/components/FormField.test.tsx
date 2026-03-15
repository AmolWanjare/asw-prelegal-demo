import { render, screen } from "@testing-library/react";
import { FormField } from "@/components/ui/FormField";

describe("FormField", () => {
  it("renders label text", () => {
    render(
      <FormField label="Email">
        <input type="text" />
      </FormField>
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("shows 'required' badge when required prop is true", () => {
    render(
      <FormField label="Name" required>
        <input type="text" />
      </FormField>
    );
    expect(screen.getByText("required")).toBeInTheDocument();
  });

  it("does not show 'required' badge when required is false", () => {
    render(
      <FormField label="Name">
        <input type="text" />
      </FormField>
    );
    expect(screen.queryByText("required")).not.toBeInTheDocument();
  });

  it("renders hint text when provided", () => {
    render(
      <FormField label="Name" hint="Enter your full name">
        <input type="text" />
      </FormField>
    );
    expect(screen.getByText("Enter your full name")).toBeInTheDocument();
  });

  it("does not render hint when not provided", () => {
    const { container } = render(
      <FormField label="Name">
        <input type="text" />
      </FormField>
    );
    // No hint paragraph should exist
    const hints = container.querySelectorAll("p");
    expect(hints).toHaveLength(0);
  });

  it("renders error message with alert role", () => {
    render(
      <FormField label="Name" error="Name is required">
        <input type="text" />
      </FormField>
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Name is required");
  });

  it("does not render error when not provided", () => {
    render(
      <FormField label="Name">
        <input type="text" />
      </FormField>
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("connects label to input via htmlFor/id", () => {
    render(
      <FormField label="Username">
        <input type="text" />
      </FormField>
    );
    const label = screen.getByText("Username");
    const htmlFor = label.getAttribute("for");
    expect(htmlFor).toBeTruthy();

    const input = screen.getByRole("textbox");
    expect(input.id).toBe(htmlFor);
  });

  it("sets aria-invalid on input when error is present", () => {
    render(
      <FormField label="Email" error="Invalid email">
        <input type="text" />
      </FormField>
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("does not set aria-invalid when no error", () => {
    render(
      <FormField label="Email">
        <input type="text" />
      </FormField>
    );
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("sets aria-describedby linking to hint and error", () => {
    render(
      <FormField label="Name" hint="Full name" error="Required">
        <input type="text" />
      </FormField>
    );
    const input = screen.getByRole("textbox");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();

    // Both hint and error IDs should be referenced
    const ids = describedBy!.split(" ");
    expect(ids).toHaveLength(2);

    // Verify the IDs correspond to actual elements
    ids.forEach((id) => {
      expect(document.getElementById(id)).toBeInTheDocument();
    });
  });

  it("injects id into textarea children", () => {
    render(
      <FormField label="Description">
        <textarea />
      </FormField>
    );
    const label = screen.getByText("Description");
    const textarea = screen.getByRole("textbox");
    expect(textarea.id).toBe(label.getAttribute("for"));
  });

  it("injects id into select children", () => {
    render(
      <FormField label="Country">
        <select>
          <option value="us">US</option>
        </select>
      </FormField>
    );
    const label = screen.getByText("Country");
    const select = screen.getByRole("combobox");
    expect(select.id).toBe(label.getAttribute("for"));
  });
});
