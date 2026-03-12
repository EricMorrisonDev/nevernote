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
        className="border-1 border-blue-500 rounded-md p-1"
        >
            Logout
        </button>
    )
}
