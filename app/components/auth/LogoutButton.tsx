"use client"

import { useState } from "react"

export function LogoutButton () {
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/auth/logout', {
                method: "POST"
            })
            if (res.ok) {
                window.location.href = '/'
            }
        } finally {
            setIsLoading(false)
        }
    }

    return(
        <button
        onClick={() => {
            handleLogout()
        }}
        disabled={isLoading}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:border-control-border hover:text-control-hover"
        >
            Logout
        </button>
    )
}
