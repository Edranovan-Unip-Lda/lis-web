# lis-web — LIS Frontend

Angular single-page app for **LIS (License Information System)**, the trade-licensing platform of the Government of
Timor-Leste / **Ministério do Comércio e Indústria (MCI)**. Companies register and manage license/registration
applications; staff process them; certificates are issued and publicly verifiable.

Backend: sibling **`lis-api`** (Spring Boot). Production: `https://lic.mci.gov.tl`.

> **Working on this codebase (incl. AI assistants):** read **`CLAUDE.md`** (architecture, auth/HTTP, conventions)
> and **`../SYSTEM_AUDIT.md`** (security model) before non-trivial changes.

## Tech stack

- **Angular 19** — standalone components + signals, lazy-loaded feature routes, route resolvers
- **PrimeNG** (Aura theme) + **Tailwind CSS v4**; locale `pt`
- Highcharts + Chart.js (charts) · jsPDF / html2canvas / xlsx (exports) · Quill (rich text) · ng-recaptcha-2 ·
  Sentry (error tracking)

## Getting started

**Prerequisites:** Node 22+, npm. The backend (`lis-api`) should be running at `http://localhost:8081` for a full
local experience.

```bash
npm ci          # install dependencies
npm start       # ng serve → http://localhost:4200 (uses environment.development.ts → API localhost:8081)
```

### Common commands
```bash
npm start            # dev server
npm run build        # prod build → dist/mci-license  (also the way to verify a change type-checks)
npm run watch        # dev build, watch mode
npm test             # Karma/Jasmine unit tests
npm run format       # Prettier
```

## Project structure

- Path alias **`@/*` → `src/app/*`**.
- **Routes** are defined in **`src/app.routes.ts`** (at `src/`, not `src/app/`); feature route files live under
  `src/app/pages/*`.
- `src/app/` split:
  - `core/` — `services/` (one per API domain), `security/` (guards + the HTTP interceptor), `models/`,
    `resolvers/`, `validators/`, `pipes/`, `utils/`
  - `layout/` — shell / navigation
  - `pages/` — feature areas: `auth`, `dashboard`, `application-management`, `empresa`, `licencas-certificados`,
    `dados-mestre`, `reports`, `usermanagement`, `gestor`, `profile`, `logs`
- API base URLs come from `src/environments/environment*.ts` (`apiUrl` = `<host>/api/v1`).

## Authentication & HTTP

- The **JWT lives in an HttpOnly cookie** the browser sends automatically. The user profile (username, role,
  empresa) is cached in `localStorage` (`AuthenticationService`) for UX only — the backend is the real authority.
- Login is two-step: **credentials → email OTP**.
- The HTTP interceptor (`core/security/http-error.interceptor.ts`) sends credentials (`withCredentials: true`),
  attaches the `X-XSRF-TOKEN` header from the `XSRF-TOKEN` cookie on mutating requests (for the prod CSRF
  double-submit scheme), and logs out only on `401`.
- Route protection: `core/security/route.guard.ts` (`authenticationCanActivate`, `canActivateByRole`).

## Conventions (see `CLAUDE.md` for the full list)

- Domain terms are **Portuguese**; code and comments are **English**.
- Read HAL/`_embedded` responses defensively: `(resp?._embedded?.<name> ?? [])`.
- Add `takeUntilDestroyed()` + error callbacks to subscriptions; `rel="noopener noreferrer"` on `target="_blank"`.
- `develop` → `main` workflow; commit only when asked.

## Build & deploy

`npm run build` outputs to `dist/mci-license`. The app is containerized (multi-stage Docker, served by nginx);
the staging build is deployed to Netlify, production behind nginx at `lic.mci.gov.tl`. Environment-specific API
hosts and reCAPTCHA site keys are in `src/environments/environment*.ts`.
