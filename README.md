# Frontend — Vite + React + TypeScript

SPA frontend built with **Vite, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui, React Query and Zustand**, pre-wired to talk to an existing backend.

## Getting started

```bash
npm install
cp .env.example .env   # then set VITE_API_BASE_URL to your backend
npm run dev            # http://localhost:5173
```

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the dev server (host 0.0.0.0)   |
| `npm run build`     | Type-check + production build         |
| `npm run preview`   | Serve the production build            |
| `npm run lint`      | Lint with oxlint                      |

## Environment variables

Only `VITE_`-prefixed variables reach the client. **Never put secrets in `.env`.**

| Variable               | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `VITE_APP_NAME`        | Tab title, sidebar logo, page titles       |
| `VITE_API_BASE_URL`    | Backend base URL (e.g. `http://localhost:8000/api`) |
| `VITE_REQUEST_TIMEOUT` | Axios timeout in ms (default `15000`)      |

Read them via `appConfig` (`src/config/index.ts`), never `import.meta.env` directly.

## Project structure

```
src/
├── components/
│   ├── ui/            # shadcn/ui primitives (button, dialog, table, …)
│   ├── common/        # Spinner, PageLoader, EmptyState, ErrorState,
│   │                  # ConfirmDialog, SearchInput, ThemeToggle,
│   │                  # PageHeader, Logo
│   └── layout/        # AppLayout, Sidebar, Header, AuthGuard
├── config/            # appConfig (env) + nav.ts (sidebar items)
├── hooks/             # useDebounce, useLocalStorage, useMediaQuery,
│                      # useClickOutside, useDocumentTitle, useOnlineStatus
├── lib/
│   ├── api/           # axios client (auth header, ApiError, 401 handling)
│   ├── query-client.ts
│   ├── format.ts      # date/currency/number/initials helpers
│   └── utils.ts       # cn()
├── pages/             # one file per route (HomePage, NotFoundPage, …)
├── providers/         # Theme, Query, AppProviders (composition root)
├── store/             # Zustand: auth-store (persisted), ui-store
└── types/             # env.d.ts, api.ts (ApiError/Paginated shapes)
```

## Conventions

- Import through the `@` alias: `import { Button } from "@/components/ui/button"`.
- Add sidebar links in `src/config/nav.ts`; add routes in `src/App.tsx`.
- Light-only design — white background everywhere; dark mode is disabled by design.
- Toasts: `import { toast } from "sonner"` anywhere.

## Fetching data

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/types/api"

const { data, isPending, error } = useQuery({
  queryKey: ["users", page],
  queryFn: () => api.get<Paginated<User>>(`/users?page=${page}`),
})
```

- The axios client attaches `Authorization: Bearer <token>` from `useAuthStore`.
- Every failure is normalised to `ApiError` (`status`, `code`, `isUnauthorized`…).
- On `401` the session is cleared automatically.

### Auth session

```tsx
const { setAuth, logout, user } = useAuthStore()
setAuth(token, user)   // after login
```

Wrap authenticated routes with `<AuthGuard />` (`src/components/layout/AuthGuard.tsx`) once a `/login` page exists.

## Adding more shadcn/ui components

The project is CLI-compatible (`components.json` included):

```bash
npx shadcn@latest add command calendar form
```

RetHEME by editing the CSS variables at the top of `src/index.css` (e.g. paste a palette from https://ui.shadcn.com/themes).
