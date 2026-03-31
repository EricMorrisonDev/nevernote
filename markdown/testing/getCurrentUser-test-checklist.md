# `getCurrentUser` unit test checklist

Target file: `test/unit/getCurrentUser.test.ts`  
Source: `lib/session.ts` — mock `cookies()` from `next/headers` and `prisma` from `@/lib/db` (or your app’s db module).

---

## 1. No session cookie → `null`

- Cookie store has **no** `session` cookie (or no value), so there is no `sessionId`.
- **Assert:** `getCurrentUser()` resolves to **`null`**.
- Optional: assert Prisma was **not** called for session lookup (spy).

---

## 2. Cookie present, no matching session → `null`

- `session` cookie has an id, but `prisma.session.findUnique` returns **`null`**.
- **Assert:** **`null`**.

---

## 3. Session expired → `null`

- `findUnique` returns a session with **`expiresAt <= new Date()`** (code uses `<=`, so “expires exactly now” counts as expired).
- **Assert:** **`null`**.
- Optional: assert **`user.findUnique` was not called**.

---

## 4. Session valid, user missing → `null`

- Session exists and is not expired, but **`prisma.user.findUnique`** returns **`null`** (orphaned session).
- **Assert:** **`null`**.

---

## 5. Session valid, user exists → returns user

- Session valid; user row exists.
- **Assert:** return value is the **user object** from Prisma (e.g. same `id` / `email` you mocked).

---

## Optional / polish

- **Stable time:** use a fixed “now” (e.g. `vi.useFakeTimers()` or similar) so expired vs not expired does not flake.
- **`cookies()` mock:** return an object with `.get('session')` → `{ value: '...' }` or `undefined`.

---

## Out of scope for this file

- **`requireUser`** (401 vs user) — test separately or via route integration tests.
