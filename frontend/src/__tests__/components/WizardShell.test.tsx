import { render, screen, fireEvent } from "@testing-library/react";
import { WizardShell } from "@/components/wizard/WizardShell";

describe("WizardShell", () => {
  it("renders the page title", () => {
    render(
      <WizardShell currentStep={1}>
        <div>Step content</div>
      </WizardShell>
    );
    expect(
      screen.getByRole("heading", { name: "Mutual NDA Creator" })
    ).toBeInTheDocument();
  });

  it("renders CommonPaper subtitle", () => {
    render(
      <WizardShell currentStep={1}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByText("CommonPaper Standard v1.0")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <WizardShell currentStep={1}>
        <div>My step content</div>
      </WizardShell>
    );
    expect(screen.getByText("My step content")).toBeInTheDocument();
  });

  it("renders skip navigation link", () => {
    render(
      <WizardShell currentStep={1}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByText("Skip to main content")).toBeInTheDocument();
  });

  it("skip link points to main content", () => {
    render(
      <WizardShell currentStep={1}>
        <div>Content</div>
      </WizardShell>
    );
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toHaveAttribute("href", "#main-content");
    expect(document.getElementById("main-content")).toBeInTheDocument();
  });

  it("renders step indicator nav with aria-label", () => {
    render(
      <WizardShell currentStep={1}>
        <div>Content</div>
      </WizardShell>
    );
    expect(
      screen.getByRole("navigation", { name: "Form progress" })
    ).toBeInTheDocument();
  });

  it("renders all three step labels", () => {
    render(
      <WizardShell currentStep={1}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByText("General Terms")).toBeInTheDocument();
    expect(screen.getByText("Party Details")).toBeInTheDocument();
    expect(screen.getByText("Review & Download")).toBeInTheDocument();
  });

  it("marks current step with aria-current=step", () => {
    const { container } = render(
      <WizardShell currentStep={2}>
        <div>Content</div>
      </WizardShell>
    );
    const currentStep = container.querySelector('[aria-current="step"]');
    expect(currentStep).toBeInTheDocument();
    expect(currentStep).toHaveTextContent("Party Details");
  });

  it("renders step numbers 01, 02, 03", () => {
    render(
      <WizardShell currentStep={1}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("does not render footer when no onBack or onNext", () => {
    const { container } = render(
      <WizardShell currentStep={1}>
        <div>Content</div>
      </WizardShell>
    );
    expect(container.querySelector("footer")).not.toBeInTheDocument();
  });

  it("renders Back and Next buttons when handlers provided", () => {
    render(
      <WizardShell currentStep={2} onBack={() => {}} onNext={() => {}}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue" })
    ).toBeInTheDocument();
  });

  it("uses custom nextLabel", () => {
    render(
      <WizardShell
        currentStep={2}
        onNext={() => {}}
        nextLabel="Generate NDA"
      >
        <div>Content</div>
      </WizardShell>
    );
    expect(
      screen.getByRole("button", { name: "Generate NDA" })
    ).toBeInTheDocument();
  });

  it("calls onBack when Back button clicked", () => {
    const onBack = jest.fn();
    render(
      <WizardShell currentStep={2} onBack={onBack} onNext={() => {}}>
        <div>Content</div>
      </WizardShell>
    );
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when Next button clicked", () => {
    const onNext = jest.fn();
    render(
      <WizardShell currentStep={1} onNext={onNext}>
        <div>Content</div>
      </WizardShell>
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("disables Back button when onBack is not provided", () => {
    render(
      <WizardShell currentStep={1} onNext={() => {}}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
  });

  it("disables Next button when nextDisabled is true", () => {
    render(
      <WizardShell currentStep={1} onNext={() => {}} nextDisabled>
        <div>Content</div>
      </WizardShell>
    );
    expect(
      screen.getByRole("button", { name: "Continue" })
    ).toBeDisabled();
  });

  it("navigation buttons have type=button", () => {
    render(
      <WizardShell currentStep={2} onBack={() => {}} onNext={() => {}}>
        <div>Content</div>
      </WizardShell>
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute("type", "button");
    });
  });

  it("decorative SVGs have aria-hidden", () => {
    const { container } = render(
      <WizardShell currentStep={2} onBack={() => {}} onNext={() => {}}>
        <div>Content</div>
      </WizardShell>
    );
    const svgs = container.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("shows completed sr-only text for completed steps", () => {
    render(
      <WizardShell currentStep={3}>
        <div>Content</div>
      </WizardShell>
    );
    // Steps 1 and 2 should be marked completed
    const completedTexts = screen.getAllByText("(completed)");
    expect(completedTexts).toHaveLength(2);
  });

  it("shows current sr-only text for active step", () => {
    render(
      <WizardShell currentStep={2}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByText("(current)")).toBeInTheDocument();
  });
});
