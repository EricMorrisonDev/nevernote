"use client"

import { SetStateAction, useState, Dispatch, useEffect } from "react"
import { Note } from "@/lib/types/api"
import type { RefetchNotesState } from "@/app/lib/types"


interface EditNotePanelProps {
    selectedNoteId: string | null,
    setSelectedNoteId: Dispatch<SetStateAction<string | null>>
    selectedNotebookId: string | null,
    setRefetchNotes: Dispatch<SetStateAction<RefetchNotesState>>
    notes: Note[] | []
}



export function EditNotePanel ({
    selectedNoteId,
    selectedNotebookId,
    setRefetchNotes,
    notes,
    setSelectedNoteId,
}: EditNotePanelProps) {

    const[title, setTitle] = useState('')
    const[content, setContent] = useState('')
    const[message, setMessage] = useState('')
    const[loading, setLoading] = useState(false)

    
    const handleEditNote = async(
        title: string, 
        content: string, 
        selectedNotebookId: string | null,
        selectedNoteId: string | null
    ) => {

        try{
            setLoading(true)
            setMessage('')

                const res = await fetch(`api/notes/${selectedNoteId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ title, content, notebookId: selectedNotebookId })
                })

            if(!res.ok){
                throw new Error('Error updating note')
            }

            void (await res.json())

           
            
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false)
            setRefetchNotes(prev => ({ key: prev.key + 1, reason: "note-updated"}))
        }

    }

    const handleDeleteNote = async (id: string) => {

        try{
            const noteTitle = title
            setLoading(true)
            setTitle('')
            setContent('')
            const res = await fetch(`/api/notes/${id}`, {
                method: "DELETE"
            })

            if(!res.ok){
                throw new Error('Error deleting note')
            }

            setMessage(`${noteTitle} deleted`)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setSelectedNoteId(null)
            setRefetchNotes(prev => ({ key: prev.key + 1, reason: "note-deleted"}))
        }
    }

    useEffect(() => {
        setTitle('')
        setContent('')
        if(!selectedNoteId) return 

        const note = notes.find(note => note.id === selectedNoteId)
        if(!note){
            setMessage('Note not found')
            return
        }
        setTitle(note.title)
        setContent(note.content)
    }, [selectedNoteId, notes])

    useEffect(() => {
        if(!message) return
        const timer = window.setTimeout(() => setMessage(''), 5000)
        return () => window.clearTimeout(timer)
    }, [message])

    return(

        <div className="h-full min-h-0 flex flex-col p-8 rounded-2xl border border-border bg-surface">
            {selectedNoteId && (<form
                className="h-full min-h-0 flex flex-col"
                onSubmit={(e) => {
                    e.preventDefault()
                    handleEditNote(title, content, selectedNotebookId, selectedNoteId )
                }}
                
                >
                <input
                className="text-[3rem] rounded-xl bg-transparent p-1 m-2 outline-none placeholder:text-muted"
                    id="title-input"
                    type="text"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value)
                    }}
                    onBlur={() => {
                        if(!selectedNoteId || loading) return
                        // update this later to only save if an actual change was made.
                        // right now it will always save whenever a user clicks away.
                        handleEditNote(title, content, selectedNotebookId, selectedNoteId )
                    }}
                    placeholder="title"
                />
                <textarea
                    id="content-input"
                    className="border border-border bg-background rounded-xl p-4 m-2 flex-1 min-h-0 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring/40"
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value)
                    }}
                    onBlur={() => {
                        if(!selectedNoteId || loading) return
                        // update this later to only save if an actual change was made.
                        // right now it will always save whenever a user clicks away.
                        handleEditNote(title, content, selectedNotebookId, selectedNoteId )
                    }}
                    >
                    Type your note here
                </textarea>
                <div className="flex justify-end w-full">
                    {selectedNoteId && (<button
                        className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted hover:border-accent hover:text-accent w-[120px] mt-4"
                        onClick={() => {
                            if(!selectedNoteId) return
                            handleDeleteNote(selectedNoteId)
                        }}
                    >
                        Delete Note
                    </button>)}
                </div>
                {/* {message.length > 0 && (
                    <p className="px-2 text-sm text-muted">
                        {message}
                    </p>
                )} */}
            </form>)}
        </div>
    )
}