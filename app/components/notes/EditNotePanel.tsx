"use client"

import { SetStateAction, useState, Dispatch } from "react"
import { Note } from "@/lib/types/api"

interface EditNotePanelProps {
    selectedNoteId: string | null,
    selectedNotebookId: string
    setRefetchKey: Dispatch<SetStateAction<number>>
}



export function EditNotePanel ({
    selectedNoteId,
    selectedNotebookId,
    setRefetchKey
}: EditNotePanelProps) {

    const[title, setTitle] = useState('')
    const[content, setContent] = useState('')
    const[error, setError] = useState(false)
    const[message, setMessage] = useState('')
    const[loading, setLoading] = useState(false)
    const[note, setNote] = useState<Note | null>(null)

    const fetchNote = async (id: string) => {

        try{

            const res = await fetch(`/api/notes/${id}`)
            if(!res.ok) throw new Error('Error fetching note')

            const parsed = await res.json()
            setNote(parsed.data)

        } catch (e) {
            console.error(e)
            setError(true)
            setMessage('Error fetching note')
        }
    }

    const handleCreateNote = async(
        title: string, 
        content: string, 
        selectedNotebookId: string
    ) => {
        if(title.length === 0 || content.length === 0) return

        try{
            setLoading(true)
            setError(false)
            setMessage('')

            const res = await fetch('/api/notes', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, content, notebookId: selectedNotebookId })
            })

            if(!res.ok){
                throw new Error('Error creating note')
            }

            const parsed = await res.json()

            setMessage(`Note ${parsed.data.title} created!`)
            
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false)
            setTitle('')
            setContent('')
            setRefetchKey(prev => prev + 1)
        }

    }

    return(

        <div>
            <form>
                <textarea></textarea>
                <button>

                </button>
            </form>
        </div>
    )
}