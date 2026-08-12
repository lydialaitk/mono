---
description: "Task list for 繁體中文 Agent Chat App implementation"
---

# Tasks: 繁體中文 Agent Chat App

**Input**: Design documents from `/specs/001-agent-chat-app/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in the feature specification. This task list
focuses on implementation tasks only. Add test tasks later if TDD is desired.

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

- [ ] T001 Create repository layout directories `backend/`, `frontend/`, and `shared/` per `specs/001-agent-chat-app/plan.md`
- [ ] T002 Initialize root `package.json` with npm workspaces and scripts `dev`, `build`, `start`, `test`, `lint`, and `check`
- [ ] T003 [P] Initialize backend package manifest and dependencies in `backend/package.json`
- [ ] T004 [P] Initialize frontend package manifest and Vite dependencies in `frontend/package.json`
- [ ] T005 [P] Initialize shared package manifest in `shared/package.json`
- [ ] T006 [P] Configure TypeScript project references in `tsconfig.json`, `backend/tsconfig.json`, `frontend/tsconfig.json`, and `shared/tsconfig.json`
- [ ] T007 [P] Configure linting and formatting in `eslint.config.js` and `.prettierignore`
- [ ] T008 Create frontend HTML shell in `frontend/public/index.html` and entry stub in `frontend/src/main.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Define shared chat contract types in `shared/src/contracts/chat.ts`
- [ ] T010 [P] Define shared status contract types in `shared/src/contracts/status.ts`
- [ ] T011 [P] Define shared stream event types in `shared/src/events/stream-event.ts`
- [ ] T012 Implement backend configuration loader in `backend/src/app/config.ts`
- [ ] T013 [P] Implement structured telemetry event helper in `backend/src/telemetry/events.ts`
- [ ] T014 Implement Fastify server bootstrap in `backend/src/app/server.ts`
- [ ] T015 Create API route registration shell in `backend/src/api/routes.ts`
- [ ] T016 [P] Implement frontend backend-endpoint config loader in `frontend/src/config/backend-endpoint.ts`
- [ ] T017 Wire server entrypoint and static asset serving in `backend/src/app/main.ts`

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

- [ ] T018 [P] [US1] Define `ChatThread` and `Message` types in `shared/src/types/chat-thread.ts`
- [ ] T019 [P] [US1] Implement blank-message validation helper in `frontend/src/chat/validation.ts`
- [ ] T020 [P] [US1] Implement session snapshot save/load helpers in `frontend/src/session/thread-storage.ts`
- [ ] T021 [P] [US1] Implement deterministic mock reply adapter in `backend/src/chat/mock-agent.ts`
- [ ] T022 [P] [US1] Implement optional real LLM reply adapter in `backend/src/chat/llm-agent.ts`
- [ ] T023 [US1] Implement reply-mode selector in `backend/src/chat/reply-provider.ts`
- [ ] T024 [US1] Implement SSE stream event builder in `backend/src/chat/stream-events.ts`
- [ ] T025 [US1] Implement `POST /api/v1/chat` route in `backend/src/chat/chat-route.ts`
- [ ] T026 [US1] Implement chat request client with SSE parsing in `frontend/src/chat/chat-client.ts`
- [ ] T027 [US1] Implement thread state manager in `frontend/src/chat/thread-state.ts`
- [ ] T028 [P] [US1] Implement message list renderer in `frontend/src/ui/message-list.ts`
- [ ] T029 [P] [US1] Implement chat input and validation UI in `frontend/src/ui/chat-input.ts`
- [ ] T030 [US1] Implement chat page composition in `frontend/src/ui/chat-page.ts`
- [ ] T031 [US1] Wire chat bootstrap, restore, and submit handlers in `frontend/src/main.ts`
- [ ] T032 [US1] Implement user-visible stream failure states in `frontend/src/ui/error-state.ts`

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Confirm backend availability (Priority: P2)

**Goal**: Developers and operators can inspect backend process health and typed
service status, including reply mode and configuration details.

**Independent Test**: Request `/health` and `/status` and confirm machine-readable
responses match `specs/001-agent-chat-app/contracts/http-api.yaml`, including
process-only top-level health when real LLM mode is enabled.

### Implementation for User Story 2

- [ ] T033 [P] [US2] Implement shallow `/health` route in `backend/src/status/health-route.ts`
- [ ] T034 [P] [US2] Implement typed `/status` route in `backend/src/status/status-route.ts`
- [ ] T035 [US2] Register health and status routes in `backend/src/api/routes.ts`
- [ ] T036 [US2] Implement frontend status probe helper in `frontend/src/status/status-client.ts`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Point the frontend at a chosen backend (Priority: P3)

**Goal**: The frontend backend endpoint is configurable through environment
variables without source edits, and chat/status requests use the configured target.

**Independent Test**: Start the frontend with different `FRONTEND_BACKEND_URL`
values across runs and confirm chat and status requests target the configured
backend location.

### Implementation for User Story 3

- [ ] T037 [P] [US3] Document environment variables in `.env.example`
- [ ] T038 [US3] Inject `FRONTEND_BACKEND_URL` into frontend runtime config in `frontend/vite.config.ts`
- [ ] T039 [US3] Ensure chat and status clients read configured endpoint from `frontend/src/config/backend-endpoint.ts`
- [ ] T040 [US3] Add startup handling for missing or malformed backend URL in `frontend/src/main.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, command discoverability, and end-to-end validation

- [ ] T041 [P] Document canonical npm commands and environment setup in `README.md`
- [ ] T042 [P] Add Vitest workspace wiring in `vitest.config.ts` and root `package.json` test scripts
- [ ] T043 Validate all scenarios in `specs/001-agent-chat-app/quickstart.md`
- [ ] T044 [P] Verify contract alignment against `specs/001-agent-chat-app/contracts/http-api.yaml`

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

- Phase 1 tasks T003–T007 can run in parallel after T001–T002
- Phase 2 tasks T010–T011 and T016 can run in parallel after T009
- US1 tasks T018–T022 and T028–T029 can run in parallel before integration tasks T023–T031
- US2 tasks T033–T034 can run in parallel
- US3 task T037 can run in parallel with T038–T040 prep
- Polish tasks T041, T042, and T044 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch independent US1 backend pieces together:
Task: "Implement deterministic mock reply adapter in backend/src/chat/mock-agent.ts"
Task: "Implement optional real LLM reply adapter in backend/src/chat/llm-agent.ts"
Task: "Implement session snapshot save/load helpers in frontend/src/session/thread-storage.ts"

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
4. **STOP and VALIDATE**: Run quickstart scenarios 1–3 for streaming, validation, and refresh restore
5. Demo the MVP before adding status and config polish

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → validate streaming chat MVP
3. Add User Story 2 → validate `/health` and `/status`
4. Add User Story 3 → validate environment-based backend targeting
5. Run Polish phase and full quickstart validation

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
