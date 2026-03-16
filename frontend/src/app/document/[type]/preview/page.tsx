import { DOCUMENT_CATALOG } from "@/lib/documentCatalog";
import { DocumentPreviewPage } from "@/components/preview/DocumentPreviewPage";

export function generateStaticParams() {
  return DOCUMENT_CATALOG.map((d) => ({ type: d.slug }));
}

export default function Page() {
  return <DocumentPreviewPage />;
}
