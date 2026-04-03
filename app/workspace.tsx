"use client"

import { NotebooksPanel } from "./components/notebooks/NotebooksPanel";
import { NotesPanel } from "./components/notes/NotesPanel";
import { useState } from "react";
import { LogoutButton } from "./components/auth/LogoutButton";

export function Workspace() {

    const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
    

    return( 
        <div className="flex min-w-screen p-8">
            <div className="min-h-screen left-0 width-[10%]">
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
                />
            </div>
            <div>
                <LogoutButton />
            </div>
        </div>
        
    )
}