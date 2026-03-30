"use client"

import { NotebooksPanel } from "./components/notebooks/Notebooks";
import { useState } from "react";

export function Workspace() {

    const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)

    return( 
        <div>
            <NotebooksPanel 
                selectedNotebookId={selectedNotebookId}
                onSelectNotebook={setSelectedNotebookId}
            />
        </div>
    )
}