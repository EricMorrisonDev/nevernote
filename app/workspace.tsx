"use client"

import { NotebooksPanel } from "./components/notebooks/NotebooksPanel";
import { NotesPanel } from "./components/notes/NotesPanel";
import { Notebook, Note } from "@/lib/types/api";
import { useState } from "react";
import { LogoutButton } from "./components/auth/LogoutButton";
import { EditNotePanel } from "./components/notes/EditNotePanel";

export function Workspace() {

    const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
    const [notebooks, setNotebooks] = useState<Notebook[] | null>(null)
    const [notes, setNotes] = useState<Note[]>([])
    const [refetchNotebooksKey, setRefetchNotebooksKey] = useState(0)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalTitle, setModalTitle] = useState('')
    const [refetchNotes, setRefetchNotes] = useState({
        key: 0,
        reason: "notebook-change" as
          | "notebook-change"
          | "note-updated"
          | "note-created"
          | "note-deleted",
      })
    
    return( 
        <div className="flex min-w-screen p-4 bg-background h-screen overflow-hidden">
            <div className="h-full min-h-0 left-0 w-[15%] border-r border-border mr-4 p-4">
                <NotebooksPanel 
                    selectedNotebookId={selectedNotebookId}
                    setSelectedNotebookId={setSelectedNotebookId}
                    notebooks={notebooks}
                    setNotebooks={setNotebooks}
                    refetchNotebooksKey={refetchNotebooksKey}
                    setRefetchNotebooksKey={setRefetchNotebooksKey}
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    modalTitle={modalTitle}
                    setModalTitle={setModalTitle}
                />
            </div>
            <div className="h-full min-h-0 flex flex-col left-0 w-[28%] p-4">
                <NotesPanel 
                    selectedNotebookId={selectedNotebookId}
                    setSelectedNoteId={setSelectedNoteId}
                    selectedNoteId={selectedNoteId}
                    notebooks={notebooks}
                    refetchNotes={refetchNotes}
                    setRefetchNotes={setRefetchNotes}
                    notes={notes}
                    setNotes={setNotes}
                />
            </div>
            <div className="flex-1 min-h-0 h-full flex flex-col">
                <EditNotePanel 
                    selectedNoteId={selectedNoteId}
                    setSelectedNoteId={setSelectedNoteId}
                    selectedNotebookId={selectedNotebookId}
                    setRefetchNotes={setRefetchNotes}
                    notes={notes}
                />
            </div>
            <div
                className="fixed right-4 bottom-4">
                <LogoutButton />
            </div>
        </div>
        
    )
}