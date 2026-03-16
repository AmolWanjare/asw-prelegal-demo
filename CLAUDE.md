# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The catalog contains 12 document types. See Implementation Status below for current progress.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed (v1 foundation)
- **Backend**: FastAPI app in `backend/app/` with uv, SQLite, user auth (signup/signin), health endpoint
- **Frontend**: Next.js app in `frontend/` with NDA wizard flow (party details, general terms, preview, PDF download)
- **Infrastructure**: Dockerfile, docker-compose, platform scripts (Mac/Linux/Windows start/stop)
- **Templates**: All 12 document templates in `templates/`
- **Tests**: Backend pytest (auth, health), frontend Jest component tests, Playwright e2e tests

### Completed (PR-5: AI chat for Mutual NDA)
- **AI Chat Interface**: Split-screen chat at `/nda/chat` — AI assistant (left panel) guides users through NDA field collection via natural conversation, live document preview (right panel) updates in real time
- **LLM Integration**: `backend/app/services/chat_service.py` uses LiteLLM via OpenRouter (`openrouter/openai/gpt-oss-120b` on Cerebras) with structured outputs (JSON schema) for field extraction
- **Chat Backend**: `POST /api/chat/message`, `GET /api/chat/session/{id}/messages`, `DELETE /api/chat/session/{id}` — conversation/message models in `backend/app/models/conversation.py`, persisted in SQLite
- **Auth Gate**: Chat requires sign-in; frontend auth gate component with sign-in/sign-up at `frontend/src/components/chat/AuthGate.tsx`
- **Session Persistence**: Chat sessions stored in DB, restored on page reload via `sessionStorage` session ID
- **Frontend Components**: `ChatLayout` (split-screen), `ChatPanel` (messages + input), `ChatMessage` (bubbles), all in `frontend/src/components/chat/`
- **Tailwind Token**: Purple secondary color `#753991` added as `--color-purple` theme token in `globals.css`
- **Tests**: 7 new backend tests for chat (auth, session CRUD, field extraction, cross-user isolation)

### Completed (PR-5 continued)
- **Auto-Greet**: New chat sessions auto-send a greeting so the AI introduces itself immediately
- **Static Frontend Serving**: Next.js static export (`frontend/out/`) served via FastAPI `StaticFiles` mount in Docker (Dockerfile copies build to `./static`)
- **Home Redirect**: Root `/` redirects to `/chat` as primary entry point
- **LLM Retry & Robustness**: `call_llm` retries up to 2 attempts, handles JSON arrays, missing `reply` fields, plain-text fallbacks, and connection failures gracefully
- **Tests**: 10 additional unit tests for LLM parsing edge cases (17 total chat tests)

### Completed (PR-6: All document types)
- **Document Registry**: `backend/app/registry/document_registry.py` defines all 11 document types (NDA, CSA, SLA, DPA, PSA, Partnership, Software License, Pilot, BAA, AI Addendum, Design Partner) with field specs, JSON schemas, and system prompts built dynamically
- **Discovery Mode**: New chat sessions start in `"generic"` mode — AI identifies what document the user needs from conversation, then transitions to field collection for that specific type
- **Unsupported Document Handling**: AI gracefully declines unsupported document types and suggests the closest available match from the catalog
- **Catalog API**: `GET /api/catalog` endpoint serves the document type catalog (no auth required)
- **Generic Document Preview**: `DocumentFieldsPreview` component shows collected fields as a styled card/table for all non-NDA document types, updating live
- **Unified Chat Route**: Root `/` now redirects to `/chat` (generic entry point); `/nda/chat` still works for backward compatibility
- **Input Focus Fix**: Textarea auto-focuses after AI responds, so users can immediately type their next answer
- **Start Over Fix**: "Start Over" now re-greets the user with the AI instead of leaving an empty chat
- **Model Rename**: `nda_data` column → `document_data` for generic document support
- **Per-Document PDF**: Generate and download PDF for any document type (NDA uses full preview, others use field summary)
- **Tests**: 32 backend tests (catalog, generic sessions, document type validation), 131 frontend tests all passing

### Not Yet Implemented
- Document CRUD endpoints (create, save, list, retrieve documents)
- Full preview/render components for non-NDA document types (currently shows field summary)
- Document persistence (database models/tables for documents beyond chat sessions)