"use client"

import { NotebooksPanel } from "./components/notebooks/NotebooksPanel";
import { NotesPanel } from "./components/notes/NotesPanel";
import { Notebook, Note } from "@/lib/types/api";
import { useEffect, useState } from "react";
import { LogoutButton } from "./components/auth/LogoutButton";
import { EditNotePanel } from "./components/notes/EditNotePanel";
import { Modal } from "./components/Modal";
import { SearchHit } from "@/lib/types/search";
import { RefetchReason, RefetchNotesState } from "./lib/types"
import { useNoteHistory } from "@/lib/useNoteHistory"
import Image from "next/image";

export function Workspace() {

    const { recordVisit } = useNoteHistory()

    const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
    const [openStackId, setOpenStackId] = useState('')
    const [notebooks, setNotebooks] = useState<Notebook[] | null>(null)
    const [notes, setNotes] = useState<Note[]>([])
    const [refetchNotebooksKey, setRefetchNotebooksKey] = useState(0)
    const [modalOpen, setModalOpen] = useState(false)
    const [searchModalOpen, setSearchModalOpen] = useState(false)
    const [modalTitle, setModalTitle] = useState('')
    const [searchResults, setSearchResults] = useState<SearchHit[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [draft, setDraft] = useState('')
    const [refetchNotes, setRefetchNotes] = useState<RefetchNotesState>({
        key: 0,
        reason: "notebook-change"
      })

    const onSelectNotebook = (notebookId: string) => {
        setSelectedNotebookId(notebookId)
        setSelectedNoteId(null)
        bumpRefetchNotes()
    }

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

    const setSearchModalOpenWithReset: React.Dispatch<React.SetStateAction<boolean>> = (
        next
      ) => {
        setSearchModalOpen((prev) => {
          const nextOpen = typeof next === "function" ? next(prev) : next
          if (!nextOpen) {
            setSearchQuery("")
            setSearchResults([])
          }
          return nextOpen
        })
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

    const bumpRefetchNotes = (reason: RefetchReason = "notebook-change") => {
        setRefetchNotes((prev) => ({ key: prev.key + 1, reason }) )
    }

    const handleSearchNavigation = (searchHit: SearchHit) => {
        const kind = searchHit.kind

        switch(kind) {
            case "stack":
                setOpenStackId(searchHit.id)
                break

            case "notebook":
                if(searchHit.kind === "notebook" && searchHit.stackId){
                    setOpenStackId(searchHit.stackId)
                }
                setSelectedNotebookId(searchHit.id)
                break

            case "note":
                if(searchHit.kind === "note" && searchHit.stackId && searchHit.notebookId){
                    setOpenStackId(searchHit.stackId)
                    setSelectedNotebookId(searchHit.notebookId)
                } else if(searchHit.kind === "note" && searchHit.notebookId) {
                    setSelectedNotebookId(searchHit.notebookId)
                }
                bumpRefetchNotes("searchHit-note-selected")
                setSelectedNoteId(searchHit.id)
                break
        }
    }
    
    return( 
        <div className="flex min-w-screen p-4 bg-background h-screen overflow-hidden">
            <div className="h-full min-h-0 left-0 w-[15%] border-r border-border mr-4 p-4">
                <button 
                    className="mb-4 mx-auto w-full flex justify-between rounded-lg border border-border px-3 py-2 text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/50"
                    aria-labelledby="search-button"
                    onClick={() => {
                        setSearchModalOpen(true)
                    }}
                    >
                    <Image
                        src="noun-search-icon-8300588-f5f0f0.svg"
                        alt="search-icon"
                        width={20}
                        height={20}
    
                    />
                    <div>

                    </div>
                </button>
                <NotebooksPanel 
                    selectedNotebookId={selectedNotebookId}
                    setSelectedNotebookId={setSelectedNotebookId}
                    setSelectedNoteId={setSelectedNoteId}
                    openStackId={openStackId}
                    setOpenStackId={setOpenStackId}
                    notebooks={notebooks}
                    setNotebooks={setNotebooks}
                    refetchNotebooksKey={refetchNotebooksKey}
                    setRefetchNotebooksKey={setRefetchNotebooksKey}
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    modalTitle={modalTitle}
                    setModalTitle={setModalTitle}
                    onSelectNotebook={onSelectNotebook}
                    recordVisit={recordVisit}
                />
            </div>
            <div className="h-full min-h-0 flex flex-col left-0 w-[28%] p-4">
                <NotesPanel 
                    selectedNotebookId={selectedNotebookId}
                    setSelectedNoteId={setSelectedNoteId}
                    selectedNoteId={selectedNoteId}
                    openStackId={openStackId}
                    recordVisit={recordVisit}
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
                    modalOpen={searchModalOpen}
                    setModalOpen={setSearchModalOpenWithReset}
                    title={modalTitle}
                >
                    <div className="flex flex-col min-h-[400px]">
                        <input 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                            }}
                            placeholder="enter search query"
                            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-focus-ring/50"
                        />
                        <ul className="flex flex-col gap-4 mt-4 pl-2">
                            {searchResults.filter((r) => r.kind === 'stack')
                            .map((s) => (
                                <li key={s.id}
                                >
                                    
                                    <button
                                    onClick={() => {
                                        setSearchModalOpenWithReset(false)
                                        handleSearchNavigation(s)
                                    }}
                                    className="flex gap-2 rounded-md px-2 py-1 transition-colors hover:bg-surface-2/60"
                                    >
                                        <Image src={'/noun-books-3239771-f5f0f0.svg'} 
                                            alt="Notebook icon"
                                            width={20}
                                            height={20}
                                            className="shrink-0 mr-1"
                                            />
                                        {s.title}
                                    </button>
                                </li>
                            ))}
                            {searchResults.filter((r) => r.kind === 'notebook')
                            .map((nb) => (
                                <li key={nb.id}>
                                    <button
                                    onClick={() => {
                                        setSearchModalOpenWithReset(false)
                                        handleSearchNavigation(nb)
                                    }}
                                    className="flex gap-2 rounded-md px-2 py-1 transition-colors hover:bg-surface-2/60"
                                    >
                                    <Image src={'/noun-notebook-8289864-f5f0f0.svg'} 
                                            alt="Notebook icon"
                                            width={20}
                                            height={20}
                                            className="shrink-0 mr-1"
                                            />
                                        {nb.title}
                                        {nb.stackTitle && (
                                            <div className="flex gap-2 ml-4">
                                            <p>{'>'}</p>
                                            <Image src={'/noun-gray-books-3239771-8c8a8a.svg'} 
                                                alt="Notebook icon"
                                                width={20}
                                                height={20}
                                                className="shrink-0"
                                                />
                                            <p className="text-[#8A8A8A]">{nb.stackTitle}</p>

                                            </div>
                                        )}
                                    </button>
                                </li>
                            ))}
                            {searchResults.filter((r) => r.kind === 'note')
                            .map((n) => (
                                <li key={n.id}
                                >
                                    <button
                                    onClick={() => {
                                        setSearchModalOpenWithReset(false)
                                        handleSearchNavigation(n)
                                    }}
                                    className="flex rounded-md px-2 py-1 transition-colors hover:bg-surface-2/60"
                                    >
                                    {n.title}
                                    {n.stackTitle && (
                                        <div className="flex gap-2 ml-4">
                                        <Image src={'/noun-gray-books-3239771-8c8a8a.svg'} 
                                            alt="Notebook icon"
                                            width={20}
                                            height={20}
                                            className="shrink-0"
                                            />
                                        <p className="text-[#8A8A8A]">{n.stackTitle}</p>
                                        <p className="text-[#8A8A8A]">{'>'}</p>
                                        </div>
                                    )}
                                    <div className="flex gap-2 ml-4">
                                    <Image src={'/noun-notebook-gray-8289864-8c8a8a.svg'} 
                                        alt="Notebook icon"
                                        width={20}
                                        height={20}
                                        className="shrink-0"
                                        />
                                    <p className="text-[#8A8A8A]">{n.notebookTitle}</p>
                                    </div>
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