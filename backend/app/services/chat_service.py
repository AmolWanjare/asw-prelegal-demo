from __future__ import annotations

import json
import logging

from litellm import completion

from ..config import settings
from ..schemas.chat import LLMResponse
from ..registry.document_registry import (
    DocumentTypeConfig,
    build_json_schema,
    build_system_prompt,
    build_discovery_system_prompt,
    DISCOVERY_JSON_SCHEMA,
    get_config,
)

logger = logging.getLogger(__name__)

_MAX_RETRIES = 3


def _do_llm_call(messages: list[dict], response_format_schema: dict) -> str:
    """Call the LLM and return raw content as a string."""
    response = completion(
        model="openrouter/openai/gpt-oss-120b",
        messages=messages,
        response_format=response_format_schema,
        api_key=settings.OPENROUTER_API_KEY,
    )
    raw = response.choices[0].message.content
    if not isinstance(raw, str):
        raw = str(raw)
    return raw


def _parse_llm_response(raw: str) -> LLMResponse:
    """Parse a raw LLM string into a typed LLMResponse."""
    parsed = json.loads(raw)

    # Model sometimes returns a list — find the first dict with a "reply" key
    if isinstance(parsed, list):
        for item in parsed:
            if isinstance(item, dict) and "reply" in item:
                parsed = item
                break
        else:
            raise ValueError("JSON array contained no valid response object")

    if not isinstance(parsed, dict):
        raise ValueError(f"Expected JSON object, got {type(parsed).__name__}")
    if "reply" not in parsed and "extracted_fields" not in parsed:
        raise ValueError("JSON object missing both 'reply' and 'extracted_fields'")

    reply = parsed.get("reply") or "Got it, I've updated the fields. What would you like to do next?"
    extracted = parsed.get("extracted_fields", {})
    if not isinstance(extracted, dict):
        extracted = {}

    return LLMResponse(
        reply=reply,
        extracted_fields=extracted,
        is_complete=parsed.get("is_complete", False),
    )


def _extract_plain_text_reply(raw: str) -> str | None:
    """Try to extract a usable reply from a non-JSON LLM response."""
    text = raw.strip().strip('"').strip()
    # Reject numeric-only garbage, very short strings, etc.
    try:
        float(text)
        return None  # It's just a number
    except ValueError:
        pass
    if len(text) > 10:
        return text
    return None


def call_llm(
    history: list[dict],
    user_message: str,
    current_data: dict,
    config: DocumentTypeConfig | None = None,
) -> LLMResponse:
    # Determine if we're in discovery mode or field-collection mode
    if config is None:
        system_prompt = build_discovery_system_prompt()
        schema = DISCOVERY_JSON_SCHEMA
    else:
        system_prompt = build_system_prompt(config, current_data)
        schema = build_json_schema(config)

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})
    # Reinforce JSON output — some models ignore response_format
    messages.append({
        "role": "system",
        "content": "CRITICAL: You MUST respond with a valid JSON object containing \"reply\", \"is_complete\", and \"extracted_fields\" keys. Do NOT respond with plain text, numbers, or anything other than a JSON object.",
    })

    last_error = None
    last_raw = ""
    for attempt in range(_MAX_RETRIES):
        try:
            raw = _do_llm_call(messages, schema)
        except Exception as e:
            last_error = e
            logger.warning("LLM call failed (attempt %d): %s", attempt + 1, e)
            continue

        last_raw = raw
        logger.info("LLM raw response (attempt %d): %s", attempt + 1, raw[:500])
        try:
            return _parse_llm_response(raw)
        except Exception as e:
            last_error = e
            logger.warning(
                "Failed to parse LLM response (attempt %d): %s — raw: %s",
                attempt + 1, e, raw[:500],
            )

    # All retries failed — try to salvage a plain-text reply
    logger.error("All %d LLM attempts failed: %s", _MAX_RETRIES, last_error)
    fallback = _extract_plain_text_reply(last_raw)
    if fallback:
        logger.info("Using plain-text fallback reply")
    return LLMResponse(
        reply=fallback or "I'm sorry, the AI service returned an unexpected response. Please try again.",
        extracted_fields={},
        is_complete=False,
    )


def merge_document_data(
    existing: dict, extracted: dict, config: DocumentTypeConfig | None = None,
) -> dict:
    """Merge extracted fields into existing document data.

    Object-type fields (identified from config) are deep-merged.
    None values are excluded.
    """
    data = {**existing}

    # Filter out None values
    clean = {k: v for k, v in extracted.items() if v is not None}

    # Find object-type field keys from config
    object_keys: set[str] = set()
    if config:
        for f in config.fields:
            if f.field_type == "object":
                object_keys.add(f.key)

    for key, value in clean.items():
        if key in object_keys and isinstance(value, dict):
            # Deep merge nested object, excluding None values
            existing_nested = data.get(key, {})
            if isinstance(existing_nested, dict):
                merged = {**existing_nested}
                for nk, nv in value.items():
                    if nv is not None:
                        merged[nk] = nv
                data[key] = merged
            else:
                data[key] = value
        else:
            data[key] = value

    return data
