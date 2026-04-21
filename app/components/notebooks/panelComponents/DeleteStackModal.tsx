interface DeleteStackModalProps {
    stackTitle?: string
    onConfirmDelete: () => void
    onCancel: () => void
}

export function DeleteStackModal({
    stackTitle,
    onConfirmDelete,
    onCancel
}: DeleteStackModalProps) {
    return (
        <>
            <h4 id="delete-stack-title">Are you sure you want to delete {stackTitle} ?</h4>
            <p>This will remove the stack grouping from any notebooks in it.</p>
            <div className="flex justify-between mt-4">
                <button
                className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-500/15 w-[110px]"
                onClick={onConfirmDelete}>
                    Delete
                </button>
                <button
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 w-[110px]"
                onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </>
    )
}
