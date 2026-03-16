// Keep in sync with backend/app/registry/document_registry.py
// This static copy is needed for generateStaticParams (static export).

export interface DocumentEntry {
  slug: string;
  name: string;
  description: string;
  filename: string;
}

export const DOCUMENT_CATALOG: DocumentEntry[] = [
  { slug: "mutual_nda", name: "Mutual NDA", description: "Mutual Non-Disclosure Agreement for protecting confidential information shared between two parties.", filename: "Mutual-NDA.md" },
  { slug: "cloud_service_agreement", name: "Cloud Service Agreement", description: "Cloud Service Agreement covering SaaS and cloud service subscriptions.", filename: "CSA.md" },
  { slug: "service_level_agreement", name: "Service Level Agreement", description: "Service Level Agreement defining uptime targets, response times, and service credit remedies.", filename: "SLA.md" },
  { slug: "design_partner_agreement", name: "Design Partner Agreement", description: "Design Partner Agreement for early product access and feedback partnerships.", filename: "Design-Partner-Agreement.md" },
  { slug: "professional_services_agreement", name: "Professional Services Agreement", description: "Professional Services Agreement for consulting, implementation, and custom development.", filename: "PSA.md" },
  { slug: "data_processing_agreement", name: "Data Processing Agreement", description: "Data Processing Agreement for GDPR and data protection compliance.", filename: "DPA.md" },
  { slug: "partnership_agreement", name: "Partnership Agreement", description: "Partnership Agreement for co-marketing, referral, and strategic partnerships.", filename: "Partnership-Agreement.md" },
  { slug: "software_license_agreement", name: "Software License Agreement", description: "Software License Agreement for on-premise or installable software licensing.", filename: "Software-License-Agreement.md" },
  { slug: "pilot_agreement", name: "Pilot Agreement", description: "Pilot Agreement for trial and evaluation access to products.", filename: "Pilot-Agreement.md" },
  { slug: "business_associate_agreement", name: "Business Associate Agreement", description: "Business Associate Agreement for HIPAA compliance.", filename: "BAA.md" },
  { slug: "ai_addendum", name: "AI Addendum", description: "AI Addendum covering AI service usage, model training restrictions, and IP.", filename: "AI-Addendum.md" },
];

export function getDocumentEntry(slug: string): DocumentEntry | undefined {
  return DOCUMENT_CATALOG.find((d) => d.slug === slug);
}
