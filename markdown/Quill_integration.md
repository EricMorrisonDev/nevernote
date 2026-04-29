# Quill Integration Plan

## 1) Install Dependencies

- Add `quill` (and optionally `react-quill` if using the React wrapper).
- Keep editor rendering client-only in Next.js.

## 2) Choose Content Storage Format First

Pick one canonical format before wiring UI:

- **HTML**: easiest to implement quickly.
- **Delta JSON**: better long-term fidelity for rich text behavior.

Use one format consistently in DB, API responses, and frontend state.

## 3) Create a Client-Only Editor Component

- Add a component like `RichTextEditor` under `app/components/notes/`.
- Import Quill theme CSS (`quill.snow.css` or custom theme).
- Use dynamic import with SSR disabled for the editor in Next.js.

## 4) Integrate with `EditNotePanel`

- Replace the plain content input area with Quill.
- Initialize editor value from the selected note’s stored content.
- Keep local draft state for editor changes.
- Save on explicit action (or autosave later, if desired).

## 5) Update Save and Fetch Flow

- On save, send content in the chosen canonical format.
- Ensure existing `refetchNotes` behavior still works with editor changes.
- Preserve current note selection semantics during notebook/search navigation.

## 6) Handle Note Preview Rendering

- `NotesPanel` previews should show plain text excerpts.
- If storing HTML/Delta, normalize to plain preview text for cards.

## 7) Start with a Minimal Toolbar

Recommended initial tools:

- bold, italic, underline
- ordered/bullet lists
- link
- heading levels

Expand only after baseline UX is stable.

## 8) Handle Common Edge Cases

- Normalize Quill empty value (e.g. `<p><br></p>`) to empty content when needed.
- Reinitialize editor draft correctly when `selectedNoteId` changes.
- Avoid cross-note draft leakage when switching quickly.

## 9) Styling and Layout

- Ensure editor fits panel layout (`h-full`, scrolling editor body).
- Optionally keep toolbar sticky in long notes.

## 10) Test Plan

- Create note -> edit rich text -> save -> verify persistence.
- Switch notes and return -> verify content consistency.
- Navigate from search results -> verify notebook opens and correct note remains selected.
- Refresh app -> verify content round-trip from DB/API/editor.

## Suggested Phase 1 Scope

To reduce risk, implement in this order:

1. HTML storage path
2. Basic toolbar
3. Manual save flow
4. Preview plain-text extraction
5. Navigation/selection regression checks

Add autosave and advanced formatting in later phases.
