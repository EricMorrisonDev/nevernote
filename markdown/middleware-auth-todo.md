# Middleware auth — implementation todo

Goal: Guests who open the app see **login first**; authenticated users reach the workspace. **API routes stay protected with `requireUser()`** — middleware is an extra layer for navigation UX, not a replacement.

---

## Prerequisites

- [ ] **`/login` page exists** and renders your auth UI (`AuthForm` / `LoginForm` / `SignUpForm`).
- [ ] **Login and signup API routes** remain reachable without a prior session (`/api/auth/login`, `/api/auth/signup`).
- [ ] Confirm **session cookie name** matches app code (currently **`session`** per auth routes).

---

## Core middleware (`middleware.ts` at project root)

- [ ] Add **`middleware.ts`** next to **`package.json`** / **`app/`** (Next.js convention).
- [ ] **`export function middleware(request: NextRequest)`** (or default export per Next docs for your version).
- [ ] **`export const config`** with **`matcher`** that:
  - **Includes** routes to protect (at minimum **`/`** and other app pages you add later).
  - **Excludes** static assets: **`/_next/static`**, **`/_next/image`**, **`favicon.ico`**, public files.
  - **Excludes** **`/api/auth/*`** (or only the login/signup paths) so unauthenticated users can still authenticate.
  - Optionally exclude **`/api/*`** entirely from middleware if you only care about **page** redirects — or run middleware on **`/api`** only when you need consistent behavior (usually **page-only** matcher is simpler for this project).

---

## Auth logic (Edge-safe)

- [ ] Read **`session`** cookie from **`request.cookies`** (or `NextRequest` helpers).
- [ ] **Unauthenticated** (no cookie): for **protected page paths**, **`NextResponse.redirect(new URL('/login', request.url))`**.
- [ ] **Authenticated** (cookie present): for **`/login`** (and **`/signup`** if separate), optionally **`redirect('/')`** so logged-in users don’t see the auth form again.

**Note:** Middleware typically checks **cookie presence** only. **Expiry / DB validation** stays in **`getCurrentUser` / `requireUser`** and API handlers. Document this so expectations stay clear.

---

## Avoid redirect loops

- [ ] **`/login`** must **not** redirect to **`/`** when the cookie is missing.
- [ ] **`/`** must **not** redirect to **`/login`** when the cookie exists (even if expired — full validation happens server-side; optional later: tighter checks).

---

## Post-login / logout UX

- [ ] **`LoginForm`** already redirects to **`/`** — verify it still works after middleware is live.
- [ ] **`/logout`** or logout API: after clearing the cookie, user should be able to hit **`/`** and get sent to **`/login`** again.

---

## Manual verification

- [ ] **Logged out:** open **`/`** → lands on **`/login`** (no long flash of workspace).
- [ ] **Logged out:** **`POST /api/auth/login`** still works; after success, **`/`** loads workspace.
- [ ] **Logged in:** open **`/login`** → redirects to **`/`** (if implemented).
- [ ] **Logged in:** **`GET /api/notebooks`** still returns **200** with session.
- [ ] **Direct API call without cookie:** still **401** from **`requireUser`** (unchanged).

---

## Documentation / team notes

- [ ] Add a one-line comment in **`middleware.ts`** or this doc: **API protection = `requireUser`; middleware = page-level gate.**

---

## Optional follow-ups

- [ ] **`returnUrl`** query param: redirect to intended path after login.
- [ ] Stricter middleware (e.g. JWT decode only — no Prisma in Edge unless you add an Edge-compatible client or external session service).
