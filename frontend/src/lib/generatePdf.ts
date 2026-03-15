export async function generatePdf(element: HTMLElement, filename: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf = (await import("html2pdf.js")).default as any;
  await html2pdf()
    .set({
      margin: [15, 20, 15, 20],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    })
    .from(element)
    .save();
}
