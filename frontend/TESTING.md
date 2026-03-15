# Testing Guide — Mutual NDA Creator

## Quick Start

```bash
cd frontend

# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests (all browsers)
npm run test:e2e

# E2E tests with browser visible
npm run test:e2e:headed

# Run specific E2E test file
npx playwright test src/__tests__/e2e/accessibility.spec.ts
```

## Test Structure

```
src/__tests__/
├── setup.ts                         # Jest setup (testing-library matchers)
├── unit/
│   ├── constants.test.ts            # US states, default values
│   ├── ndaSchema.test.ts            # Zod validation schemas
│   └── ndaStore.test.ts             # Zustand store logic
├── components/                      # (future) React component tests
└── e2e/
    ├── wizard-flow.spec.ts          # Full wizard navigation & flow
    ├── pdf-download.spec.ts         # PDF generation & download
    ├── accessibility.spec.ts        # axe-core WCAG 2.1 AA checks
    └── cross-browser.spec.ts        # Cross-browser compatibility
```

## Cross-Browser Matrix

E2E tests run automatically on:
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5 viewport)
- Mobile Safari (iPhone 12 viewport)

## Manual Test Plan

### 1. First-Time User Flow
- [ ] Open `http://localhost:3000` — should redirect to `/nda`
- [ ] Verify Step 1 form displays with default purpose text and today's date
- [ ] Verify "01 General Terms" is highlighted in the step indicator
- [ ] Try clicking Continue without filling Governing Law — should show validation error
- [ ] Fill Governing Law (select a state) and Jurisdiction
- [ ] Click Continue — should advance to Step 2

### 2. Step 2 — Party Details
- [ ] Verify "02 Party Details" is highlighted, "01" shows a checkmark
- [ ] Fill Party 1: Name, Title, Company, Notice Address, Date
- [ ] Fill Party 2: Name, Title, Company, Notice Address, Date
- [ ] Try clicking "Generate NDA" without required fields — should show errors
- [ ] Fill all required fields and click "Generate NDA"

### 3. Step 3 — Preview & Download
- [ ] Verify URL is `/nda/preview`
- [ ] Verify the Cover Page section shows all entered data
- [ ] Verify the Standard Terms section (11 numbered sections) is rendered
- [ ] Verify user-entered values (Purpose, Governing Law, Jurisdiction, dates) are highlighted in the Standard Terms text
- [ ] Verify Party 1 and Party 2 signature blocks show the entered names, titles, companies
- [ ] Verify blank signature lines are present
- [ ] Click "Download PDF"
- [ ] Verify a PDF file downloads with filename: `Mutual-NDA_[Company1]_[Company2].pdf`
- [ ] Open the downloaded PDF:
  - [ ] Cover page is on page 1
  - [ ] Standard terms start on page 2
  - [ ] All entered data is correctly populated
  - [ ] Formatting is clean and professional
  - [ ] Signature lines are visible

### 4. Navigation & State
- [ ] On preview page, click "Back" — should return to Step 2 with data intact
- [ ] Click "Back" again — should return to Step 1 with data intact
- [ ] Refresh the page on Step 2 — data should persist (sessionStorage)
- [ ] Open a new tab to `/nda` — should start fresh (separate sessionStorage)

### 5. Form Interaction Edge Cases
- [ ] MNDA Term: Switch between "fixed" and "until terminated" radio options
- [ ] When "fixed" is selected, change the year value — verify it updates
- [ ] Term of Confidentiality: Switch between "fixed" and "perpetuity"
- [ ] Enter special characters in text fields (quotes, ampersands, angle brackets)
- [ ] Enter very long text in the Purpose field — verify it doesn't break layout
- [ ] Enter a modifications text — verify it shows on the preview page
- [ ] Leave optional fields empty — verify they show "_______________" in the preview

### 6. PDF Download Verification
- [ ] Download PDF in Chrome — verify it opens correctly
- [ ] Download PDF in Firefox — verify it opens correctly
- [ ] Download PDF in Safari — verify it opens correctly
- [ ] Verify PDF contains all 11 Standard Terms sections
- [ ] Verify PDF page breaks don't cut through mid-paragraph
- [ ] Verify the filename is sanitized (no special chars from company names)

### 7. Responsive Design
- [ ] Test on desktop (1440px) — full layout with step labels visible
- [ ] Test on tablet (768px) — form cards should stack properly
- [ ] Test on mobile (375px) — step labels may hide, form should still be usable
- [ ] Verify all buttons are tappable on mobile
- [ ] Verify text inputs are not cut off on narrow screens

### 8. Accessibility Checks
- [ ] Tab through entire form — all inputs should be reachable
- [ ] Tab order should follow visual order (top to bottom, left to right)
- [ ] Radio buttons should be operable with arrow keys
- [ ] Screen reader: form fields should announce their labels
- [ ] Screen reader: error messages should be announced
- [ ] Verify sufficient color contrast (use browser DevTools or axe extension)
- [ ] Verify the page works with browser zoom at 200%
