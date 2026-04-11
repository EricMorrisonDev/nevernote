"use client"

import { NotebooksPanel } from "./components/notebooks/NotebooksPanel";
import { NotesPanel } from "./components/notes/NotesPanel";
import { useState } from "react";
import { LogoutButton } from "./components/auth/LogoutButton";
import { EditNotePanel } from "./components/notes/EditNotePanel";

export function Workspace() {

    const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
    const [refetchKey, setRefetchKey] = 0
    
    return( 
        <div className="flex min-w-screen p-4">
            <div className="min-h-screen left-0 width-[10%] border-r-2 border-white mr-4 p-4">
                <NotebooksPanel 
                    selectedNotebookId={selectedNotebookId}
                    onSelectNotebook={setSelectedNotebookId}
                />
            </div>
            <div>
                <NotesPanel 
                    selectedNotebookId={selectedNotebookId}
                    selectedNoteId={selectedNoteId}
                    onSelectNote={setSelectedNoteId}
                    refetchKey={refetchKey}
                />
            </div>
            <div>
                <EditNotePanel 
                    selectedNoteId={selectedNoteId}
                    selectedNotebookId={selectedNotebookId}
                    setRefetchKey={setRefetchKey}
                />
            </div>
            <div>
                <LogoutButton />
            </div>
        </div>
        
    )
}