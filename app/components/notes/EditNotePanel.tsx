

interface EdidNotePanelProps {
    selectedNoteId: string
}

export function EditNotePanel ({
    selectedNoteId
}: EdidNotePanelProps) {

    const fetchNote = async (selectedNotebookId: string) => {


        try{
            const params = new URLSearchParams({ noteId: selectedNoteId })
            const res = await fetch('/api/notes')
        }
    }

    return(

        <div>
            <form>
                <textarea></textarea>
            </form>
        </div>
    )
}