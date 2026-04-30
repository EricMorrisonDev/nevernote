"use client"

import { SetStateAction, useState, Dispatch, useEffect, useRef } from "react"
import { Note } from "@/lib/types/api"
import { RichTextEditor } from "./RichTextEditor"
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
    const lastSavedRef = useRef<string>("")
    const lastHydratedNoteIdRef = useRef<string>("")
    
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
            setRefetchNotes(prev => ({ key: prev.key + 1, reason: "note-updated"}))

            return true

        } catch(err) {
            console.error(err)
            return false
        } finally {
            setLoading(false)
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

    // this is the use effect that will load the note content into the editor
    useEffect(() => {
        if(!selectedNoteId) return 

        const note = notes.find(note => note.id === selectedNoteId)
        if(!note){
            setMessage('Note not found')
            return
        }

        if(selectedNoteId === lastHydratedNoteIdRef.current) return
        setTitle('')
        setContent('')
        setTitle(note.title)
        setContent(note.content)

        lastHydratedNoteIdRef.current = selectedNoteId
    }, [selectedNoteId, notes])

    // this sets a timer that will clear the message element after a few seconds
    useEffect(() => {
        if(!message) return
        const timer = window.setTimeout(() => setMessage(''), 5000)
        return () => window.clearTimeout(timer)
    }, [message])

    useEffect(() => {
        if(!selectedNoteId) return

        const snapshot = JSON.stringify({ title, content, selectedNoteId })
        if(snapshot === lastSavedRef.current) return 
        
        const timer = window.setTimeout(() => {
            const success = handleEditNote(title, content, selectedNotebookId, selectedNoteId)
            if(!success) return
            lastSavedRef.current = snapshot
            }
        , 800)
        
        return () => window.clearTimeout(timer)

    }, [title, content, selectedNoteId, selectedNotebookId])

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
                    placeholder="title"
                />
                <div className="flex-1 min-h-0">
                    <RichTextEditor
                        value={content}
                        onChange={(nextValue) => {
                            setContent(nextValue)
                        }}
                        
                    />
                </div>
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
            </form>)}
        </div>
    )
}