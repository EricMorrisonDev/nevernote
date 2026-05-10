import { Dispatch, SetStateAction, useEffect, useRef } from "react"

interface SortNotesButtonProps {
    sortMenuOpen: boolean,
    setSortMenuOpen: Dispatch<SetStateAction<boolean>>
}

export function SortNotesButton({
    sortMenuOpen,
    setSortMenuOpen
} : SortNotesButtonProps) {

    const rootRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!sortMenuOpen) return

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null
            if (rootRef.current && target && !rootRef.current.contains(target)) {
                setSortMenuOpen(false)
            }
        }

        document.addEventListener("pointerdown", handlePointerDown)
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown)
        }
    }, [sortMenuOpen, setSortMenuOpen])

    return(

        <div ref={rootRef} className="relative inline-block">
            <button
            type="button"
            className="rounded-lg border border-control-border bg-control-surface px-3 py-2 text-sm font-medium text-control hover:bg-control-surface-hover"
            onClick={() => {
                setSortMenuOpen(prev => !prev)
            }}>
                Sort
            </button>
            {sortMenuOpen && (<div className="absolute left-0 top-full z-50 mt-1 min-w-56 rounded-md border border-border bg-background p-2 flex flex-col gap-2 items-start shadow-md">
                <button className="w-full rounded-md px-2 py-1 text-left text-foreground hover:bg-surface-2">
                    By time created
                </button>
                <button className="w-full rounded-md px-2 py-1 text-left text-foreground hover:bg-surface-2">
                    By time updated
                </button>
                <button className="w-full rounded-md px-2 py-1 text-left text-foreground hover:bg-surface-2">
                    Alphabetically
                </button>
                <button className="w-full rounded-md px-2 py-1 text-left text-foreground hover:bg-surface-2">
                    By size
                </button>
            </div>)}
        </div>
    )
}