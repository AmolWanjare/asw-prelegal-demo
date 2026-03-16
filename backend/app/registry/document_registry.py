"""Registry of all supported legal document types and their field definitions."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class FieldSpec:
    key: str
    label: str
    field_type: str = "string"  # string, integer, boolean, enum, object
    required: bool = False
    enum_values: list[str] | None = None
    nested_fields: list[FieldSpec] | None = None
    default: str | None = None
    hint: str | None = None


@dataclass
class DocumentTypeConfig:
    slug: str
    display_name: str
    catalog_filename: str
    description: str
    fields: list[FieldSpec]
    conversation_flow: list[str]
    required_fields: list[str]
    completion_phrase: str = "I've filled in all the fields, ready to generate!"


# ---------------------------------------------------------------------------
# Shared party-like field specs
# ---------------------------------------------------------------------------

def _party_fields(prefix_label: str) -> list[FieldSpec]:
    return [
        FieldSpec(key="name", label=f"{prefix_label} Name", required=True),
        FieldSpec(key="title", label=f"{prefix_label} Title"),
        FieldSpec(key="company", label=f"{prefix_label} Company", required=True),
        FieldSpec(key="noticeAddress", label=f"{prefix_label} Notice Address"),
        FieldSpec(key="date", label=f"{prefix_label} Date"),
    ]


def _two_party_fields(label1: str = "Party 1", label2: str = "Party 2",
                       key1: str = "party1", key2: str = "party2") -> list[FieldSpec]:
    return [
        FieldSpec(key=key1, label=label1, field_type="object", required=True,
                  nested_fields=_party_fields(label1)),
        FieldSpec(key=key2, label=label2, field_type="object", required=True,
                  nested_fields=_party_fields(label2)),
    ]


# ---------------------------------------------------------------------------
# Document type definitions
# ---------------------------------------------------------------------------

MUTUAL_NDA = DocumentTypeConfig(
    slug="mutual_nda",
    display_name="Mutual NDA",
    catalog_filename="Mutual-NDA.md",
    description="Mutual Non-Disclosure Agreement for protecting confidential information shared between two parties.",
    fields=[
        FieldSpec(key="purpose", label="Purpose", required=True,
                  default="Evaluating whether to enter into a business relationship with the other party.",
                  hint="How Confidential Information may be used"),
        FieldSpec(key="effectiveDate", label="Effective Date", required=True,
                  hint="YYYY-MM-DD format"),
        FieldSpec(key="mndaTermType", label="MNDA Term Type", field_type="enum",
                  required=True, enum_values=["fixed", "until_terminated"],
                  hint='Does the MNDA expire after a fixed period or continue until terminated?'),
        FieldSpec(key="mndaTermYears", label="MNDA Term Years", field_type="integer",
                  hint="If mndaTermType is fixed, how many years? (1-99)"),
        FieldSpec(key="confidentialityTermType", label="Confidentiality Term Type",
                  field_type="enum", enum_values=["fixed", "perpetuity"],
                  hint="Does the confidentiality obligation last a fixed number of years or forever?"),
        FieldSpec(key="confidentialityTermYears", label="Confidentiality Term Years",
                  field_type="integer",
                  hint="If confidentialityTermType is fixed, how many years? (1-99)"),
        FieldSpec(key="governingLaw", label="Governing Law", required=True,
                  hint="Which US state's laws govern this agreement?"),
        FieldSpec(key="jurisdiction", label="Jurisdiction", required=True,
                  hint='Where will legal proceedings take place? e.g. "courts located in New Castle, DE"'),
        FieldSpec(key="modifications", label="Modifications",
                  hint="Any modifications to the standard terms"),
        *_two_party_fields("Party 1", "Party 2", "party1", "party2"),
    ],
    conversation_flow=[
        "purpose of the NDA",
        "effective date",
        "MNDA term (fixed or until terminated, and if fixed how many years)",
        "confidentiality term (fixed or perpetuity, and if fixed how many years)",
        "governing law (US state) and jurisdiction",
        "any modifications to the standard terms",
        "Party 1 details (name, title, company, notice address)",
        "Party 2 details",
    ],
    required_fields=[
        "purpose", "effectiveDate", "mndaTermType", "governingLaw", "jurisdiction",
        "party1.name", "party1.company", "party2.name", "party2.company",
    ],
)

CLOUD_SERVICE_AGREEMENT = DocumentTypeConfig(
    slug="cloud_service_agreement",
    display_name="Cloud Service Agreement",
    catalog_filename="CSA.md",
    description="Cloud Service Agreement covering SaaS and cloud service subscriptions between providers and customers.",
    fields=[
        FieldSpec(key="effectiveDate", label="Effective Date", required=True, hint="YYYY-MM-DD format"),
        *_two_party_fields("Provider", "Customer", "provider", "customer"),
        FieldSpec(key="dpa", label="Data Processing Agreement Reference",
                  hint="Reference to any existing DPA between the parties"),
        FieldSpec(key="governingLaw", label="Governing Law", required=True,
                  hint="Which jurisdiction's laws govern this agreement?"),
        FieldSpec(key="chosenCourts", label="Chosen Courts", required=True,
                  hint="Where will legal proceedings take place?"),
        FieldSpec(key="additionalWarranties", label="Additional Warranties"),
        FieldSpec(key="generalCapAmount", label="General Cap Amount",
                  hint="General liability cap amount"),
        FieldSpec(key="increasedCapAmount", label="Increased Cap Amount"),
        FieldSpec(key="increasedClaims", label="Increased Claims",
                  hint="Claims subject to the increased cap"),
        FieldSpec(key="unlimitedClaims", label="Unlimited Claims",
                  hint="Claims not subject to any cap"),
    ],
    conversation_flow=[
        "effective date",
        "provider details (name, company, notice address)",
        "customer details (name, company, notice address)",
        "governing law and chosen courts",
        "liability cap amounts (general and increased)",
        "claims categories (increased and unlimited)",
        "DPA reference and additional warranties",
    ],
    required_fields=[
        "effectiveDate", "provider.company", "customer.company",
        "governingLaw", "chosenCourts",
    ],
)

SERVICE_LEVEL_AGREEMENT = DocumentTypeConfig(
    slug="service_level_agreement",
    display_name="Service Level Agreement",
    catalog_filename="SLA.md",
    description="Service Level Agreement defining uptime targets, response times, and service credit remedies.",
    fields=[
        *_two_party_fields("Provider", "Customer", "provider", "customer"),
        FieldSpec(key="targetUptime", label="Target Uptime", required=True,
                  hint="e.g. 99.9%"),
        FieldSpec(key="targetResponseTime", label="Target Response Time",
                  hint="e.g. 4 hours for critical issues"),
        FieldSpec(key="supportChannel", label="Support Channel",
                  hint="e.g. email, phone, chat"),
        FieldSpec(key="uptimeCredit", label="Uptime Credit",
                  hint="Credit percentage for uptime failures"),
        FieldSpec(key="responseTimeCredit", label="Response Time Credit"),
        FieldSpec(key="subscriptionPeriod", label="Subscription Period",
                  hint="e.g. 1 year, monthly"),
        FieldSpec(key="scheduledDowntime", label="Scheduled Downtime",
                  hint="Maintenance windows or scheduled downtime policy"),
    ],
    conversation_flow=[
        "provider details (company name)",
        "customer details (company name)",
        "target uptime percentage",
        "target response times and support channels",
        "service credit terms",
        "subscription period and scheduled downtime",
    ],
    required_fields=["provider.company", "customer.company", "targetUptime"],
)

DESIGN_PARTNER_AGREEMENT = DocumentTypeConfig(
    slug="design_partner_agreement",
    display_name="Design Partner Agreement",
    catalog_filename="Design-Partner-Agreement.md",
    description="Design Partner Agreement for early product access and feedback partnerships.",
    fields=[
        FieldSpec(key="effectiveDate", label="Effective Date", required=True, hint="YYYY-MM-DD format"),
        *_two_party_fields("Provider", "Partner", "provider", "partner"),
        FieldSpec(key="programDescription", label="Program Description", required=True,
                  hint="Description of the design partner program"),
        FieldSpec(key="term", label="Term", hint="Duration of the agreement"),
        FieldSpec(key="fees", label="Fees", hint="Any fees or compensation"),
        FieldSpec(key="governingLaw", label="Governing Law", required=True),
        FieldSpec(key="chosenCourts", label="Chosen Courts", required=True),
    ],
    conversation_flow=[
        "effective date",
        "provider details",
        "partner details",
        "program description",
        "term and fees",
        "governing law and chosen courts",
    ],
    required_fields=[
        "effectiveDate", "provider.company", "partner.company",
        "programDescription", "governingLaw", "chosenCourts",
    ],
)

PROFESSIONAL_SERVICES_AGREEMENT = DocumentTypeConfig(
    slug="professional_services_agreement",
    display_name="Professional Services Agreement",
    catalog_filename="PSA.md",
    description="Professional Services Agreement for consulting, implementation, and custom development engagements.",
    fields=[
        FieldSpec(key="effectiveDate", label="Effective Date", required=True, hint="YYYY-MM-DD format"),
        *_two_party_fields("Provider", "Customer", "provider", "customer"),
        FieldSpec(key="dpa", label="Data Processing Agreement Reference"),
        FieldSpec(key="securityPolicy", label="Security Policy"),
        FieldSpec(key="governingLaw", label="Governing Law", required=True),
        FieldSpec(key="chosenCourts", label="Chosen Courts", required=True),
        FieldSpec(key="deliverables", label="Deliverables",
                  hint="Description of deliverables for the first SOW"),
        FieldSpec(key="fees", label="Fees", hint="Fee structure or amount"),
        FieldSpec(key="paymentPeriod", label="Payment Period",
                  hint="e.g. Net 30, Net 45"),
        FieldSpec(key="sowTerm", label="SOW Term", hint="Duration of the statement of work"),
    ],
    conversation_flow=[
        "effective date",
        "provider details",
        "customer details",
        "governing law and chosen courts",
        "deliverables and fees",
        "payment period and SOW term",
        "DPA and security policy references",
    ],
    required_fields=[
        "effectiveDate", "provider.company", "customer.company",
        "governingLaw", "chosenCourts",
    ],
)

DATA_PROCESSING_AGREEMENT = DocumentTypeConfig(
    slug="data_processing_agreement",
    display_name="Data Processing Agreement",
    catalog_filename="DPA.md",
    description="Data Processing Agreement for GDPR and data protection compliance when processing personal data.",
    fields=[
        FieldSpec(key="effectiveDate", label="Effective Date", required=True, hint="YYYY-MM-DD format"),
        *_two_party_fields("Provider", "Customer", "provider", "customer"),
        FieldSpec(key="categoriesOfPersonalData", label="Categories of Personal Data", required=True,
                  hint="Types of personal data being processed"),
        FieldSpec(key="categoriesOfDataSubjects", label="Categories of Data Subjects", required=True,
                  hint="Types of individuals whose data is processed"),
        FieldSpec(key="natureAndPurposeOfProcessing", label="Nature and Purpose of Processing",
                  hint="Why and how data is processed"),
        FieldSpec(key="securityPolicy", label="Security Policy"),
        FieldSpec(key="governingMemberState", label="Governing EU Member State"),
        FieldSpec(key="specialCategoryData", label="Special Category Data",
                  hint="Any sensitive data categories (health, biometric, etc.)"),
        FieldSpec(key="frequencyOfTransfer", label="Frequency of Transfer",
                  hint="How often data is transferred"),
    ],
    conversation_flow=[
        "effective date",
        "provider and customer details",
        "categories of personal data and data subjects",
        "nature and purpose of processing",
        "security policy and governing member state",
        "special category data and transfer frequency",
    ],
    required_fields=[
        "effectiveDate", "provider.company", "customer.company",
        "categoriesOfPersonalData", "categoriesOfDataSubjects",
    ],
)

PARTNERSHIP_AGREEMENT = DocumentTypeConfig(
    slug="partnership_agreement",
    display_name="Partnership Agreement",
    catalog_filename="Partnership-Agreement.md",
    description="Partnership Agreement for co-marketing, referral, and strategic partnership arrangements.",
    fields=[
        FieldSpec(key="effectiveDate", label="Effective Date", required=True, hint="YYYY-MM-DD format"),
        *_two_party_fields("Provider", "Partner", "provider", "partner"),
        FieldSpec(key="partnershipType", label="Partnership Type",
                  hint="e.g. co-marketing, referral, reseller, strategic"),
        FieldSpec(key="term", label="Term", hint="Duration of the partnership"),
        FieldSpec(key="fees", label="Fees or Revenue Share",
                  hint="Compensation structure"),
        FieldSpec(key="governingLaw", label="Governing Law", required=True),
        FieldSpec(key="chosenCourts", label="Chosen Courts", required=True),
    ],
    conversation_flow=[
        "effective date",
        "provider details",
        "partner details",
        "type of partnership and term",
        "fees or revenue share structure",
        "governing law and chosen courts",
    ],
    required_fields=[
        "effectiveDate", "provider.company", "partner.company",
        "governingLaw", "chosenCourts",
    ],
)

SOFTWARE_LICENSE_AGREEMENT = DocumentTypeConfig(
    slug="software_license_agreement",
    display_name="Software License Agreement",
    catalog_filename="Software-License-Agreement.md",
    description="Software License Agreement for on-premise or installable software licensing.",
    fields=[
        FieldSpec(key="effectiveDate", label="Effective Date", required=True, hint="YYYY-MM-DD format"),
        *_two_party_fields("Licensor", "Licensee", "licensor", "licensee"),
        FieldSpec(key="licenseType", label="License Type", required=True,
                  hint="e.g. perpetual, subscription, per-seat, site license"),
        FieldSpec(key="term", label="Term", hint="Duration of the license"),
        FieldSpec(key="fees", label="License Fees"),
        FieldSpec(key="governingLaw", label="Governing Law", required=True),
        FieldSpec(key="chosenCourts", label="Chosen Courts", required=True),
        FieldSpec(key="usageLimitations", label="Usage Limitations",
                  hint="Any restrictions on use"),
        FieldSpec(key="sublicensing", label="Sublicensing",
                  hint="Whether sublicensing is permitted"),
    ],
    conversation_flow=[
        "effective date",
        "licensor details",
        "licensee details",
        "license type and term",
        "license fees",
        "governing law and chosen courts",
        "usage limitations and sublicensing terms",
    ],
    required_fields=[
        "effectiveDate", "licensor.company", "licensee.company",
        "licenseType", "governingLaw", "chosenCourts",
    ],
)

PILOT_AGREEMENT = DocumentTypeConfig(
    slug="pilot_agreement",
    display_name="Pilot Agreement",
    catalog_filename="Pilot-Agreement.md",
    description="Pilot Agreement for trial and evaluation access to products before committing to a full subscription.",
    fields=[
        FieldSpec(key="effectiveDate", label="Effective Date", required=True, hint="YYYY-MM-DD format"),
        *_two_party_fields("Provider", "Customer", "provider", "customer"),
        FieldSpec(key="trialPeriod", label="Trial Period", required=True,
                  hint="Duration of the pilot/trial period"),
        FieldSpec(key="fees", label="Fees", hint="Any pilot fees or if it's free"),
        FieldSpec(key="governingLaw", label="Governing Law", required=True),
        FieldSpec(key="chosenCourts", label="Chosen Courts", required=True),
    ],
    conversation_flow=[
        "effective date",
        "provider details",
        "customer details",
        "trial period duration",
        "pilot fees",
        "governing law and chosen courts",
    ],
    required_fields=[
        "effectiveDate", "provider.company", "customer.company",
        "trialPeriod", "governingLaw", "chosenCourts",
    ],
)

BUSINESS_ASSOCIATE_AGREEMENT = DocumentTypeConfig(
    slug="business_associate_agreement",
    display_name="Business Associate Agreement",
    catalog_filename="BAA.md",
    description="Business Associate Agreement for HIPAA compliance when handling protected health information.",
    fields=[
        FieldSpec(key="baaEffectiveDate", label="BAA Effective Date", required=True, hint="YYYY-MM-DD format"),
        *_two_party_fields("Provider", "Company", "provider", "company"),
        FieldSpec(key="breachNotificationPeriod", label="Breach Notification Period", required=True,
                  hint="e.g. 72 hours, 5 business days"),
        FieldSpec(key="limitations", label="Limitations",
                  hint="Any limitations on the BAA scope"),
        FieldSpec(key="agreementReference", label="Agreement Reference",
                  hint="Reference to the underlying service agreement"),
    ],
    conversation_flow=[
        "BAA effective date",
        "provider details (the business associate)",
        "company details (the covered entity)",
        "breach notification period",
        "any limitations and agreement references",
    ],
    required_fields=[
        "baaEffectiveDate", "provider.company", "company.company",
        "breachNotificationPeriod",
    ],
)

AI_ADDENDUM = DocumentTypeConfig(
    slug="ai_addendum",
    display_name="AI Addendum",
    catalog_filename="AI-Addendum.md",
    description="AI Addendum covering AI service usage, model training restrictions, and intellectual property for AI-generated output.",
    fields=[
        FieldSpec(key="effectiveDate", label="Effective Date", required=True, hint="YYYY-MM-DD format"),
        *_two_party_fields("Provider", "Customer", "provider", "customer"),
        FieldSpec(key="aiServicesDescription", label="AI Services Description", required=True,
                  hint="Description of the AI services covered"),
        FieldSpec(key="trainingData", label="Training Data",
                  hint="What data may be used for training"),
        FieldSpec(key="trainingPurposes", label="Training Purposes",
                  hint="Permitted purposes for model training"),
        FieldSpec(key="trainingRestrictions", label="Training Restrictions",
                  hint="Any restrictions on using customer data for training"),
        FieldSpec(key="improvementRestrictions", label="Improvement Restrictions",
                  hint="Restrictions on using data to improve AI models"),
    ],
    conversation_flow=[
        "effective date",
        "provider details",
        "customer details",
        "AI services description",
        "training data and purposes",
        "training and improvement restrictions",
    ],
    required_fields=[
        "effectiveDate", "provider.company", "customer.company",
        "aiServicesDescription",
    ],
)

# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------

REGISTRY: dict[str, DocumentTypeConfig] = {
    cfg.slug: cfg for cfg in [
        MUTUAL_NDA,
        CLOUD_SERVICE_AGREEMENT,
        SERVICE_LEVEL_AGREEMENT,
        DESIGN_PARTNER_AGREEMENT,
        PROFESSIONAL_SERVICES_AGREEMENT,
        DATA_PROCESSING_AGREEMENT,
        PARTNERSHIP_AGREEMENT,
        SOFTWARE_LICENSE_AGREEMENT,
        PILOT_AGREEMENT,
        BUSINESS_ASSOCIATE_AGREEMENT,
        AI_ADDENDUM,
    ]
}

# Alias: cover page shares the same config as mutual NDA (same fields/schema).
# Excluded from catalog listing since list_types() deduplicates by cfg.slug.
REGISTRY["mutual_nda_cover_page"] = MUTUAL_NDA


def get_config(slug: str) -> DocumentTypeConfig:
    if slug not in REGISTRY:
        raise ValueError(f"Unsupported document type: {slug}")
    return REGISTRY[slug]


def list_types() -> list[dict]:
    seen: set[str] = set()
    result = []
    for cfg in REGISTRY.values():
        if cfg.slug in seen:
            continue
        seen.add(cfg.slug)
        result.append({
            "slug": cfg.slug,
            "display_name": cfg.display_name,
            "description": cfg.description,
            "filename": cfg.catalog_filename,
        })
    return result


# ---------------------------------------------------------------------------
# JSON Schema builder (for LLM structured output)
# ---------------------------------------------------------------------------

def _field_to_json_schema(f: FieldSpec) -> dict:
    if f.field_type == "object" and f.nested_fields:
        props = {}
        req = []
        for nf in f.nested_fields:
            props[nf.key] = _field_to_json_schema(nf)
            req.append(nf.key)
        return {
            "type": ["object", "null"],
            "properties": props,
            "required": req,
            "additionalProperties": False,
        }
    elif f.field_type == "enum" and f.enum_values:
        return {
            "type": ["string", "null"],
            "enum": [*f.enum_values, None],
        }
    elif f.field_type == "integer":
        return {"type": ["integer", "null"]}
    elif f.field_type == "boolean":
        return {"type": ["boolean", "null"]}
    else:
        return {"type": ["string", "null"]}


def build_json_schema(config: DocumentTypeConfig) -> dict:
    extracted_props = {}
    extracted_required = []
    for f in config.fields:
        extracted_props[f.key] = _field_to_json_schema(f)
        extracted_required.append(f.key)

    return {
        "type": "json_schema",
        "json_schema": {
            "name": "document_extraction",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "reply": {"type": "string"},
                    "is_complete": {"type": "boolean"},
                    "extracted_fields": {
                        "type": "object",
                        "properties": extracted_props,
                        "required": extracted_required,
                        "additionalProperties": False,
                    },
                },
                "required": ["reply", "is_complete", "extracted_fields"],
                "additionalProperties": False,
            },
        },
    }


# ---------------------------------------------------------------------------
# System prompt builder
# ---------------------------------------------------------------------------

def build_system_prompt(config: DocumentTypeConfig, current_data: dict) -> str:
    filled = []
    missing_required = []
    missing_optional = []

    def get_value(path: str, data: dict) -> str | None:
        parts = path.split(".")
        obj = data
        for p in parts:
            if not isinstance(obj, dict):
                return None
            obj = obj.get(p)
        return obj if obj else None

    for f in config.fields:
        if f.field_type == "object" and f.nested_fields:
            for nf in f.nested_fields:
                path = f"{f.key}.{nf.key}"
                val = get_value(path, current_data)
                full_label = f"{f.label} — {nf.label}"
                if val:
                    filled.append(f"  - {full_label}: {val}")
                elif nf.required:
                    missing_required.append(full_label)
                else:
                    missing_optional.append(full_label)
        else:
            val = get_value(f.key, current_data)
            if val:
                filled.append(f"  - {f.label}: {val}")
            elif f.required:
                missing_required.append(f.label)
            else:
                missing_optional.append(f.label)

    filled_str = "\n".join(filled) if filled else "  (none yet)"
    missing_req_str = ", ".join(missing_required) if missing_required else "(all filled!)"
    missing_opt_str = ", ".join(missing_optional) if missing_optional else "(all filled)"

    # Build field reference for the LLM
    field_descriptions = []
    for f in config.fields:
        if f.field_type == "object" and f.nested_fields:
            sub = ", ".join(nf.key for nf in f.nested_fields)
            req_marker = " (required)" if f.required else " (optional)"
            field_descriptions.append(f"- {f.key}{req_marker}: object with fields: {sub}")
            for nf in f.nested_fields:
                hint = f" — {nf.hint}" if nf.hint else ""
                req = " (required)" if nf.required else " (optional)"
                field_descriptions.append(f"  - {nf.key}{req}: {nf.label}{hint}")
        else:
            hint = f" — {f.hint}" if f.hint else ""
            req = " (required)" if f.required else " (optional)"
            type_info = ""
            if f.field_type == "enum" and f.enum_values:
                type_info = f' (one of: {", ".join(f.enum_values)})'
            elif f.field_type == "integer":
                type_info = " (integer)"
            field_descriptions.append(f"- {f.key}{req}{type_info}: {f.label}{hint}")

    field_ref = "\n".join(field_descriptions)

    # Build conversation flow
    flow_steps = "\n".join(f"{i+1}. {step}" for i, step in enumerate(config.conversation_flow))

    return f"""You are a friendly, professional legal assistant helping a user draft a {config.display_name} using the Common Paper standard template.

Your goal is to have a natural conversation to collect all the information needed to fill in the document. Ask ONE question at a time. Be concise but helpful. If the user's answer is unclear, ask for clarification before setting the field. Always ask a follow-up question if you still need more information — never leave the user without a next step.

FIRST MESSAGE BEHAVIOR:
When the user first greets you, welcome them warmly and briefly explain:
1. What this tool does — it helps them create a {config.display_name} based on the Common Paper standard (an industry-recognized open-source legal framework)
2. How it works — you'll ask a series of questions to fill in the agreement fields, and they'll see a live preview of the document updating on the right side of the screen as they answer
3. What you'll need from them — the key details listed below
4. Then ask your first question

THE DOCUMENT FIELDS YOU NEED TO COLLECT:

{field_ref}

CURRENT STATE OF COLLECTED FIELDS:
{filled_str}

STILL NEEDED (required): {missing_req_str}
STILL NEEDED (optional): {missing_opt_str}

CONVERSATION FLOW:
{flow_steps}
{len(config.conversation_flow) + 1}. If a user provides multiple pieces of information at once, capture them all

RULES:
- In extracted_fields, include ALL fields you know so far (cumulative across the whole conversation), not just what was learned in this turn. Fields you don't know yet should be null.
- Set is_complete to true ONLY when ALL required fields are filled: {", ".join(config.required_fields)}.
- When is_complete is true, your reply MUST include the phrase "{config.completion_phrase}"
- If the user wants to change a previously filled field, update it in extracted_fields.
- Be conversational and natural. You can group related questions (e.g., "What's your company name and contact details?").
- IMPORTANT: Always ask a follow-up question when there are still missing fields. Never end your response without either asking for more information or confirming completion."""


# ---------------------------------------------------------------------------
# Document type discovery prompt (used when user hasn't chosen a type yet)
# ---------------------------------------------------------------------------

def build_discovery_system_prompt() -> str:
    doc_list = "\n".join(
        f"  {i+1}. **{cfg.display_name}** — {cfg.description}"
        for i, cfg in enumerate(REGISTRY.values())
        if cfg.slug != "mutual_nda_cover_page"
    )
    return f"""You are a friendly, professional legal assistant that helps users draft legal agreements.

The user is starting a new conversation. Your job is to figure out what type of legal document they need.

AVAILABLE DOCUMENT TYPES:
{doc_list}

INSTRUCTIONS:
1. If the user has clearly stated what document they need and it matches one of the types above, identify it and begin helping them.
2. If the user's request is vague, ask clarifying questions to determine the right document type.
3. If the user asks for a document type that is NOT in the list above, politely explain that you cannot generate that specific document, but suggest the closest available option from the list.
4. Always be helpful and guide the user toward the right document.

Your response must be a JSON object with:
- "reply": your message to the user
- "is_complete": false (always false during discovery)
- "extracted_fields": {{"document_type": "<slug_or_null>"}}

Set document_type to the slug (e.g., "mutual_nda", "cloud_service_agreement") once you have identified what the user needs. Set it to null if you haven't determined the type yet.

IMPORTANT: Always ask a follow-up question if you need more information. Never leave the user without a next step."""


DISCOVERY_JSON_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "document_discovery",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "reply": {"type": "string"},
                "is_complete": {"type": "boolean"},
                "extracted_fields": {
                    "type": "object",
                    "properties": {
                        "document_type": {"type": ["string", "null"]},
                    },
                    "required": ["document_type"],
                    "additionalProperties": False,
                },
            },
            "required": ["reply", "is_complete", "extracted_fields"],
            "additionalProperties": False,
        },
    },
}
