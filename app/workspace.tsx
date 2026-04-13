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
    const [refetchKey, setRefetchKey] = useState(0)
    
    return( 
        <div className="flex min-w-screen p-4">
            <div className="min-h-screen left-0 width-[10%] border-r-2 border-white mr-4 p-4">
                <NotebooksPanel 
                    selectedNotebookId={selectedNotebookId}
                    setSelectedNotebookId={setSelectedNotebookId}
                    setSelectedNoteId={setSelectedNoteId}
                    notebooks={notebooks}
                    setNotebooks={setNotebooks}
                />
            </div>
            <div className="min-h-screen left-0 width-[10%] border-r-2 border-white mr-4 p-4">
                <NotesPanel 
                    selectedNotebookId={selectedNotebookId}
                    setSelectedNoteId={setSelectedNoteId}
                    notebooks={notebooks}
                    refetchKey={refetchKey}
                    notes={notes}
                    setNotes={setNotes}
                />
            </div>
            <div>
                <EditNotePanel 
                    selectedNoteId={selectedNoteId}
                    setSelectedNoteId={setSelectedNoteId}
                    selectedNotebookId={selectedNotebookId}
                    setRefetchKey={setRefetchKey}
                    notes={notes}
                    setNotes={setNotes}
                />
            </div>
            <div
                className="fixed right-4 top-4">
                <LogoutButton />
            </div>
        </div>
        
    )
}