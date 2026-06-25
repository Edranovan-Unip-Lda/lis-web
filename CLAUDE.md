# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`lis-web` is the Angular frontend of **LIS — License Information System** (Govt. of Timor-Leste / MCI), a trade-licensing platform. The Spring Boot backend lives in the sibling `lis-api/` repo. A fuller cross-repo overview and a citation-backed security/bug audit are in `../CLAUDE.md` and `../SYSTEM_AUDIT.md`.

## Commands
```bash
npm start            # ng serve → http://localhost:4200 (uses environment.development.ts → API localhost:8081)
npm run build        # prod build → dist/mci-license
npm run watch        # dev build, watch mode
npm test             # Karma/Jasmine
npm run format       # prettier
```

## Architecture
- Angular 19, **standalone components + signals**, PrimeNG (Aura theme) + Tailwind v4. Locale `pt`.
- Path alias **`@/*` → `src/app/*`**.
- `src/app/` split: `core/` (`services/`, `security/`, `models/`, `resolvers/`, `validators/`, `pipes/`, `utils/`), `layout/`, `pages/` (feature areas: `application-management`, `empresa`, `licencas-certificados`, `dados-mestre`, `reports`, `usermanagement`, `auth`, `dashboard`, `logs`, `gestor`, `profile`).
- **Routes live in `src/app.routes.ts`** (at `src/`, not `src/app/`). Heavy use of route **resolvers** to prefetch dashboard/profile/notification data.
- **Auth**: `AuthenticationService` stores the **user profile** in `localStorage` (key `user`); the **JWT is in an HttpOnly cookie** the browser sends automatically. The interceptor `core/security/http-error.interceptor.ts` clones every request with `withCredentials: true` — that's how the cookie rides along. Route protection: `core/security/route.guard.ts` (`authenticationCanActivate`, `canActivateByRole` reading `data.role`).
- API base URLs from `src/environments/environment*.ts` (`apiUrl` = `<host>/api/v1`). Default `npm start` → `environment.development.ts`.
- Libs: Highcharts + chart.js (charts), jsPDF/html2canvas/xlsx (export), Quill (rich text), ng-recaptcha-2, Sentry.

## Conventions
- Domain terms are **Portuguese**; code/comments **English**.
- reCAPTCHA site keys + API hosts are in `environment*.ts` (not secret, but env-specific).
- `develop` → `main` workflow. Commit only when asked.
