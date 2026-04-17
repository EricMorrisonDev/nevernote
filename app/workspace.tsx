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
    const [refetchNotesKey, setRefetchNotesKey] = useState(0)
    const [refetchNotebooksKey, setRefetchNotebooksKey] = useState(0)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalTitle, setModalTitle] = useState('')
    
    return( 
        <div className="flex min-w-screen p-4 bg-gray-900 h-screen overflow-hidden">
            <div className="h-full min-h-0 left-0 w-[15%] border-r-1 border-white mr-4 p-4">
                <NotebooksPanel 
                    selectedNotebookId={selectedNotebookId}
                    setSelectedNotebookId={setSelectedNotebookId}
                    setSelectedNoteId={setSelectedNoteId}
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
                    setRefetchNotesKey={setRefetchNotesKey}
                    refetchNotesKey={refetchNotesKey}
                    notes={notes}
                    setNotes={setNotes}
                    modalTitle={modalTitle}
                    setModalTitle={setModalTitle}
                />
            </div>
            <div>
                <EditNotePanel 
                    selectedNoteId={selectedNoteId}
                    setSelectedNoteId={setSelectedNoteId}
                    selectedNotebookId={selectedNotebookId}
                    setRefetchNotesKey={setRefetchNotesKey}
                    notes={notes}
                    setNotes={setNotes}
                    modalTitle={modalTitle}
                    setModalTitle={setModalTitle}
                />
            </div>
            <div
                className="fixed right-4 top-4">
                <LogoutButton />
            </div>
        </div>
        
    )
}