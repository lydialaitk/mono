# Research: 繁體中文 Agent Chat App

## Decision: Use TypeScript on Node.js 22+ for both frontend and backend

**Rationale**  
One language minimizes coordination cost, keeps the codebase easy to delete and
rewrite, and makes it straightforward to share versioned contracts across the
frontend, backend, and tests. A single Node.js process can serve static frontend
assets and the HTTP API without introducing extra infrastructure.

**Alternatives considered**  
- Python backend plus TypeScript frontend: workable, but adds cross-language
  contract duplication and more moving parts than v1 needs.
- Bun or Deno: attractive for simplicity, but add ecosystem and team adoption
  risk without providing essential value for this feature.

## Decision: Use vanilla TypeScript plus static HTML/CSS for the frontend

**Rationale**  
The UI is a single-page chat surface with one thread, one input, streaming
output, environment-driven backend configuration, blank-message validation, and
same-session restore. A framework would add abstraction cost before the feature
needs it. Vanilla TypeScript keeps state handling explicit and easy to replace.

**Alternatives considered**  
- React plus Vite: good for future UI expansion, but too heavy for this initial
  scope.
- HTMX or Alpine: minimal, but provide less direct control for client-managed
  thread state and streamed response assembly.

## Decision: Use Fastify for the backend HTTP server

**Rationale**  
Fastify provides explicit route registration, schema-friendly request handling,
and structured logging hooks while remaining small enough for a simple app. It
fits the constitution's emphasis on explicit dependencies, versioned boundaries,
and structured events without forcing a larger application framework.

**Alternatives considered**  
- Express: familiar, but less structured around schemas and logging.
- Bare Node HTTP server: smallest dependency surface, but would shift too much
  boilerplate into custom code and make tests/contracts less direct.

## Decision: Stream assistant replies with SSE over `POST /api/v1/chat`

**Rationale**  
SSE matches the one-request, one-stream response model and keeps the boundary
HTTP-native. It is simpler than WebSockets for a single-thread chat and provides
clear framing for structured events such as `response.start`, `response.delta`,
`response.complete`, and `response.error`.

**Alternatives considered**  
- WebSockets: unnecessary bidirectional complexity for this feature.
- Chunked NDJSON: viable, but less standardized in browser event handling than
  SSE.

## Decision: Keep the backend stateless for conversation history

**Rationale**  
The frontend already owns the full in-session thread and sends it on each
follow-up request. Keeping the backend stateless avoids server-side session
management, preserves single-deployable simplicity, and means app restarts do
not require data repair logic.

**Alternatives considered**  
- Backend in-memory thread storage: unnecessary given the clarified requirement
  that each follow-up request carries full history.
- Database-backed session storage: explicitly out of scope for v1.

## Decision: Restore the thread from browser `sessionStorage`

**Rationale**  
`sessionStorage` survives page refreshes within the same browser session but does
not persist across browser-session end, which matches the clarified behavior.
The frontend can serialize one thread under a single key and hydrate it at boot
without introducing a persistence abstraction.

**Alternatives considered**  
- `localStorage`: persists longer than required and creates stale-data cleanup
  concerns.
- Backend session store: adds protocol and state management complexity with no v1
  benefit.
- URL-based persistence: too noisy and size-limited for chat history.

## Decision: Expose both `/health` and `/status`

**Rationale**  
`/health` should remain shallow and reflect backend process availability only,
per the clarification. A separate `/status` endpoint can expose typed details
such as reply mode, stream transport, schema version, and inspectable
configuration/readiness information without redefining health semantics.

**Alternatives considered**  
- `/health` only: insufficient for operator-facing diagnostics.
- Deep readiness checks in `/health`: conflicts with the clarified process-only
  top-level health meaning.

## Decision: Use a structured, versioned contract envelope

**Rationale**  
All chat, stream, and status payloads include `schemaVersion: "v1"` plus a
stable event or resource shape. This satisfies the constitution's boundary
contract rules, keeps frontend/backend evolution explicit, and improves
observability through request IDs and typed event sequences.

**Alternatives considered**  
- Unversioned JSON payloads: simpler initially, but weakens compatibility and
  reviewability.
- Raw text stream chunks only: too ambiguous for reliable UI state reconciliation
  and contract testing.

## Decision: Test with Vitest, emphasizing unit helpers and boundary integration

**Rationale**  
Vitest can cover both frontend and backend TypeScript in a single toolchain.
Unit tests should verify message validation, history shaping, session restore,
and reply-mode selection. Integration tests should verify API request/response
contracts, SSE event flow, and status semantics. Browser-level tests are
optional if one lightweight smoke path adds value without dominating the repo.

**Alternatives considered**  
- Playwright-first: strong end-to-end coverage, but too much ceremony unless the
  project already needs browser automation.
- Separate Jest and browser toolchains: more complexity than v1 requires.

## Decision: Standardize all repeatable actions behind `npm run` commands

**Rationale**  
Using `npm run` keeps command discovery simple and satisfies local/CI parity with
no extra task runner. The planned command surface is: `dev`, `build`, `start`,
`test`, `test:watch`, `lint`, and `check`.

**Alternatives considered**  
- Make or just: extra indirection for a tiny project.
- CI-only shell scripts: violates the command discoverability principle.
