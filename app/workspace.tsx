"use client"

import { NotebooksPanel } from "./components/notebooks/NotebooksPanel";
import { useState } from "react";
import { LogoutButton } from "./components/auth/LogoutButton";

export function Workspace() {

    const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)

    return( 
        <div>
            <div className="min-h-screen left-0 width-[10%]">
                <NotebooksPanel 
                    selectedNotebookId={selectedNotebookId}
                    onSelectNotebook={setSelectedNotebookId}
                />
            </div>
            <div>
                <LogoutButton />
            </div>
        </div>
        
    )
}