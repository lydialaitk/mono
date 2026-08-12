---
description: "Task list for 繁體中文 Agent Chat App implementation"
---

# Tasks: 繁體中文 Agent Chat App

**Input**: Design documents from `/specs/001-agent-chat-app/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Constitution-required unit and integration tests are included for pure
logic and boundary behavior. Full TDD sequencing is not mandated by the feature
spec, but these tests must be implemented before the feature is considered done.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app layout**: `backend/src/`, `frontend/src/`, `shared/src/`
- **Documentation**: `specs/001-agent-chat-app/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create repository layout directories `backend/`, `frontend/`, and `shared/` per `specs/001-agent-chat-app/plan.md`
- [X] T002 Initialize root `package.json` with npm workspaces and scripts `dev`, `build`, `start`, `test`, `lint`, and `check`
- [X] T003 [P] Initialize backend package manifest and dependencies in `backend/package.json`
- [ ] T004 [P] Initialize frontend package manifest and Vite dependencies in `frontend/package.json`
- [ ] T005 [P] Initialize shared package manifest in `shared/package.json`
- [ ] T006 [P] Configure TypeScript project references in `tsconfig.json`, `backend/tsconfig.json`, `frontend/tsconfig.json`, and `shared/tsconfig.json`
- [ ] T007 [P] Configure linting and formatting in `eslint.config.js` and `.prettierignore`
- [ ] T008 Create frontend HTML shell in `frontend/public/index.html` and entry stub in `frontend/src/main.ts`
- [ ] T009 [P] Create CI parity workflow that runs `npm run check` in `.github/workflows/check.yml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Define shared chat contract types in `shared/src/contracts/chat.ts`
- [ ] T011 [P] Define shared status contract types in `shared/src/contracts/status.ts`
- [ ] T012 [P] Define shared stream event types in `shared/src/events/stream-event.ts`
- [X] T013 Implement backend configuration loader in `backend/src/app/config.ts`
- [X] T014 [P] Implement structured telemetry event helper in `backend/src/telemetry/events.ts`
- [X] T015 Implement Fastify server bootstrap in `backend/src/app/server.ts`
- [X] T016 Create API route registration shell in `backend/src/api/routes.ts`
- [ ] T017 [P] Implement frontend backend-endpoint config loader in `frontend/src/config/backend-endpoint.ts`
- [X] T018 Wire server entrypoint and static asset serving in `backend/src/app/main.ts`
- [X] T019 [P] Add Vitest workspace wiring and `npm run check` test hooks in `vitest.config.ts` and root `package.json`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Send a message and read the reply (Priority: P1) 🎯 MVP

**Goal**: Users can submit Traditional Chinese messages in the web UI and receive
streamed assistant replies in a single chat thread, including follow-up context
and same-session refresh restore.

**Independent Test**: Open the web interface, send a Traditional Chinese message,
confirm the assistant reply streams into the thread, send a follow-up that uses
prior context, refresh the page in the same browser session, and confirm the
thread is restored.

### Implementation for User Story 1

- [ ] T020 [P] [US1] Add unit tests for blank-message validation in `frontend/tests/unit/chat-validation.test.ts`
- [ ] T021 [P] [US1] Add unit tests for session snapshot save/load helpers in `frontend/tests/unit/thread-storage.test.ts`
- [ ] T022 [P] [US1] Add unit tests for full-history request shaping in `frontend/tests/unit/thread-state.test.ts`
- [X] T023 [P] [US1] Add unit tests for reply-mode selection in `backend/tests/unit/reply-provider.test.ts`
- [X] T024 [P] [US1] Add integration test for chat SSE stream contract in `backend/tests/integration/chat-stream.test.ts`
- [ ] T025 [P] [US1] Define `ChatThread` and `Message` types in `shared/src/types/chat-thread.ts`
- [ ] T026 [P] [US1] Implement blank-message validation helper in `frontend/src/chat/validation.ts`
- [ ] T027 [P] [US1] Implement session snapshot save/load helpers in `frontend/src/session/thread-storage.ts`
- [X] T028 [P] [US1] Implement deterministic mock reply adapter in `backend/src/chat/mock-agent.ts`
- [X] T029 [P] [US1] Implement optional Vercel AI SDK reply adapter in `backend/src/chat/llm-agent.ts`
- [X] T030 [US1] Implement reply-mode selector in `backend/src/chat/reply-provider.ts`
- [X] T031 [US1] Implement SSE stream event builder in `backend/src/chat/stream-events.ts`
- [X] T032 [US1] Implement `POST /api/v1/chat` route in `backend/src/chat/chat-route.ts`
- [ ] T033 [US1] Implement chat request client with SSE parsing in `frontend/src/chat/chat-client.ts`
- [ ] T034 [US1] Implement thread state manager in `frontend/src/chat/thread-state.ts`
- [ ] T035 [P] [US1] Implement message list renderer with streaming-complete and failed states in `frontend/src/ui/message-list.ts`
- [ ] T036 [P] [US1] Implement chat input and validation UI for Traditional Chinese message entry in `frontend/src/ui/chat-input.ts`
- [ ] T037 [US1] Implement chat page composition in `frontend/src/ui/chat-page.ts`
- [ ] T038 [US1] Wire chat bootstrap, restore, and submit handlers in `frontend/src/main.ts`
- [ ] T039 [US1] Implement user-visible stream failure handling that preserves partial assistant output and submitted user messages in `frontend/src/ui/error-state.ts`

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Confirm backend availability (Priority: P2)

**Goal**: Developers and operators can inspect backend process health and typed
service status, including reply mode and configuration details.

**Independent Test**: Request `/health` and `/status` and confirm machine-readable
responses match `specs/001-agent-chat-app/contracts/http-api.yaml`, including
process-only top-level health when Vercel AI SDK provider mode is enabled.

### Implementation for User Story 2

- [X] T040 [P] [US2] Add integration test for `/health` process-only semantics in `backend/tests/integration/health-route.test.ts`
- [X] T041 [P] [US2] Add integration test for `/status` healthy/degraded service semantics in `backend/tests/integration/status-route.test.ts`
- [X] T042 [P] [US2] Implement shallow `/health` route in `backend/src/status/health-route.ts`
- [X] T043 [P] [US2] Implement typed `/status` route with healthy/degraded service reporting in `backend/src/status/status-route.ts`
- [X] T044 [US2] Register health and status routes in `backend/src/api/routes.ts`
- [ ] T045 [US2] Implement frontend status probe helper in `frontend/src/status/status-client.ts`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Point the frontend at a chosen backend (Priority: P3)

**Goal**: The frontend backend endpoint is configurable through environment
variables without source edits, and chat/status requests use the configured target.

**Independent Test**: Start the frontend with different `FRONTEND_BACKEND_URL`
values across runs and confirm chat and status requests target the configured
backend location.

### Implementation for User Story 3

- [ ] T046 [P] [US3] Document environment variables in `.env.example`
- [ ] T047 [US3] Inject `FRONTEND_BACKEND_URL` into frontend runtime config in `frontend/vite.config.ts`
- [ ] T048 [US3] Ensure chat and status clients read configured endpoint from `frontend/src/config/backend-endpoint.ts`
- [ ] T049 [US3] Add startup handling for missing or malformed backend URL in `frontend/src/main.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, command discoverability, and end-to-end validation

- [ ] T050 [P] Document canonical npm commands and environment setup in `README.md`
- [ ] T051 [P] Add browser-level smoke validation for refresh restore in `frontend/tests/integration/chat-refresh.test.ts`
- [ ] T052 Validate all scenarios in `specs/001-agent-chat-app/quickstart.md`, including confirming first streamed output appears within 2 seconds in mock mode
- [ ] T053 [P] Verify contract alignment against `specs/001-agent-chat-app/contracts/http-api.yaml`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)
  - US2 and US3 can start in parallel after Foundational if staffed
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational — independently testable via HTTP endpoints
- **User Story 3 (P3)**: Can start after Foundational — integrates with US1/US2 clients but is independently verifiable by changing environment configuration

### Within Each User Story

- Shared types and helpers before route/client integration
- Backend adapters before chat route wiring
- Frontend state/storage before page composition
- Core behavior before polish and validation tasks

### Parallel Opportunities

- Phase 1 tasks T003–T007 and T009 can run in parallel after T001–T002
- Phase 2 tasks T011–T012, T014, T017, and T019 can run in parallel after T010
- US1 tasks T020–T025 and T035–T036 can run in parallel before integration tasks T030–T039
- US2 tasks T040–T043 can run in parallel
- US3 task T046 can run in parallel with T047–T049 prep
- Polish tasks T050, T051, and T053 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch independent US1 backend pieces together:
Task: "Implement deterministic mock reply adapter in backend/src/chat/mock-agent.ts"
Task: "Implement optional Vercel AI SDK reply adapter in backend/src/chat/llm-agent.ts"
Task: "Implement session snapshot save/load helpers in frontend/src/session/thread-storage.ts"
Task: "Add integration test for chat SSE stream contract in backend/tests/integration/chat-stream.test.ts"

# Launch independent US1 UI pieces together:
Task: "Implement message list renderer in frontend/src/ui/message-list.ts"
Task: "Implement chat input and validation UI in frontend/src/ui/chat-input.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run US1 unit/integration tests plus quickstart scenarios 1–3 for streaming, validation, and refresh restore
5. Demo the MVP before adding status and config polish

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → validate streaming chat MVP
3. Add User Story 2 → validate `/health` and `/status`
4. Add User Story 3 → validate environment-based backend targeting
5. Run Polish phase, CI parity check, and full quickstart validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Rejoin for Polish and quickstart validation

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in the same phase
- [Story] label maps task to specific user story for traceability
- Each user story should remain independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid speculative abstractions; keep modules small enough to delete and rewrite in a day
