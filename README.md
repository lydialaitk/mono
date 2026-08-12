# mono

Traditional Chinese single-thread agent chat app built with:

- Fastify backend
- Vite + vanilla TypeScript frontend
- shared versioned contracts/types

## Environment

Copy or reference the values in `.env.example`.

Important variables:

- `FRONTEND_BACKEND_URL` — frontend target backend base URL
- `CHAT_REPLY_MODE` — `mock` or `real-llm`
- `VERCEL_AI_SDK_API_KEY` — optional provider key for non-mock mode

## Commands

- `npm run dev` — run backend and frontend development servers
- `npm run build` — build shared package, frontend, and backend
- `npm run start` — start the backend server
- `npm test` — run backend and frontend test suites
- `npm run lint` — run ESLint
- `npm run check` — run the project validation sequence used by CI
