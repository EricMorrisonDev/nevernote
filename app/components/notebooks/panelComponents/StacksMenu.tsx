import type { Stack } from "@/lib/types/api"
import { Dispatch, SetStateAction } from "react"

type EditState =
    | { kind: "stack"; id: string; value: string }
    | { kind: "notebook"; id: string; value: string }
    | null

type MenuType = 
    | { kind: "stack"; id: string; x: number, y: number }
    | { kind: "notebook"; id: string; x: number, y: number }

interface StacksMenuProps {
    stacks: Stack[] | null,
    setEditState: Dispatch<SetStateAction<EditState | null>>,
    menuState: MenuType,
    onCloseMenu: () => void,
    onDeleteStack: (id: string) => void
}

export function StacksMenu({
    stacks,
    setEditState,
    menuState,
    onCloseMenu,
    onDeleteStack
}: StacksMenuProps) {

    return(
        <div className="rounded-md border border-border bg-background p-2 flex flex-col gap-2 items-start">
            <button 
            type="button"
            className="w-full rounded-md px-2 py-1 text-left text-foreground hover:bg-surface-2"
            onClick={() => {
                const stack = stacks?.find((s) => s.id === menuState.id)
                setEditState({
                    kind: "stack",
                    id: menuState.id,
                    value: stack?.title ?? ""
                })
                onCloseMenu()
            }}
            >
                Rename stack
            </button>
            <button
                type="button"
                className="w-full rounded-md px-2 py-1 text-left text-foreground hover:bg-surface-2"
                onClick={() => {
                    onDeleteStack(menuState.id)
                }}
            >
                Delete stack
            </button>
            <button type="button" className="w-full rounded-md px-2 py-1 text-left text-foreground hover:bg-surface-2">
                Add notebooks
            </button>
        </div>
    )
}
