# Custom drag-and-drop note ordering (plan)

This document captures how to add **manual note reordering** in the notes panel: drag-and-drop UX, automatically switching sort mode to **`custom`**, and **persisting** that order. No implementation lives here—this is a roadmap.

---

## Goals

- User drags a note tile → list reorders immediately and feels natural.
- Sort mode automatically switches to **`custom`** (same idea as “manual” order).
- Custom order **persists** across reloads and sessions (database + API).

---

## Product / UX decisions (decide before coding)

### Source of truth

- **Persisted order** requires a stored field (or equivalent) on each note (or a separate ordering table). UI-only reordering resets on refresh.

### How `custom` interacts with other sort modes (`created`, `updated`, `alpha`, `size`)

- Add **`custom`** to the shared `SortMode` type.
- Typical rule: when the user **completes a drag**, set `sortMode` to **`custom`**.
- Optional: only enable dragging when already in `custom`, or allow drag from any mode and switch on drop (clearer for users who “just want to move one thing”).

### Grid vs list

- `NotesPanel` uses a **two-column grid**. Under the hood, order is still **one-dimensional** (usually **row-major**: left-to-right, then next row). If column count changes on resize, tiles reflow but order stays consistent.

### What makes DnD feel natural

- Prefer a **drag handle** (grip icon) so opening a note does not accidentally start a drag.
- Visual feedback: lifted tile, clear **drop indicator** / placeholder.
- **Auto-scroll** inside the scrollable notes container when dragging near top/bottom edges.
- For accessibility and polish, prefer a library that supports **keyboard reordering** and sensible ARIA patterns.

### Library vs hand-rolled

- **Custom pointer logic** gets fiddly (hit testing, scroll containers, touch, accessibility).
- **`@dnd-kit/core` + `@dnd-kit/sortable`** is a common React choice for sortable lists/grids.
- **`@hello-pangea/dnd`** is list-oriented; grids are more awkward.
- Native **HTML5 drag-and-drop** is usually weaker for custom visuals and consistency.

### Performance at scale

- Sorting may be cheap; **rendering many tiles** is often the bottleneck. If notebooks can be huge, plan for **virtualization** later (combines with DnD but adds complexity).
- For persistence, avoid updating **every** note’s order on every drag when possible (see “Ordering strategy” below).

---

## dnd-kit solution

**Recommended UI stack** for “tiles shift around while one card floats under the cursor.” Use **[dnd-kit](https://dndkit.com/)**; it is the default recommendation called out elsewhere in this doc.

### Packages to install

- **`@dnd-kit/core`** — `DndContext`, sensors, collision detection, drag lifecycle (`onDragStart`, `onDragEnd`, etc.).
- **`@dnd-kit/sortable`** — **`SortableContext`**, **`useSortable`**, **`arrayMove`** (or equivalent helpers) so order updates as the pointer crosses other items.
- **`@dnd-kit/utilities`** (optional but common) — small helpers used alongside examples in the official docs.

Install with your package manager, e.g. `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`. Confirm current package names and peer dependency notes on [dndkit.com](https://dndkit.com/) / npm before locking versions.

### How you get “dynamic” tile motion

1. **`DndContext`** wraps the scrollable notes area (or the whole panel). It owns drag state and coordinates sensors + collision detection.
2. **`SortableContext`** wraps the list of note ids in **visual order** (the same 1D order you use for a row-major grid). Each tile is a **`useSortable`** item keyed by stable **`id`** (note id).
3. While dragging, dnd-kit applies **`transform`** / **`transition`** styles to sortable items so siblings **slide into gaps** as the active index changes—this is the “tiles move around the dragging note” effect at the layout level.
4. **`DragOverlay`** renders a **copy** of the dragged card that follows the pointer (often via a React portal). The in-grid item can be dimmed, hidden, or shown as a placeholder so the grid does not jump visually.
5. On **`onDragEnd`**, read **`active`** and **`over`**, compute the new index, run **`arrayMove`** on your notes array, update React state, then run persistence + `setSortMode("custom")` as described in the checklist below.

### Sensors and interaction details

- Use **`PointerSensor`** (or **`MouseSensor` + `TouchSensor`**) with a small **activation distance** (e.g. 8px) so a simple click still opens a note; combine with a **drag handle** (`{ ...listeners }` only on the handle) for the best UX.
- **`KeyboardSensor`** can be added for accessibility if you follow dnd-kit’s sortable keyboard patterns.

### Grids (`NotesPanel` two-column layout)

- Sortable is **one-dimensional**: your `notes` array order maps to **row-major** grid positions (`display: grid; grid-template-columns: repeat(2, …)` is fine).
- Ensure each sortable root has a **stable `id`** and that the grid container does not break measuring (avoid transforms on the wrong ancestor if you see janky collisions; follow dnd-kit grid examples).
- If collision detection feels wrong in a tight grid, experiment with **`closestCenter`** vs **`rectIntersection`** (dnd-kit docs describe tradeoffs).

### Auto-scroll

- For a scrollable `<ul>`, use **`@dnd-kit/core`’s scroll support** (e.g. scrollable ancestor configuration / auto-scroll APIs as documented for your version) so dragging near the top or bottom of the list scrolls the container.

### Optional polish: Motion (Framer Motion)

- After sortable behavior works, you can wrap tiles with **[Motion](https://motion.dev/)** **`layout`** animations so reflows feel even smoother. dnd-kit owns drag geometry; Motion animates layout changes—combine carefully to avoid fighting transforms.

### Official references

- Main site: [https://dndkit.com/](https://dndkit.com/)
- Sortable preset concepts: sortable lists, `DragOverlay`, `arrayMove`, and examples live in the dnd-kit documentation (navigation may change; use the site’s “Sortable” / “Presets” sections when implementing).

### Implementation checklist (UI-only subset)

- [ ] Wrap notes list in **`DndContext`** + **`SortableContext`** (ids = note ids).
- [ ] Each note tile: **`useSortable({ id })`**, apply **`style={transform}`** / **`transition`** from the hook to the positioned element (per docs).
- [ ] **`DragOverlay`** with the active note’s preview while dragging.
- [ ] **`onDragEnd`**: `arrayMove` → `setNotes` → `setSortMode("custom")` → PATCH persistence (see main checklist).
- [ ] Drag handle + activation constraint to avoid accidental drags.

---



### Option A — Sparse numeric `customOrder` (recommended balance)

- Add something like **`customOrder: Float`** (or `Int`) on `Note`, scoped per notebook (same note belongs to one notebook).
- Index: e.g. `(notebookId, customOrder)` for efficient reads.
- When reading in custom mode: `ORDER BY customOrder ASC NULLS LAST` (treat unset as end or backfill on migration).
- On drop: assign the moved note a value **between** its new neighbors (e.g. existing orders 1000 and 2000 → pick 1500).
- Occasionally **rebalance** if gaps run out (rare batch update).

**Pros:** Simple mental model, usually **one row updated** per drag.  
**Cons:** Need rebalance logic eventually.

---

## Implementation checklist

### 1. Types

- Extend **`SortMode`** (e.g. in `app/lib/types.ts`) with **`"custom"`**.
- Extend **`Note`** (e.g. in `lib/types/api.ts`) with the new persistence field (`customOrder` or `customRank`) if the client needs it for display or optimistic updates.

### 2. Prisma schema + migration

- On **`Note`**, add the ordering field (`customOrder` or `customRank`).
- Add an **`@@index`** suitable for listing notes by notebook in custom order.
- Run a migration; consider a **one-time backfill** so existing notes get initial values (e.g. spaced by created time or sequential integers).

### 3. Read path — `GET /api/notes`

- Support a query such as **`sortMode=custom`** (or align naming with the client).
- When `custom`: return notes ordered by the new field.
- Other modes can stay server-ordered or client-sorted; pick one source of truth to avoid mismatch between large fetches and UI.

### 4. Write path — persist a drag

- Add an endpoint, for example:
  - **`PATCH /api/notes/:id/order`**, or
  - **`PATCH /api/notes/reorder`** with body `{ noteId, notebookId, beforeId?, afterId? }`.
- **Prefer `beforeId` / `afterId`** (or `prevId` / `nextId`) so the **server** computes the new `customOrder` / rank from neighbors—keeps ordering rules in one place.
- Validate: authenticated user owns the note; note belongs to the notebook; neighbor ids belong to the same notebook when provided.

### 5. UI — `NotesPanel` (and possibly a child component)

- Integrate **dnd-kit** as described in **[dnd-kit solution](#dnd-kit-solution)** above (`DndContext`, `SortableContext`, `useSortable`, `DragOverlay`, sensors). Use a **drag handle** on each card.
- On **drag end**:
  1. Reorder the in-memory `notes` array (optimistic update via `setNotes`).
  2. **`setSortMode("custom")`**.
  3. Call the **PATCH** endpoint to persist the moved note’s new position.
- Handle failure: revert order or refetch notes from the server.
- Optional: show a subtle loading / error state on failed persist.

### 6. Sort menu / `SortNotesButton`

- Add a menu item or label for **Custom order** if users should be able to return to saved manual order without dragging first—or rely entirely on “first drag switches to custom.”
- When switching **away** from `custom` to another mode, the UI simply applies that sort; the stored `customOrder` values can remain in the DB until the user drags again (no need to clear unless you want that semantics).

### 7. Refetch / reasons (optional)

- After a successful persist, you may **`setRefetchNotes`** so lists stay canonical, or skip if optimistic state is enough.
- If you add a **`RefetchReason`** like `"note-reordered"`, only add branching in `NotesPanel` if you need special selection behavior; otherwise bumping `key` may be enough.

---

## Incremental delivery order

1. **Schema + API read** — list notes in custom order when requested.
2. **PATCH reorder** — persist one move with neighbor-based ordering.
3. **DnD UI** — optimistic reorder + switch to `custom` + PATCH on drop.
4. **Polish** — auto-scroll, keyboard, error recovery, optional virtualization if needed.

---

## Files likely touched (reference)

| Area        | Examples |
|------------|----------|
| Types      | `app/lib/types.ts`, `lib/types/api.ts` |
| DB         | `prisma/schema.prisma`, new migration |
| API        | `app/api/notes/route.ts`, new `app/api/notes/[id]/...` or reorder route |
| UI         | `app/components/notes/NotesPanel.tsx`, `SortNotesButton.tsx`, possible new small component for sortable row/card |
| Workspace  | `app/workspace.tsx` if props/state for notes need threading |

---

## Related notes from earlier discussion

- **Do not mutate** the `notes` array from React state in place when computing sorted views; copy then sort (or derive a new array for display).
- **`useMemo`** for sorted lists is optional; it helps when many re-renders happen without `notes` / `sortMode` changing. **`useCallback`** is only needed if stable function identities matter for memoized children.

This file can be updated as implementation choices (e.g. exact field name, endpoint shape) are finalized.
