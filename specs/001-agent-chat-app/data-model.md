# Data Model: 繁體中文 Agent Chat App

## Overview

The feature uses a minimal client-owned conversation model. The frontend stores a
single thread for the current browser session and sends the full ordered history
to the backend on each follow-up request. The backend does not persist thread
state between requests.

## Entities

### ChatThread

**Purpose**  
Represents the one active conversation visible in the UI.

**Fields**
- `threadId`: Stable identifier for the current thread within the browser session
- `messages`: Ordered list of `Message` entities
- `createdAt`: Timestamp for when the thread started
- `updatedAt`: Timestamp for the latest successful thread mutation
- `storageVersion`: Client storage schema version for session restore

**Rules**
- Exactly one active thread exists in v1
- The thread is restored after page refresh within the same browser session
- The thread does not need to survive browser-session end, browser closure, or
  application restart
- The ordered message history is the exact context sent in follow-up chat
  requests

### Message

**Purpose**  
Represents a single visible chat entry authored by the user or assistant.

**Fields**
- `messageId`: Stable identifier within the thread
- `role`: `user` or `assistant`
- `content`: Traditional Chinese or other assistant output text
- `state`: `pending`, `streaming`, `complete`, or `error`
- `createdAt`: Timestamp when the message was created in the UI
- `requestId`: Correlation identifier linking assistant messages and stream events

**Rules**
- Blank or whitespace-only drafts never become messages
- User messages are appended before backend reply completion
- Assistant messages may begin in `streaming` state and transition to `complete`
  or `error`
- Display order is chronological and stable once inserted

### StoredThreadSnapshot

**Purpose**  
Represents the serialized browser-session payload used to restore the single chat
thread after refresh.

**Fields**
- `version`: Snapshot schema version
- `thread`: Serialized `ChatThread`

**Rules**
- Stored in browser `sessionStorage`
- Rewritten after each successful thread mutation
- Invalid or malformed snapshots are ignored and replaced by a new empty thread

### ChatRequest

**Purpose**  
Represents the versioned request payload sent from the frontend to the backend
for streamed reply generation.

**Fields**
- `schemaVersion`: Request schema version (`v1`)
- `requestId`: Correlation identifier generated per submission
- `stream`: Boolean indicating streamed response expectation
- `messages`: Full ordered thread history plus the newest user message
- `client`: Optional lightweight client metadata such as app name/version

**Rules**
- `messages` must be non-empty
- Follow-up requests resend the full in-session history
- Requests with blank newest user content are rejected before send

### StreamEvent

**Purpose**  
Represents one structured SSE payload emitted by the backend while processing a
chat request.

**Fields**
- `schemaVersion`: Event schema version (`v1`)
- `type`: One of `response.start`, `response.delta`, `response.complete`,
  `response.error`
- `requestId`: Correlation identifier from the originating request
- `sequence`: Monotonic per-request event ordering number
- `timestamp`: Event emission time
- `data`: Type-specific payload

**Rules**
- A stream emits exactly one terminal event: `response.complete` or
  `response.error`
- `response.delta` events append text to the in-progress assistant message
- The final assembled assistant message is available at completion time for UI
  reconciliation

### ServiceStatus

**Purpose**  
Represents operator-facing backend status information exposed outside the chat
stream.

**Fields**
- `schemaVersion`: Status schema version (`v1`) for `/status`
- `service`: Service name
- `status`: Process-level status summary
- `time`: Response timestamp
- `replyMode`: `mock` or `real-llm`
- `streamTransport`: `sse`
- `configurationState`: Safe summary of mode-specific configuration state

**Rules**
- `/health` remains shallow and only reflects process availability
- `/status` supplements `/health` with typed mode and configuration details
- Sensitive credentials are never exposed in status payloads

## State Transitions

### User Draft
- `empty` -> `invalid` when the draft is blank or whitespace-only and submission
  is attempted
- `draft` -> `submitted` when the message passes validation

### Assistant Message
- `pending` -> `streaming` when `response.start` arrives
- `streaming` -> `complete` when `response.complete` arrives
- `streaming` -> `error` when `response.error` arrives

### Thread Restore
- `missing` -> `new` when no valid snapshot exists
- `stored` -> `hydrated` when a valid snapshot is restored on page load
- `stored` -> `discarded` when snapshot parsing or schema validation fails
