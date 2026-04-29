import type { ReactNode, Dispatch, SetStateAction } from "react";

interface ModalProps {
    children: ReactNode
    modalOpen: boolean,
    title: string,
    setModalOpen: Dispatch<SetStateAction<boolean>>
}

// later on look into passing a wrapper function instead of passing the setter function for isOpen
export function Modal ({
    title,
    children,
    modalOpen,
    setModalOpen,
}: ModalProps) {

    if(!modalOpen) return null

    return(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
            role="presentation"
            aria-label="overlay"
            onClick={() => {
                setModalOpen(false)
            }}
        >
            <div
                className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                {children}
            </div>
        </div>
    )
}