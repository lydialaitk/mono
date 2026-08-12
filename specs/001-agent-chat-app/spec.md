# Feature Specification: 繁體中文 Agent Chat App

**Feature Branch**: `001-agent-chat-app`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "建立一個簡單的 agent chat app。使用者可在 web 介面輸入繁體中文訊息，並收到由 backend agent 串流回傳的回覆。v1 只需要單一聊天 thread；不包含登入、資料庫、RAG、tools、上傳附件或 production deployment。Acceptance criteria：1. web 介面可送出訊息並顯示串流回覆。2. backend 有可檢查的 health/status endpoint。3. 前端 endpoint 可透過 environment variable 設定。"

## Clarifications

### Session 2026-08-12

- Q: What should generate the assistant replies in v1? → A: Configurable — mock by default; use real LLM when API credentials are provided
- Q: When the user sends a follow-up message in the same thread, should the backend agent receive the full conversation history or only the latest message? → A: Full in-session history
- Q: After the user refreshes the page, what should happen to the single chat thread in v1? → A: Restore the current thread after refresh within the same browser session

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send a message and read the reply (Priority: P1)

As a user, I can type a Traditional Chinese message in a web chat interface and
receive the agent's reply as it streams into the conversation so I can interact
without waiting for the full response to finish.

**Why this priority**: This is the core value of the product. Without end-to-end
message submission and streaming reply display, the feature does not function as
a chat app.

**Independent Test**: Can be fully tested by opening the web interface, sending a
Traditional Chinese message, and confirming that a visible assistant reply
appears progressively in the same chat thread.

**Acceptance Scenarios**:

1. **Given** the chat page is open and the service is available, **When** the
   user submits a Traditional Chinese message, **Then** the system adds the user
   message to the single thread and begins showing the assistant reply as it is
   generated.
2. **Given** an assistant reply is streaming, **When** additional response
   content arrives, **Then** the visible assistant message updates in place until
   the reply is complete.
3. **Given** the thread already contains earlier user and assistant messages,
   **When** the user sends a follow-up message, **Then** the backend receives the
   full in-session conversation history so the reply can use prior context.
4. **Given** the user refreshes the page during the same browser session,
   **When** the chat page reloads, **Then** the existing single thread is restored
   so the user can continue the conversation without starting over.

---

### User Story 2 - Confirm backend availability (Priority: P2)

As a developer or operator, I can check whether the backend is up through a
simple status endpoint so I can verify readiness before using or diagnosing the
chat app.

**Why this priority**: The app depends on a reachable backend. A dedicated status
check reduces ambiguity during setup and troubleshooting.

**Independent Test**: Can be tested independently by requesting the backend
status endpoint and confirming that it returns a machine-readable healthy or
unhealthy result.

**Acceptance Scenarios**:

1. **Given** the backend service is running normally, **When** a caller requests
   the status endpoint, **Then** the response indicates the service is healthy.
2. **Given** the backend cannot process chat requests, **When** a caller requests
   the status endpoint, **Then** the response makes the degraded or unavailable
   state detectable.

---

### User Story 3 - Point the frontend at a chosen backend (Priority: P3)

As a developer, I can configure which backend endpoint the frontend uses through
environment-level configuration so I can run the same frontend against different
backend locations without code changes.

**Why this priority**: The product is easier to run and test when the frontend
does not hard-code backend location details.

**Independent Test**: Can be tested independently by starting the frontend with a
different configured backend endpoint and confirming that chat requests and status
checks are directed to that location.

**Acceptance Scenarios**:

1. **Given** the frontend is started with a configured backend endpoint, **When**
   the chat page loads, **Then** the frontend uses that configured endpoint for
   chat and status requests.
2. **Given** the configured backend endpoint changes between runs, **When** the
   frontend starts again, **Then** no frontend code edits are required for the app
   to target the new backend location.

---

### Edge Cases

- What happens when the backend becomes unavailable after the user submits a
  message but before the streamed reply completes?
- How does the system handle an empty message or a message made only of
  whitespace?
- What happens when the configured backend endpoint is missing, malformed, or
  unreachable at startup?
- What happens if the browser session ends after the page was previously refreshed
  and the user returns later?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a web chat interface where a user can enter
  and submit a message written in Traditional Chinese.
- **FR-002**: The system MUST maintain exactly one chat thread for v1 and display
  messages for that thread in chronological order.
- **FR-002a**: The system MUST restore the current single chat thread after a page
  refresh within the same browser session.
- **FR-003**: The system MUST send each submitted user message to the backend
  agent and begin returning the assistant reply incrementally rather than only
  after the full reply is complete.
- **FR-003a**: For every message after the first one in the session, the system
  MUST send the full in-session conversation history together with the latest
  user message so the backend can generate a context-aware reply.
- **FR-004**: The system MUST show streamed assistant output in the web interface
  as it arrives and clearly indicate when the reply has finished.
- **FR-005**: The system MUST preserve the user's submitted message in the visible
  thread even if the backend reply fails or is interrupted.
- **FR-006**: The system MUST expose a backend health or status endpoint that
  allows callers to determine whether the backend is available to serve requests.
- **FR-007**: The system MUST allow the frontend's backend endpoint to be set
  through environment-based configuration without requiring frontend code changes.
- **FR-008**: The system MUST provide a user-visible failure state when a message
  cannot be delivered or a streamed reply cannot be completed.
- **FR-009**: The system MUST exclude authentication, persistent storage,
  retrieval augmentation, tool invocation, file attachments, and production
  deployment concerns from v1 scope.
- **FR-010**: The backend agent MUST use a deterministic mock response mode by
  default so the app can be exercised without external credentials.
- **FR-011**: When valid external LLM credentials are provided through
  configuration, the backend MUST route assistant replies through the real LLM
  instead of the mock agent.
- **FR-012**: The status endpoint MUST indicate whether the backend is operating
  in mock mode or real LLM mode.

### Key Entities *(include if feature involves data)*

- **Chat Thread**: The single active conversation shown to the user, containing
  an ordered list of user and assistant messages for the current session, and
  the same ordered history is the context sent with each follow-up request and
  restored after refresh within the same browser session.
- **Message**: A chat item authored by either the user or the assistant, with
  content, author role, lifecycle state, and display order in the thread.
- **Backend Endpoint Configuration**: The runtime-selected backend location used
  by the frontend to send chat requests and check backend status.
- **Service Status Result**: A machine-readable status response that communicates
  whether the backend is able to serve chat traffic.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a manual end-to-end check, a user can submit a Traditional
  Chinese message from the web interface and see the assistant reply begin
  appearing within 2 seconds of submission under normal local development
  conditions.
- **SC-002**: In 95% of manual test runs under normal local development
  conditions, a complete assistant reply is visibly streamed into the thread
  without requiring a page refresh or duplicate submission.
- **SC-003**: A developer can determine backend readiness with a single request to
  the status endpoint and receive a clear healthy or unhealthy result.
- **SC-004**: A developer can change the frontend's target backend endpoint for a
  new run without editing application source files.

## Assumptions

- v1 is intended for local or non-production evaluation, not hardened production
  use.
- The primary user can read and write Traditional Chinese and interacts through a
  desktop-class web browser.
- Conversation history must survive page refreshes within the same browser
  session, but it does not need to survive browser-session end, app restarts, or
  browser closure.
- A single active thread means the user cannot create, switch, rename, or delete
  multiple conversations in v1.
- Without external LLM credentials, the backend uses a mock agent that produces
  predictable streamed responses suitable for local development and manual testing.
- When external LLM credentials are configured, the same chat flow uses the real
  LLM without requiring frontend changes.
