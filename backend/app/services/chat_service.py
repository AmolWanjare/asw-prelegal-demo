from __future__ import annotations

import json
import logging

from litellm import completion

from ..config import settings
from ..schemas.chat import ExtractedFields, LLMResponse

logger = logging.getLogger(__name__)

NDA_FIELD_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "nda_extraction",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "reply": {"type": "string"},
                "is_complete": {"type": "boolean"},
                "extracted_fields": {
                    "type": "object",
                    "properties": {
                        "purpose": {"type": ["string", "null"]},
                        "effectiveDate": {"type": ["string", "null"]},
                        "mndaTermType": {
                            "type": ["string", "null"],
                            "enum": ["fixed", "until_terminated", None],
                        },
                        "mndaTermYears": {"type": ["integer", "null"]},
                        "confidentialityTermType": {
                            "type": ["string", "null"],
                            "enum": ["fixed", "perpetuity", None],
                        },
                        "confidentialityTermYears": {"type": ["integer", "null"]},
                        "governingLaw": {"type": ["string", "null"]},
                        "jurisdiction": {"type": ["string", "null"]},
                        "modifications": {"type": ["string", "null"]},
                        "party1": {
                            "type": ["object", "null"],
                            "properties": {
                                "name": {"type": ["string", "null"]},
                                "title": {"type": ["string", "null"]},
                                "company": {"type": ["string", "null"]},
                                "noticeAddress": {"type": ["string", "null"]},
                                "date": {"type": ["string", "null"]},
                            },
                            "required": [
                                "name",
                                "title",
                                "company",
                                "noticeAddress",
                                "date",
                            ],
                            "additionalProperties": False,
                        },
                        "party2": {
                            "type": ["object", "null"],
                            "properties": {
                                "name": {"type": ["string", "null"]},
                                "title": {"type": ["string", "null"]},
                                "company": {"type": ["string", "null"]},
                                "noticeAddress": {"type": ["string", "null"]},
                                "date": {"type": ["string", "null"]},
                            },
                            "required": [
                                "name",
                                "title",
                                "company",
                                "noticeAddress",
                                "date",
                            ],
                            "additionalProperties": False,
                        },
                    },
                    "required": [
                        "purpose",
                        "effectiveDate",
                        "mndaTermType",
                        "mndaTermYears",
                        "confidentialityTermType",
                        "confidentialityTermYears",
                        "governingLaw",
                        "jurisdiction",
                        "modifications",
                        "party1",
                        "party2",
                    ],
                    "additionalProperties": False,
                },
            },
            "required": ["reply", "is_complete", "extracted_fields"],
            "additionalProperties": False,
        },
    },
}


def build_system_prompt(current_nda_data: dict) -> str:
    filled = []
    missing_required = []
    missing_optional = []

    required_fields = [
        ("purpose", "Purpose"),
        ("effectiveDate", "Effective Date"),
        ("mndaTermType", "MNDA Term Type"),
        ("governingLaw", "Governing Law"),
        ("jurisdiction", "Jurisdiction"),
        ("party1.name", "Party 1 Name"),
        ("party1.company", "Party 1 Company"),
        ("party2.name", "Party 2 Name"),
        ("party2.company", "Party 2 Company"),
    ]

    optional_fields = [
        ("mndaTermYears", "MNDA Term Years"),
        ("confidentialityTermType", "Confidentiality Term Type"),
        ("confidentialityTermYears", "Confidentiality Term Years"),
        ("modifications", "Modifications"),
        ("party1.title", "Party 1 Title"),
        ("party1.noticeAddress", "Party 1 Notice Address"),
        ("party1.date", "Party 1 Date"),
        ("party2.title", "Party 2 Title"),
        ("party2.noticeAddress", "Party 2 Notice Address"),
        ("party2.date", "Party 2 Date"),
    ]

    def get_value(path: str) -> str | None:
        parts = path.split(".")
        obj = current_nda_data
        for p in parts:
            if not isinstance(obj, dict):
                return None
            obj = obj.get(p)
        return obj if obj else None

    for path, label in required_fields:
        val = get_value(path)
        if val:
            filled.append(f"  - {label}: {val}")
        else:
            missing_required.append(label)

    for path, label in optional_fields:
        val = get_value(path)
        if val:
            filled.append(f"  - {label}: {val}")
        else:
            missing_optional.append(label)

    filled_str = "\n".join(filled) if filled else "  (none yet)"
    missing_req_str = ", ".join(missing_required) if missing_required else "(all filled!)"
    missing_opt_str = ", ".join(missing_optional) if missing_optional else "(all filled)"

    return f"""You are a friendly, professional legal assistant helping a user draft a Mutual Non-Disclosure Agreement (MNDA) using the Common Paper standard template.

Your goal is to have a natural conversation to collect all the information needed to fill in the NDA. Ask ONE question at a time. Be concise but helpful. If the user's answer is unclear, ask for clarification before setting the field.

FIRST MESSAGE BEHAVIOR:
When the user first greets you, welcome them warmly and briefly explain:
1. What this tool does — it helps them create a legally-sound Mutual NDA based on the Common Paper standard (an industry-recognized open-source legal framework)
2. How it works — you'll ask a series of questions to fill in the agreement fields, and they'll see a live preview of the document updating on the right side of the screen as they answer
3. What you'll need from them — details about both parties (their company and the counterparty), the purpose of the NDA, governing law, and term preferences
4. Then ask your first question about the purpose of the NDA

THE NDA FIELDS YOU NEED TO COLLECT:

GENERAL TERMS:
- purpose (string): How confidential information may be used between the parties. Default: "Evaluating whether to enter into a business relationship with the other party."
- effectiveDate (string, YYYY-MM-DD): When the agreement takes effect
- mndaTermType ("fixed" or "until_terminated"): Does the MNDA expire after a fixed period or continue until terminated?
- mndaTermYears (integer, 1-99): If mndaTermType is "fixed", how many years? (only needed if fixed)
- confidentialityTermType ("fixed" or "perpetuity"): Does the confidentiality obligation last a fixed number of years or forever?
- confidentialityTermYears (integer, 1-99): If confidentialityTermType is "fixed", how many years? (only needed if fixed)
- governingLaw (string): Which US state's laws govern this agreement? Must be a full US state name.
- jurisdiction (string): Where will legal proceedings take place? (e.g., "courts located in New Castle, DE")
- modifications (string, optional): Any modifications to the standard terms

PARTY 1 (the user's organization):
- party1.name: Signatory's full legal name
- party1.title: Signatory's job title (optional)
- party1.company: Company legal name
- party1.noticeAddress: Email or mailing address for legal notices (optional)
- party1.date: Date of signing, YYYY-MM-DD (optional)

PARTY 2 (the counterparty):
- party2.name, party2.title, party2.company, party2.noticeAddress, party2.date (same fields)

CURRENT STATE OF COLLECTED FIELDS:
{filled_str}

STILL NEEDED (required): {missing_req_str}
STILL NEEDED (optional): {missing_opt_str}

CONVERSATION FLOW:
1. Start by greeting the user and asking about the purpose of the NDA
2. Then ask about the effective date
3. Then MNDA term (fixed or until terminated, and if fixed how many years)
4. Then confidentiality term (fixed or perpetuity, and if fixed how many years)
5. Then governing law (US state) and jurisdiction
6. Then ask about any modifications to the standard terms
7. Then collect Party 1 details (name, title, company, notice address)
8. Then collect Party 2 details
9. If a user provides multiple pieces of information at once, capture them all

RULES:
- In extracted_fields, include ALL fields you know so far (cumulative across the whole conversation), not just what was learned in this turn. Fields you don't know yet should be null.
- Set is_complete to true ONLY when ALL required fields are filled: purpose, effectiveDate, mndaTermType, governingLaw, jurisdiction, party1.name, party1.company, party2.name, party2.company.
- When is_complete is true, your reply MUST include the phrase "I've filled in all the fields, ready to generate!"
- If the user wants to change a previously filled field, update it in extracted_fields.
- Be conversational and natural. You can group related questions (e.g., "What's your name, title, and company?")."""


def call_llm(
    history: list[dict], user_message: str, current_nda_data: dict
) -> LLMResponse:
    system_prompt = build_system_prompt(current_nda_data)

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    response = completion(
        model="openrouter/openai/gpt-oss-120b",
        messages=messages,
        response_format=NDA_FIELD_SCHEMA,
        api_key=settings.OPENROUTER_API_KEY,
    )

    raw = response.choices[0].message.content
    logger.info("LLM raw response: %s", raw[:500])

    try:
        parsed = json.loads(raw)
        return LLMResponse(
            reply=parsed.get("reply", "I'm sorry, could you repeat that?"),
            extracted_fields=ExtractedFields(
                **parsed.get("extracted_fields", {})
            ),
            is_complete=parsed.get("is_complete", False),
        )
    except Exception as e:
        logger.error("Failed to parse LLM response: %s — raw: %s", e, raw[:500])
        return LLMResponse(
            reply=raw if isinstance(raw, str) else "I'm sorry, something went wrong. Could you try again?",
            extracted_fields=ExtractedFields(),
            is_complete=False,
        )


def merge_nda_data(existing: dict, extracted: ExtractedFields) -> dict:
    data = {**existing}
    fields = extracted.model_dump(exclude_none=True)

    party1 = fields.pop("party1", None)
    party2 = fields.pop("party2", None)

    data.update(fields)

    if party1:
        data["party1"] = {**data.get("party1", {}), **party1}
    if party2:
        data["party2"] = {**data.get("party2", {}), **party2}

    return data
