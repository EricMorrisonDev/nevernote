# Build Process: Personal Evernote Clone

## 1. Foundation

- **Repo & tooling:** Initialize the repo (e.g. monorepo or separate frontend/backend), set up Git, add a README.
- **Database:** Define the schema (users, notebooks, notes) and set up PostgreSQL locally (Docker or native).
- **Prisma:** Add Prisma, point it at Postgres, create initial schema and migrations.
- **API surface:** Decide how Next.js and Express fit together (e.g. Next.js API routes vs separate Express app, or Next.js only for API).

---

## 2. Authentication

- **Auth strategy:** Choose an approach (e.g. sessions + cookies, or JWT).
- **User model:** Add a `User` (or equivalent) in Prisma; add sign-up/sign-in endpoints and protect them with Zod validation.
- **Frontend auth:** Login/signup pages and a way to store/send the auth token or session (e.g. httpOnly cookie or token in memory/localStorage).
- **Guarding routes:** Ensure note/notebook APIs and pages require a logged-in user.

---

## 3. Notebooks

- **Backend:** Notebook CRUD APIs (create, read, update, delete) tied to the authenticated user; validate with Zod.
- **Frontend:** List notebooks, create/edit/delete a notebook, and navigate into a notebook to see its notes.

---

## 4. Notes (CRUD + Markdown)

- **Backend:** Note model linked to User and Notebook; CRUD APIs with Zod validation; store note body as markdown (text).
- **Frontend:** List notes in a notebook, create/edit/delete a note; use a markdown editor and a markdown renderer for viewing.

---

## 5. Search

- **Backend:** Search endpoint that filters notes by text (title/body) for the current user (and optionally by notebook). Start with simple `ILIKE`/`contains` in Postgres; optimize later (e.g. full-text search) if needed.
- **Frontend:** Search UI (e.g. global search bar) that calls the API and shows results (links to notes/notebooks).

---

## 6. Sync across devices

- **Strategy:** “Sync” can mean: (a) same data in one Postgres DB accessed from multiple devices (browser/phone), or (b) offline support and conflict resolution.
- **Simple path:** One backend + one DB; all devices use the same API. No extra sync layer—just login from each device.
- **Richer path (optional):** Add “last modified” (and maybe “version”) to notes, then build conflict handling (e.g. last-write-wins or manual merge) and optional offline support later.

---

## 7. Polish & deploy (optional)

- **UI/UX:** Use Tailwind consistently; improve layout (sidebar, note list, editor).
- **Deploy:** Pick a host (e.g. Vercel for Next.js + hosted Postgres, or a VPS with Node + Postgres); set env vars, run migrations, point a domain if you want.

---

**Suggested order:** Foundation → Auth → Notebooks → Notes → Search → Sync strategy → Polish. That way you always have a working app (auth → notebooks → notes) before adding search and sync.
