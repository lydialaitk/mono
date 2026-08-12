# Quickstart: 繁體中文 Agent Chat App

## Purpose

Validate the v1 feature end-to-end in local development:
- web UI sends Traditional Chinese messages
- backend streams assistant responses
- `/health` and `/status` are inspectable
- frontend backend endpoint is configurable by environment
- thread restore works across page refresh in the same browser session

## Prerequisites

- Node.js 22+
- npm
- Optional: Vercel AI SDK provider credentials if validating non-mock mode

## Planned Command Surface

All repeatable actions should be exposed through `npm run` commands:

- `npm run dev` — start backend and frontend local development workflow
- `npm run build` — build frontend assets and backend output
- `npm run start` — run the built single deployable
- `npm run test` — run unit and integration tests
- `npm run lint` — run lint checks
- `npm run check` — run the full local validation sequence used by CI

## Environment Setup

Set the frontend backend endpoint before starting the frontend:

```bash
export FRONTEND_BACKEND_URL=http://localhost:3000
```

Optional real LLM provider mode (Vercel AI SDK):

```bash
export CHAT_REPLY_MODE=real-llm
export LLM_API_KEY=your-key-here
```

Mock mode remains the default when real credentials are not configured.

## Validation Scenario 1: Stream a reply in mock mode

1. Run `npm run dev`
2. Open the web app in a desktop browser
3. Enter a Traditional Chinese message such as `你好，請介紹你自己`
4. Submit the message
5. Confirm:
   - the user message appears immediately in the thread
   - an assistant message begins streaming within roughly 2 seconds
   - the assistant message reaches a completed state without page refresh

## Validation Scenario 2: Confirm blank-message validation

1. Focus the message input
2. Enter only spaces or leave the field empty
3. Submit
4. Confirm:
   - no backend request is sent
   - a visible validation message is shown
   - the existing thread remains unchanged

## Validation Scenario 3: Confirm same-session thread restore

1. Complete at least one successful chat exchange
2. Refresh the browser page in the same tab/session
3. Confirm:
   - the prior single thread is restored
   - no messages are duplicated
4. Send a follow-up message
5. Confirm the backend receives the full restored history, not only the latest
   user message

## Validation Scenario 4: Inspect health and status endpoints

1. Request `/health`
2. Confirm it returns process-level success as defined in
   [`contracts/http-api.yaml`](./contracts/http-api.yaml)
3. Request `/status`
4. Confirm it exposes:
   - `schemaVersion: "v1"`
   - reply mode (`mock` or `real-llm`)
   - stream transport (`sse`)
   - safe configuration or readiness details relevant to the active mode

## Validation Scenario 5: Confirm environment-based endpoint configuration

1. Start the frontend with a chosen `FRONTEND_BACKEND_URL`
2. Load the web app
3. Confirm chat and status requests target the configured backend location
4. Restart with a different endpoint value
5. Confirm no frontend source edits are required for the new target

## Automated Validation Expectations

- Unit tests cover:
  - blank-message validation
  - session snapshot save/load helpers
  - chat history shaping for follow-up requests
  - reply-mode selection logic
- Integration tests cover:
  - `POST /api/v1/chat` request validation
  - SSE event ordering and terminal event rules
  - `/health` shallow semantics
  - `/status` typed mode/configuration payload

Refer to:
- [`data-model.md`](./data-model.md) for entity and state definitions
- [`contracts/http-api.yaml`](./contracts/http-api.yaml) for HTTP/API schema details
