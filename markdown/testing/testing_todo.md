# Testing Todo (Unit + Integration)

Goal: Add practical test coverage for current backend logic (auth/session helpers + stacks/notebooks/notes routes) before continuing UI work.

## Scope

- Use Vitest as the test runner.
- Start with backend-focused tests only (no UI tests yet).
- Prioritize core auth, validation, and ownership rules.

## Phase 1: Test Foundation Setup

- [ ] **Install and configure Vitest**
  - Add `vitest` and required TS/node test dependencies.
  - Create `vitest.config.ts` with a Node test environment.
  - Add scripts to `package.json` (e.g. `test`, `test:watch`).

- [ ] **Create test directory structure**
  - Add folders for unit and integration tests (e.g. `tests/unit`, `tests/integration`).
  - Add shared test utilities folder (e.g. `tests/utils`).

- [ ] **Set up test database strategy**
  - Use a separate test `DATABASE_URL`.
  - Add setup/teardown strategy (migrate once, clean data between tests).
  - Ensure tests never hit dev/prod data.

- [ ] **Add deterministic seed helpers**
  - Create helper functions to create users/sessions/stacks/notebooks/notes for tests.
  - Keep test factories small and reusable.

## Phase 2: Unit Tests (Fast, Isolated)

- [ ] **`requireValidation` helper tests**
  - Returns `NextResponse` 400 on invalid input.
  - Returns parse result with typed `data` on valid input.

- [ ] **`handleApiError` helper tests**
  - Returns 500 JSON response with expected shape.
  - Optionally verify logging behavior (spy on `console.error`).

- [ ] **Session helper tests (`getCurrentUser` / `requireUser`)**
  - No session cookie -> null / 401 behavior.
  - Expired session -> null / 401 behavior.
  - Valid session + user -> returns user.

## Phase 3: Integration Tests (API Route Behavior)

- [ ] **Stacks routes: `app/api/stacks/route.ts`**
  - POST: 401 unauthenticated, 400 invalid payload, 201 success.
  - GET: 401 unauthenticated, 200 with user-scoped stacks.

- [ ] **Stacks by id: `app/api/stacks/[id]/route.ts`**
  - PUT: 400 invalid id/body, 401 unauthenticated, 200 success.
  - DELETE: 401 unauthenticated, 200 success, ownership enforcement.

- [ ] **Notebooks routes: `app/api/notebooks/route.ts`**
  - POST: validation errors, optional stack ownership enforcement, 201 success.
  - GET: optional `stackId` filter with ownership checks.

- [ ] **Notebooks by id: `app/api/notebooks/[id]/route.ts`**
  - PUT and DELETE coverage for auth + ownership + success.

- [ ] **Notes routes: `app/api/notes/route.ts`**
  - POST: optional notebook ownership check + create success.
  - GET: optional notebook filter + user scoping.

- [ ] **Notes by id: `app/api/notes/[id]/route.ts`**
  - PUT: auth, id validation, notebook ownership checks, partial updates.
  - DELETE: auth, id validation, ownership enforcement.

## Phase 4: Quality and CI Safety

- [ ] **Add baseline coverage reporting**
  - Configure a simple coverage threshold for backend tests.

- [ ] **Stabilize flaky tests**
  - Remove test interdependence and timing assumptions.
  - Ensure each test can run independently and in any order.

- [ ] **Add pre-merge test command**
  - Ensure `npm test` (or equivalent) is the default confidence check before merges.

## Suggested First Milestone

- Finish Vitest setup + test DB setup.
- Add unit tests for `requireValidation` and `handleApiError`.
- Add integration tests for stacks POST/GET routes.

This milestone gives immediate value and protects the APIs currently used in demos.
