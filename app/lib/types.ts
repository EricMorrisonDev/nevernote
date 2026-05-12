export type SortMode = "created" | "updated" | "alpha" | "size" | "custom"

export type RefetchReason =
    | "notebook-change"
    | "note-updated"
    | "note-created"
    | "note-deleted"
    | "searchHit-note-selected"
    | "history-apply"

export type RefetchNotesState = {
    key: number
    reason: RefetchReason
    }