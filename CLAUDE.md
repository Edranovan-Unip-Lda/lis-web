# CLAUDE.md — lis-web (Frontend)

Guidance for AI assistants working in **`lis-web`**, the Angular frontend of **LIS — License Information System**
(Govt. of Timor-Leste / MCI). The Spring Boot backend is the sibling `lis-api/` repo. Workspace overview:
`../CLAUDE.md`. Security model + remediation record: `../SYSTEM_AUDIT.md`.

## Commands
```bash
npm start            # ng serve → http://localhost:4200 (environment.development.ts → API localhost:8081)
npm run build        # prod build → dist/mci-license  (use this to verify changes type-check)
npm run watch        # dev build, watch mode
npm test             # Karma/Jasmine
npm run format       # prettier
```

## Stack & structure
- **Angular 19**, **standalone components + signals**, PrimeNG (Aura) + Tailwind v4. Locale `pt`. Path alias
  **`@/*` → `src/app/*`**.
- `src/app/` split: `core/` (`services/`, `security/`, `models/`, `resolvers/`, `validators/`, `pipes/`, `utils/`),
  `layout/`, `pages/` (feature areas: `application-management`, `empresa`, `licencas-certificados`, `dados-mestre`,
  `reports`, `usermanagement`, `auth`, `dashboard`, `logs`, `gestor`, `profile`).
- **Routes live in `src/app.routes.ts`** (at `src/`, not `src/app/`); feature route files under `pages/*`.
- API base URLs from `src/environments/environment*.ts` (`apiUrl` = `<host>/api/v1`, `url` = `<host>`). Per-domain
  service in `core/services/`. Libs: Highcharts + chart.js, jsPDF/html2canvas/xlsx (export), Quill, ng-recaptcha-2,
  Sentry.

## Auth & HTTP (how requests work — important)
- **JWT lives in an HttpOnly cookie** the browser sends automatically; the **user profile** (username, role,
  empresa) is cached in `localStorage` under key `user` (`AuthenticationService`). The localStorage role is
  **UX-only** — never the real authorization (the backend enforces that).
- Login is two-step: credentials → **OTP** (`verification` page). The OTP-session gate
  (`core/services/otp-session.service.ts`) is UX-only; the server OTP check is the real protection.
- **`core/security/http-error.interceptor.ts`** clones every request with `withCredentials: true` (so the cookie
  rides along), attaches the **`X-XSRF-TOKEN`** header from the `XSRF-TOKEN` cookie on mutating requests (Angular's
  built-in XSRF skips absolute URLs, so this is manual — needed for prod CSRF), reports errors to Sentry, and
  **logs out only on 401** (not 403 — a 403 is one forbidden request, not a session end).
- **Route guards** (`core/security/route.guard.ts`): `authenticationCanActivate`, `canActivateByRole` (reads
  `route.data['role']`; null-guards the user). Add guards to any protected/admin route (set `data.role`).

## Conventions & gotchas (do these by default)
- **HAL responses:** Spring Data REST `/data/*` returns `{ _embedded: { <name>: [...] } }`. **Always read it
  defensively:** `(resp?._embedded?.<name> ?? [])` — never `resp._embedded.x` (it white-screens on an empty/non-HAL
  response). Resolvers should tolerate failures (return a safe empty shape).
- **Resolvers + `currentUserValue`:** guard `authService.currentUserValue` before dereferencing — it can be null
  right after a logout/redirect.
- **Subscriptions:** add `takeUntilDestroyed()` (inject `DestroyRef`) to long-lived subscriptions; give
  `.subscribe()` an `error` callback (don't swallow failures); revoke object URLs (`URL.revokeObjectURL`) in
  `ngOnDestroy`.
- **External links:** `target="_blank"` must have `rel="noopener noreferrer"`.
- **User-by-direcao** lookups use `GET /api/v1/users/by-direcao` (returns a plain `UserDto[]`), **not** the old
  Spring Data REST `/data/users/...` path (which is gone — `User` is no longer REST-exposed).
- **reCAPTCHA v3** (`ng-recaptcha-2`): obtain a token via `ReCaptchaV3Service.execute(RecaptchaAction.<x>)` and pass
  it to the backend for public/abuse-prone flows (registration, certificate search, forgot-password). Site keys +
  API hosts live in `environment*.ts` (env-specific, not secret).
- Domain terms **Portuguese**, code/comments **English**. `develop` → `main`; commit only when asked.

## Adding a feature — checklist
1. New protected route → add `canActivate`/guards + `data.role`.
2. New API call → go through a `core/services/*` service using `environment.apiUrl`; the interceptor handles
   credentials + CSRF.
3. Reading `_embedded` HAL data → use `?._embedded?.x ?? []`.
4. New subscription → `takeUntilDestroyed` + an error callback.
5. Verify: `npm run build` must succeed (it type-checks the whole app).
