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
- **Angular 19**, **standalone components + signals**, PrimeNG (Aura) + Tailwind v4. **Multilanguage pt/tet/en** (see i18n). Path alias
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
  it to the backend for public/abuse-prone flows (certificate search, forgot-password). Site keys + API hosts live
  in `environment*.ts` (env-specific, not secret).
- **Register page** (`pages/auth/register`): documents upload **as selected**, not at submit — `onSelect` opens a
  registration session (`empresaService.verifyRecaptcha` → `sessionToken`) then stages each file via
  `stageDocument`; submit is a small JSON `finalize` carrying the staged refs + token (no multipart). A debounced
  draft autosaves to `localStorage` (`lis:register:draft` — password stripped, `Date`s revived on restore) and is
  offered back through a continue/start-fresh `p-message` banner. The printed **Resumo** is a separate hidden,
  `translate="no"` document (`#resumoPrint`, styled in `register.component.scss`) cloned by `ngxPrint` — keep it
  Portuguese-only and mirroring the official MCI PDF form.
- Domain terms **Portuguese**, code/comments **English**. `develop` → `main`; commit only when asked.

## i18n (pt default · tet · en) — ngx-translate, instant switch, no reload
- **Dictionaries:** `src/i18n/{pt,tet,en}.json` (one per language, nested by feature namespace). Loaded by
  `core/i18n/lazy-translate.loader.ts` via dynamic `import()` → content-hashed lazy chunks (cache-busted per deploy,
  never through the HTTP interceptor). `LanguageService` (`core/i18n`) owns the `lang` signal, persists `lis:lang`
  in localStorage (preserved across the login `localStorage.clear()`), sets `<html lang>`, title and PrimeNG texts
  (`primeng.*` block). Switcher: `shared/language-switcher` (topbar + auth layout).
- **Every user-facing string needs a key in all three files.** `npm run i18n:check` fails on key-set drift, empty
  values, or a literal key referenced in `src/app` that doesn't exist. `npm run i18n:review` exports
  `i18n-tet-review.csv` (pt vs tet) for native-speaker review — Tetum was machine-drafted and is pending review.
- Templates: `{{ 'ns.key' | translate }}`, `[label]="'ns.key' | translate"`. TS (toasts, confirms, exports):
  `inject(LanguageService).instant(key)` **at call time** — never cache translated text in fields, the language can
  change under a live view. Option arrays: `i18nOptions(prefix, [...])` (`core/i18n/translate-ref.ts`) — the label is
  a signal-tracked getter, so option objects keep identity (forms holding the object keep their selection).
- Status codes → `| statusLabel` (`status.<CODE>`); enum codes → `('enum.<Enum>.' + code) | translate`.
- Dates/currency/numbers → `ldate` / `lcurrency` / `lnumber` (impure, follow the language; `LOCALE_ID` is static).
  `tet` locale data is a `pt` clone with Tetum calendar names (`core/i18n/locale-tet.ts`).
- Backend errors arrive already localized (interceptor sends `Accept-Language`). **Never branch on error text** — opt
  into the raw `HttpErrorResponse` with the `RAW_HTTP_ERROR` context token (`core/security/http-context.ts`) and
  branch on `error.errorCode` (the backend message key), as `verification.ts` does.
- Stay Portuguese on purpose: `#resumoPrint` (register) and the off-screen certificate templates in `auth/search`
  (official documents); backend-generated PDFs/emails/notifications; DB master-data values.

## Styling & dark mode
Dark mode is **class-based**: `LayoutService.toggleDarkMode()` puts `.app-dark` on `<html>`, and PrimeNG is
pointed at it via `darkModeSelector: '.app-dark'` (`app.config.ts`). It defaults to **on** (`darkTheme: true`).

- **Never delete `@custom-variant dark` from `src/tailwind.css`.** Tailwind v4 has no `darkMode` config option;
  without that line every `dark:` utility silently compiles to `@media (prefers-color-scheme: dark)` and follows
  the OS instead of the toggle — the app goes dark while the text stays dark. This exact regression happened in
  the v3 → v4 migration. It must stay in sync with `darkModeSelector`.
- **Text colours: use the PrimeNG semantic utilities** (from `tailwindcss-primeui`, resolving `--p-*` tokens that
  PrimeNG itself rewrites under `.app-dark`, so they work whatever Tailwind is doing):
  - body / headings / labels → `text-color`
  - secondary, helper, muted text → `text-muted-color`
  - also available: `text-color-emphasis`, `text-muted-color-emphasis`, `bg-emphasis`, `bg-highlight`,
    `border-surface`, `rounded-border`
- Use `text-surface-N dark:text-surface-M` pairs only when a specific shade matters (see `search.component.html`,
  `app.topbar.html`, `app.breadcrumb.ts`).
- **Never bare `text-gray-*` / `text-white` / `text-black`.** The two exceptions: print/PDF templates (the
  certificate documents, `#resumoPrint`) which are deliberately light-on-white, and text on a fixed-colour chip
  or the branded topbar.
- **Known debt:** several pages (`summary`, `inicio`, `empresa-detail`, `empresa-form`, `register`, the
  atividade/cadastro details) were authored dark-first with a hardcoded palette (`text-gray-100`, `bg-gray-800`,
  `bg-[#26262B]`) and are **broken in light mode**. Convert to the utilities above when you touch them.
- **Highcharts is not theme-aware** — the dashboard charts hardcode `#e5e7eb` / `#9ca3af` and none re-render on
  theme change. New charts should read tokens via `getComputedStyle(document.documentElement)`.

## Adding a feature — checklist
1. New protected route → add `canActivate`/guards + `data.role`.
2. New API call → go through a `core/services/*` service using `environment.apiUrl`; the interceptor handles
   credentials + CSRF.
3. Reading `_embedded` HAL data → use `?._embedded?.x ?? []`.
4. New subscription → `takeUntilDestroyed` + an error callback.
5. New markup → `text-color` / `text-muted-color`, never bare `text-gray-*` (see **Styling & dark mode**);
   check it in both themes with the topbar moon/sun toggle.
6. New UI text → keys in `src/i18n/{pt,tet,en}.json`; `npm run i18n:check` must pass.
7. Verify: `npm run build` must succeed (it type-checks the whole app).
