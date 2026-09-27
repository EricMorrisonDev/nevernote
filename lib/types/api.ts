
export interface Notebook {
    id: string,
    title: string,
    userId: string,
    stackId?: string,
    createdAt: string,
    updatedAt: string
}

export interface Note {
    id: string,
    title: string,
    content: string,
    notebookId: string,
    userId: string,
    createdAt: string,
    updatedAt: string,
    customOrder: number
    deletedAt: string | null
}

export interface Stack {
    id: string,
    title: string,
    userId: string,
    createdAt: string,
    updatedAt: string
}