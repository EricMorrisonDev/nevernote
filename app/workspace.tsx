"use client"

import { NotebooksPanel } from "./components/notebooks/NotebooksPanel";
import { NotesPanel } from "./components/notes/NotesPanel";
import { Notebook, Note } from "@/lib/types/api";
import { useEffect, useState } from "react";
import { LogoutButton } from "./components/auth/LogoutButton";
import { EditNotePanel } from "./components/notes/EditNotePanel";
import { Modal } from "./components/Modal";
import { SearchHit } from "@/lib/types/search";

export function Workspace() {

    const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
    const [notebooks, setNotebooks] = useState<Notebook[] | null>(null)
    const [notes, setNotes] = useState<Note[]>([])
    const [refetchNotebooksKey, setRefetchNotebooksKey] = useState(0)
    const [modalOpen, setModalOpen] = useState(false)
    const [searchModalOpen, setSearchModalOpen] = useState(false)
    const [modalTitle, setModalTitle] = useState('')
    const [searchResults, setSearchResults] = useState<SearchHit[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchLoading, setSearchLoading] = useState(false)

    const [refetchNotes, setRefetchNotes] = useState({
        key: 0,
        reason: "notebook-change" as
          | "notebook-change"
          | "note-updated"
          | "note-created"
          | "note-deleted",
      })

    const handleSearch = async(query: string) => {

        const term = query.trim()
        if(term.length < 3) return

        try{
            const params = new URLSearchParams({ q: term })
            const res = await fetch(`/api/search?${params.toString()}`)
            if(!res.ok){
                throw new Error('Search error occurred')
            }

            const results = await res.json()
            setSearchResults(results.data)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        const term = searchQuery.trim()

        if(term.length < 3){
            setSearchResults([])
            return
        }

        const timer = setTimeout(() => {
            void handleSearch(term)
        }, 300)

        return () => clearTimeout(timer)

    }, [searchQuery])
    
    return( 
        <div className="flex min-w-screen p-4 bg-background h-screen overflow-hidden">
            <div className="h-full min-h-0 left-0 w-[15%] border-r border-border mr-4 p-4">
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
                className="fixed right-8 top-8">
                <LogoutButton />
            </div>
            <div>
                <Modal
                    modalOpen={modalOpen}
                    setModalOpen={setSearchModalOpen}
                    title={modalTitle}
                >
                    <div>
                        <input 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                            }}
                        />
                        <ul>
                            {searchResults.filter((r) => r.kind === 'stack')
                            .map((s) => (
                                <li key={s.id}>
                                    <button>
                                        {s.title}
                                    </button>
                                </li>
                            ))}
                            {searchResults.filter((r) => r.kind === 'notebook')
                            .map((nb) => (
                                <li key={nb.id}>
                                    <button>
                                        {nb.title}
                                    </button>
                                </li>
                            ))}
                            {searchResults.filter((r) => r.kind === 'note')
                            .map((n) => (
                                <li key={n.id}>
                                    <button>
                                        {n.title}
                                    </button>
                                </li>
                            ))}
                            
                            
                        </ul>
                    </div>
                </Modal>
            </div>
        </div>
        
    )
}