# Notebooks UI Todo

Goal: Build the first notebook-focused UI slice that uses existing notebook APIs and is ready to hook into notes UI.

## Scope

- Build notebooks frontend only (list/create/edit/delete + select notebook).
- Keep stacks integration simple (optional stack filter + optional stack assignment when creating/updating a notebook).
- Do not start notes editor/search in this step.

## Todo

- [ ] **Define Notebook UI state contract**
  - Decide where selected notebook lives (page-level state vs notebooks panel state).
  - Define minimal client types for API responses (`Notebook`, `ApiError`).

- [ ] **Create notebooks panel component**
  - Add a client component (e.g. `app/components/notebooks/NotebooksPanel.tsx`).
  - Include loading, error, and empty states.

- [ ] **Implement list notebooks action (GET `/api/notebooks`)**
  - Fetch all notebooks for current user.
  - Render notebook list with title and basic actions (edit/delete/select).
  - Add a manual refresh button for demo clarity.

- [ ] **Implement optional stack filter on notebooks list**
  - Add optional `stackId` input/select.
  - Call GET `/api/notebooks?stackId=...` when filter is set.
  - Show validation/ownership errors from API clearly.

- [ ] **Implement create notebook form (POST `/api/notebooks`)**
  - Add title input + optional stackId input/select.
  - Submit to API and show success/error messages.
  - After success: clear form + re-fetch notebooks list.

- [ ] **Implement update notebook action (PUT `/api/notebooks/[id]`)**
  - Add inline edit mode or modal for title (+ optional stack reassignment).
  - Handle API validation errors and preserve user input on failure.
  - Re-fetch list on success.

- [ ] **Implement delete notebook action (DELETE `/api/notebooks/[id]`)**
  - Add delete button with confirmation prompt.
  - On success, remove from UI or re-fetch list.
  - If deleted notebook was selected, clear selected notebook state.

- [ ] **Connect selected notebook to page-level UI**
  - Show currently selected notebook in page header or side panel.
  - Add placeholder section: "Notes for selected notebook" (notes UI comes next).

- [ ] **Add auth-aware UX handling**
  - For 401 responses, show clear "Please log in" message in notebooks panel.
  - Keep component stable when auth state changes (no crashes on null data).

- [ ] **Polish + consistency pass**
  - Standardize API response handling (`data`, `error`, status checks).
  - Keep button/inputs styling consistent with existing auth/stacks components.

## Done Criteria

- User can list, create, update, and delete notebooks from the UI.
- Optional stack filtering and stack assignment work with existing API constraints.
- Selected notebook is tracked in UI and ready for notes CRUD integration.
- Error/loading/empty states are visible and understandable during demo.
