# MARS Space — student platform frontend

React 19 + TypeScript + Vite + Tailwind v4 + React Router 7 + TanStack Query + Lucide.

```bash
npm install
cp .env.example .env.local   # VITE_USE_MOCKS=true → dev-only mock adapter
npm run dev
npm run build
```

## Structure
- `src/services/apiClient.ts` — shared fetch client: base URL from env, bearer token, 401 → refresh, `ApiError`, Idempotency-Key.
- `src/services/*Service.ts` — one module per domain (dashboard, courses, works, battle, hackathon, blog, payments, shop, notifications, edverse, algo).
- `src/mocks/` — **DEV ONLY** mock adapter. Active only when `import.meta.env.DEV && VITE_USE_MOCKS=true`; excluded from production builds. A yellow banner is shown while mocks are on.
- `src/components/ui` — design system (Button, Card, Modal, Badge, Tabs, Table, Pagination, Skeleton, Empty/Error states…).
- `src/components/layout/AppLayout.tsx` — navbar (coins, streak, points, energy, premium, notifications, profile) + sidebar / mobile drawer.
- `src/pages/*` — all routes: `/main-page`, `/my-courses(/:id)`, `/my-works`, `/battle`, `/hackathon`, `/edverse`, `/algo`, `/blog(/:id)`, `/online-payment`, `/space-shop`, `/space-shop/orders`.

## Security rules implemented
- Shop: only `{productId, quantity}` is sent; price, stock and balance are validated by the backend; success shown only from the server response; Idempotency-Key + disabled button prevent duplicate purchases; balance/stock/orders refetched after every attempt.
- Payments: no card fields — redirect to provider `checkoutUrl`; status shown from `GET /payments/:id` (polled while `pending`).

## Blockers / need from backend
1. Swagger/OpenAPI and real base URL — all endpoints and JSON shapes in `src/types` are **proposed**, not confirmed.
2. Auth scheme (token storage, refresh, login page) — client assumes `localStorage.access_token` + cookie refresh. No login page was built (no existing flow to follow).
3. Battle real-time protocol (WebSocket/SSE) — match state is polled every 2s for now; the actual battle/coding screen depends on it.
4. Edverse and Algo — no contracts; pages show an "unconfirmed" notice.
5. `GET /payments/info` (amount due, suggested amounts, providers) — proposed endpoint.
6. Shop delivery/pickup/cancellation rules — not implemented until confirmed.
