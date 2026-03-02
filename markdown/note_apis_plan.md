## Note-related API plan

### Notebook stacks (Stack) APIs

- **Routes**
  - `POST /api/stacks` – create stack
  - `GET /api/stacks` – list all stacks for current user
  - `PATCH /api/stacks/:id` – rename stack
  - `DELETE /api/stacks/:id` – delete stack and detach notebooks (set their `stackId` to `null`, do not delete notebooks)

- **Implementation tasks**
  - Add Zod schemas for stack create/update payloads.
  - In each handler:
    - Call `getCurrentUser()`, return 401 if `null`.
    - Ensure all queries/mutations filter by `userId`.
  - For delete:
    - Decide behavior explicitly (e.g. set `stackId` to `null` on that user’s notebooks in the stack).

---

### Notebooks APIs

- **Routes**
  - `POST /api/notebooks` – create notebook (optionally with `stackId`)
  - `GET /api/notebooks` – list notebooks (optionally filter by `stackId`)
  - `GET /api/notebooks/:id` – get single notebook (optionally include note count)
  - `PATCH /api/notebooks/:id` – rename notebook, change `stackId`, or remove from stack
  - `DELETE /api/notebooks/:id` – delete notebook and its notes

- **Implementation tasks**
  - Add Zod schemas for notebook create/update payloads (title, optional `stackId`).
  - In each handler:
    - Call `getCurrentUser()`, return 401 if `null`.
    - Scope all queries/mutations by `userId` so users cannot access each other’s notebooks.
  - On delete:
    - Ensure notes are removed (via Prisma cascading or explicit delete).
  - Add sensible ordering for lists (e.g. `orderBy: createdAt desc`).

---

### Notes APIs

- **Routes**
  - `POST /api/notes` – create note (title, content, `notebookId`)
  - `GET /api/notes` – list notes (optionally filter by `notebookId`; later add search query)
  - `GET /api/notes/:id` – get single note
  - `PATCH /api/notes/:id` – update title/content/notebook
  - `DELETE /api/notes/:id` – delete note

- **Implementation tasks**
  - Add Zod schemas for note create/update payloads.
  - In each handler:
    - Call `getCurrentUser()`, return 401 if `null`.
    - Ensure:
      - Target notebook belongs to the current user when creating/moving a note.
      - Target note belongs to the current user when reading/updating/deleting.
  - Choose default ordering (e.g. `orderBy: updatedAt desc` for lists).

---

### Cross-cutting concerns

- **Error handling**
  - Use 400 for validation errors.
  - Use 401 when `getCurrentUser()` returns `null` (unauthenticated).
  - Use 403 if a user tries to access another user’s resource.
  - Use 404 when a requested resource is not found.

- **Search readiness**
  - Store note title/content in fields you will search (`title`, `content`).
  - Optionally add DB indexes later for common filters (e.g. `userId`, `notebookId`).

- **Helper utilities (optional)**
  - Add a `requireUser()` helper that wraps `getCurrentUser()` and throws/returns 401 on `null`.
  - Add a shared function to convert Zod errors into a consistent JSON shape for all APIs.

