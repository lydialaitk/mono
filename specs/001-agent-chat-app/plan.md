# Implementation Plan: 繁體中文 Agent Chat App

**Branch**: `001-agent-chat-app` | **Date**: 2026-08-12 | **Spec**: [`specs/001-agent-chat-app/spec.md`](./spec.md)

**Input**: Feature specification from `/specs/001-agent-chat-app/spec.md`

## Summary

Build a local-development web chat app that accepts Traditional Chinese input in
the browser, streams assistant responses from a backend agent, restores the
single thread after refresh within the same browser session, and exposes shallow
health plus typed status endpoints. The implementation will use a single Node.js
deployable: Fastify serves a versioned HTTP API and static frontend assets, with
vanilla TypeScript on the client, SSE for streaming, `sessionStorage` for
same-session restore, a mock reply adapter by default, and an optional real LLM
adapter when credentials are configured.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22+

**Primary Dependencies**: Fastify, `@fastify/static`, Vite, Vitest, optional
Vercel AI SDK (AI SDK) for real LLM mode

**Storage**: Browser `sessionStorage` for client-side thread restore; no server
persistence

**Testing**: Vitest for unit and integration tests; optional browser smoke test
if lightweight to add

**Target Platform**: Linux/macOS local development environments with a modern
desktop browser

**Project Type**: Single-deployable web application with integrated frontend and
backend

**Performance Goals**: Assistant reply stream begins appearing within 2 seconds
under normal local development conditions; status endpoints respond immediately
enough for local diagnostics; follow-up requests preserve context without
noticeable UI stalls for short single-thread conversations

**Constraints**: One deployable process; no login; no database; no RAG; no tool
invocation; no attachments; no production deployment; top-level `/health`
reflects process availability only; frontend backend URL must be configurable by
environment; blank messages are blocked before backend send

**Scale/Scope**: One web page, one active chat thread, one frontend bundle, one
backend service, one operator-facing status surface, local-development usage only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Single Deployable First** — Pass. The plan uses one Node.js process that
  serves both static frontend assets and backend API routes. No queues,
  background workers, or extra services are introduced.
- **II. Design for Deletion** — Pass. The UI is a single-page vanilla TypeScript
  app with explicit modules and no framework abstraction layer. Backend reply
  generation is one small adapter boundary with mock-first behavior.
- **III. Explicit Dependencies** — Pass. Fastify, static asset serving, frontend
  storage, and optional LLM adapter remain visible as direct module dependencies.
- **IV. Versioned Boundary Contracts** — Pass. Chat API uses `/api/v1/chat`,
  stream/status payloads include `schemaVersion: "v1"`, and contract docs are
  generated under `contracts/`.
- **V. Test Behavior at the Right Level** — Pass. Unit tests target history
  shaping, validation, and session restore helpers; integration tests target API
  contracts and streaming/status boundaries.
- **VI. Structured Events as the Source of Truth** — Pass. Streaming events,
  request correlation IDs, and status payloads are explicitly structured.
- **VII. Reversible Delivery** — Pass for v1 scope. Mock mode is the default; the
  real LLM path is configuration-gated and can be disabled without code changes.
- **VIII. Attention Budget for Operations** — Pass. Only shallow health and typed
  status endpoints are planned; no alerting surface is introduced in v1.
- **IX. User Value Over Merge Completion** — Pass. Quickstart focuses on running,
  observing, and validating actual chat behavior rather than code-only completion.
- **X. Command Discoverability and CI Parity** — Pass. The plan standardizes on a
  small `npm run` command surface shared by local development and CI.

**Post-Design Re-check**: Pass. Phase 1 artifacts keep the same single-process,
versioned-boundary design without introducing any constitutional exceptions.

## Project Structure

### Documentation (this feature)

```text
specs/001-agent-chat-app/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── http-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   ├── app/
│   ├── chat/
│   ├── status/
│   └── telemetry/
└── tests/
    ├── contract/
    ├── integration/
    └── unit/

frontend/
├── public/
├── src/
│   ├── chat/
│   ├── session/
│   ├── status/
│   └── ui/
└── tests/
    ├── integration/
    └── unit/

shared/
└── src/
    ├── contracts/
    ├── events/
    └── types/
```

**Structure Decision**: Use a web-application layout with `backend/`,
`frontend/`, and `shared/` directories inside one repository and one deployable
runtime. This keeps the HTTP/UI boundary explicit while allowing shared contract
definitions without introducing separate services or packages.

## Complexity Tracking

No constitutional violations or justified complexity exceptions are required for
this plan.
