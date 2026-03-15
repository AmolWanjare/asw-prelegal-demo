const STEPS = [
  { label: "General Terms", icon: "01" },
  { label: "Party Details", icon: "02" },
  { label: "Review & Download", icon: "03" },
];

interface WizardShellProps {
  currentStep: number;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: React.ReactNode;
}

export function WizardShell({
  currentStep,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  children,
}: WizardShellProps) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="no-print border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-charcoal flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-light">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-charcoal tracking-tight font-display">
                Mutual NDA Creator
              </h1>
              <p className="text-xs text-warm-gray mt-0.5 tracking-wide uppercase">
                CommonPaper Standard v1.0
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <nav className="no-print bg-white border-b border-border-light">
        <div className="max-w-3xl mx-auto px-6 py-0">
          <div className="flex">
            {STEPS.map((step, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === currentStep;
              const isCompleted = stepNum < currentStep;
              return (
                <div key={step.label} className="flex-1 relative">
                  <div className={`flex items-center gap-3 py-4 ${i > 0 ? "pl-4" : ""}`}>
                    <span
                      className={`font-display text-sm tracking-wide transition-colors duration-300 ${
                        isActive
                          ? "text-amber font-semibold"
                          : isCompleted
                          ? "text-charcoal"
                          : "text-warm-gray-light"
                      }`}
                    >
                      {step.icon}
                    </span>
                    <span
                      className={`text-sm hidden sm:inline transition-colors duration-300 ${
                        isActive
                          ? "text-charcoal font-medium"
                          : isCompleted
                          ? "text-warm-gray"
                          : "text-warm-gray-light"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCompleted && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  {/* Active indicator bar */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 transition-colors duration-300 ${
                      isActive ? "bg-amber" : isCompleted ? "bg-amber/20" : "bg-transparent"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <div className="animate-fade-in-up">{children}</div>
      </main>

      {/* Navigation buttons */}
      {(onBack || onNext) && (
        <footer className="no-print border-t border-border bg-white/90 backdrop-blur-sm sticky bottom-0">
          <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
            <button
              onClick={onBack}
              disabled={!onBack}
              className="group px-5 py-2.5 text-sm font-medium text-warm-gray border border-border rounded-lg hover:border-charcoal/20 hover:text-charcoal disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-0.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            {onNext && (
              <button
                onClick={onNext}
                disabled={nextDisabled}
                className="group px-6 py-2.5 text-sm font-semibold text-white bg-charcoal rounded-lg hover:bg-charcoal-light disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                {nextLabel}
                {nextLabel !== "Generate NDA" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
