## Custom session + cookie auth plan

### 1. Add `Session` model in Prisma

- Add a `Session` model (e.g. `id`, `userId`, `createdAt`, `expiresAt`) in `prisma/schema.prisma`.
- Run `npx prisma migrate dev --name add_session_model` to create the table.

### 2. Password hashing

- Install a hashing library: `bcrypt` / `bcryptjs` / `argon2`.
- On sign-up: hash the password and store it in `User.passwordHash`.
- On login: compare the provided password with the stored hash.

### 3. Auth API endpoints

- `POST /api/auth/signup`
  - Validate input with Zod (email, password).
  - Hash password and create `User`.
  - (Optional) create a session immediately and set cookie.
- `POST /api/auth/login`
  - Validate input with Zod.
  - Find `User` by email.
  - Verify password with hash.
  - Create `Session` row with random `sessionId` and `expiresAt`.
  - Set an httpOnly session cookie with that `sessionId`.
- `POST /api/auth/logout`
  - Read `sessionId` from cookie.
  - Delete or invalidate the `Session` row.
  - Clear the cookie.

### 4. Session cookie handling

- Use `cookies()` from `next/headers` in Route Handlers.
- On login: `cookies().set("session", sessionId, { httpOnly: true, secure: true in production, sameSite: "lax" })`.
- On logout: `cookies().delete("session")` (or set an expired cookie).

### 5. Helper to get current user

- Implement a server-only `getCurrentUser()` helper:
  - Read `session` cookie.
  - Look up `Session` by ID and ensure `expiresAt > now()`.
  - Load the associated `User`.
  - Return the user or `null` if unauthenticated.

### 6. Protecting routes and APIs

- In API handlers (notes, notebooks, search):
  - Call `getCurrentUser()`, return 401 if `null`.
  - Scope DB queries by `user.id`.
- In pages/layouts that require auth:
  - If `getCurrentUser()` returns `null`, redirect to the login page.

### 7. Session expiration and cleanup

- When creating a session, set `expiresAt` (e.g. now + 30 days).
- Treat expired sessions as invalid in `getCurrentUser()`.
- (Optional) periodically delete expired `Session` rows.

