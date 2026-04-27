
export type SearchHit =
    | {
          kind: "stack"
          id: string
          title: string
          createdAt: string
      }
    | {
          kind: "notebook"
          id: string
          title: string
          stackId: string | null
          stackTitle: string | null
          createdAt: string
      }
    | {
          kind: "note"
          id: string
          title: string
          notebookId: string
          notebookTitle: string
          stackId: string | null
          stackTitle: string | null
          match: "title" | "content"
          createdAt: string
      }