# AGENTS.md

Project guidance for AI coding agents working in this repository.

## Project Overview

**CIS INTEK** — a Customer Information System & billing SPA built on the **Minimal (Minimals) MUI** template for the INTEK ISP company. Not a library — this is a production business app.

- **Stack:** React 18 (JSX) + Vite + SWC, MUI v5 (Material UI), Redux Toolkit + redux-persist, React Router v7, React Hook Form + Zod resolvers, react-leaflet (maps), i18next, TipTap editor, ECharts / ApexCharts, PWA via vite-plugin-pwa.
- **Language:** JavaScript (no TypeScript). Type safety is done via JSDoc `@typedef` annotations.
- **Package manager:** Yarn (lockfile present). Bun is the active terminal. Node 20.x.

## Commands

```sh
yarn dev          # dev server (port 3031)
yarn build        # production build
yarn lint         # eslint src/**/*.{js,jsx,ts,tsx}
yarn lint:fix     # auto-fix lint
yarn fm:check     # prettier check
yarn fm:fix       # prettier format
```

## Architecture & Folder Conventions

Layered structure under `src/` — data flows **page → store → repository → API**:

| Folder | Responsibility |
|--------|---------------|
| `pages/` | Route-level screens (`Login.jsx`, `admin/`, `dashboard/`, `auth/`) |
| `stores/` | Redux Toolkit slices (`*Store.js`) — one per domain (customer, billing, ticket…) |
| `repositories/` | Axios API calls, one file per resource (`customer.js`, `invoiceTemp.js`…) — **no UI logic here** |
| `models/` | JSDoc type definitions / domain models |
| `commons/` | `axios.js` (configured axios instance + interceptors), `constant.js` |
| `components/` | Reusable UI components (MUI-based) |
| `routes/` | `paths.js` (URL constants), `sections/` (router config), `hooks/`, `utils.js` |
| `layouts/` | Layout shells (`admin/`, `auth-centered/`, `dashboard/`, `simple/`) |
| `hooks/` | Custom React hooks |
| `helpers/`, `utils/` | Shared helpers |
| `config-global.js` | Global app config |
| `theme/` | MUI theme |
| `auth/` | Auth logic / context / guards |
| `sections/` | Reusable section components |

**Key rules:**
- Follow the existing per-domain file structure. Add a new feature by adding a `repository`, a `store`, and wiring into `routes/sections/` + `routes/paths.js` — not by piling logic into page components.
- Repositories call APIs and return data. Stores hold Redux state. Pages compose UI.

## Path Aliases

Defined in `vite.config.js` and `jsconfig.json`. **Prefer these over relative imports.**

- `@/` → `src/`
- `@components/` → `src/components/`
- `@utils/` → `src/utils/`
- `@assets/` → `src/assets/`
- `@auth/` → `src/auth/`
- `@hooks/` → `src/hooks/`
- `@layouts/` → `src/layouts/`
- `@pages/` → `src/pages/`
- `@routes/` → `src/routes/`
- `@models/` → `src/models/`
- `@themes/` → `src/theme/`
- `@commons/` → `src/commons/`
- `@repositories/` → `src/repositories/`
- `@stores/` → `src/stores/`

Note: `@themes` alias points to `src/theme`, while `jsconfig.json` lists it as `src/themes` — trust `vite.config.js` at runtime.

## Auth & API Conventions

- All API calls go through the configured instance in `src/commons/axios.js`.
- **Interceptor behavior (critical):** The axios request interceptor reads `token` from `localStorage` and attaches `Authorization: Bearer <token>`. It also inspects `privilege` (JSON array in localStorage): non-admin roles (`marketing`, `engineer`, `network_operation_center`) rewrite request URLs by replacing `/admin` → `/marketing`, `/engineer`, or `/noc`. Admin requests pass through unchanged.
- The response interceptor validates responses (excluding `/api/ktp/ocr`) and can trigger logout/redirect on auth failures. Do not bypass these interceptors without understanding them.
- Base API URL comes from `import.meta.env.VITE_API_URL`.
- Auth is guarded at the app root in `src/app.jsx` via `<AuthGuard>`. Never render protected pages outside the guard.

## State Management

- Redux Toolkit slices live in `src/stores/`. **Immutability is enforced** — update state via reducers/immer, never mutate directly.
- `redux-persist` is configured — be aware some slices persist to localStorage.
- A websocket store (`socketStore.js`) exists for realtime.

## Styling

- **MUI v5** with `sx` props, `@emotion/styled`, and Emotion cache. Material UI v5 uses Emotion — keep consistent, avoid raw CSS unless necessary.
- Tailwind is present (`tailwind.config.js`, `postcss.config.js`, `global.css`) but the app is MUI-first. Match surrounding components (use `src/global.css` / theme tokens, not ad-hoc Tailwind utilities) unless a new screen explicitly uses it.

## Conventions

- **JS, not TS.** Add JSDoc `@typedef` blocks in repositories/models for domain shapes instead of TypeScript interfaces.
- **Component files:** PascalCase (`.jsx`); stores/repos in camelCase (`.js`). Match the domain folder (e.g. `*Store.js`).
- State data shape conventions: `{ success, message, data }` envelope from REST responses (`success` boolean).
- Keep one concern per layer. Repositories must not contain JSX/UI logic.
- Dates use `date-fns`; charts use `react-apexcharts` / `echarts-for-react` (as used in the codebase).
- Forms use React Hook Form with `@hookform/resolvers` + Zod. `mui-one-time-password-input` exists for OTP.
- Do not introduce new state libraries or REST helpers when Redux Toolkit + the existing axios instance already cover the need.

## Environment

- `.env` files carry runtime env (`VITE_API_URL`, `WEBSITE_NAME`, etc.) — never commit secrets; copy hidden files when scaffolding.
