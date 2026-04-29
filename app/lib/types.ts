
export type RefetchReason =
    | "notebook-change"
    | "note-updated"
    | "note-created"
    | "note-deleted"
    | "searchHit-note-selected"

export type RefetchNotesState = {
    key: number
    reason: RefetchReason
    }