"use client"

import { NotebooksPanel } from "./components/notebooks/NotebooksPanel";
import { useState } from "react";
import { LogoutButton } from "./components/auth/LogoutButton";

export function Workspace() {

    const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)

    return( 
        <div>
            <NotebooksPanel 
                selectedNotebookId={selectedNotebookId}
                onSelectNotebook={setSelectedNotebookId}
            />
            <div>
                <LogoutButton />
            </div>
        </div>
        
    )
}