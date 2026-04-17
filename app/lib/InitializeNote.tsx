
import type { Note } from "@/lib/types/api"

export const initializeNote = async(
    notebookId: string
) => {

    try{
        const res = await fetch('/api/notes', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({title: "", content: "", notebookId})
        })

        if(!res.ok){
            throw new Error('Error creating note')
        }

        const parsed: {data: Note} = await res.json()
        const newNote = parsed.data

        return newNote 
    } catch (e) {
        console.error(e)
    }
}