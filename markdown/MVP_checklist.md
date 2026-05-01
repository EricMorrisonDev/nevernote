# Nevernote MVP Ship Checklist

Use this as a pass/fail list before calling the app MVP-complete.

## Core Functional Flows

- [ ] **Create note:** create a note in a selected notebook and confirm it appears in the notes grid.
- [ ] **Edit note title/content:** changes persist after debounce save and browser refresh.
- [ ] **Delete note:** deleted note is removed from UI and cannot be loaded again.
- [ ] **Create notebook/stack:** new items appear in sidebar correctly.
- [ ] **Move/remove notebook from stack:** sidebar reflects updated structure immediately.

## Selection and Navigation

- [ ] **Notebook click:** first note auto-selects when notebook is opened.
- [ ] **Note click:** selected note highlight, title, and editor content stay in sync.
- [ ] **Search -> notebook hit:** correct stack/notebook opens.
- [ ] **Search -> note hit:** notebook opens and targeted note remains selected.
- [ ] **After save/refetch:** editor cursor/selection does not jump unexpectedly.

## Rich Text Editor (Quill)

- [ ] **Toolbar visibility:** icons/buttons are readable in dark theme.
- [ ] **Formatting actions:** bold/italic/underline/list/link apply and persist.
- [ ] **Editor layout:** editor fills panel height and scrolls internally for long notes.
- [ ] **Empty content normalization:** empty editor does not save noisy placeholder HTML.
- [ ] **Hydration on first load:** opening first note after refresh hydrates content reliably.

## Notes List and Preview

- [ ] **Preview text:** rich text content shows plain-text previews (no raw HTML tags).
- [ ] **Updated timestamp:** timestamp renders correctly after edits.
- [ ] **Selection style:** selected note tile remains visually distinct.

## Error Handling and UX

- [ ] **Save failure behavior:** failed save does not silently overwrite data.
- [ ] **Load failure behavior:** user gets visible feedback if note load fails.
- [ ] **Delete failure behavior:** failures are handled gracefully and do not desync UI.
- [ ] **No accidental destructive actions:** verify delete is intentional and clear.

## Performance and Stability

- [ ] **Typing performance:** no lag/stutter in editor on long notes.
- [ ] **Debounce behavior:** saves are not firing excessively during normal typing.
- [ ] **No race-condition overwrites:** fast note switching does not blank content.
- [ ] **No infinite refetch loops:** update/refetch cycle remains stable.

## Accessibility and Usability

- [ ] **Keyboard basics:** can tab through sidebar, notes list, editor controls.
- [ ] **Contrast/readability:** primary UI text and controls are legible in dark mode.
- [ ] **Focus behavior:** modals and editor focus behave predictably.

## Release Hygiene

- [ ] **Lint clean enough for MVP:** no new critical lint/type errors.
- [ ] **Manual smoke pass:** run full flow: login -> notebook -> note create/edit/search/delete -> logout.
- [ ] **Production build check:** app builds successfully for production.
- [ ] **Known limitations documented:** note any accepted MVP constraints in project docs.

## Optional Nice-to-Haves (Post-MVP)

- [ ] Save status indicator (`Saving...` / `Saved`)
- [ ] Retry/backoff for failed autosaves
- [ ] Undo/redo controls surfaced clearly
- [ ] Better empty-state UX for notebooks/notes
