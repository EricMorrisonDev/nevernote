
export type RefetchReason =
    | "notebook-change"
    | "note-updated"
    | "note-created"
    | "note-deleted"

export type RefetchNotesState = {
    key: number
    reason: RefetchReason
    }