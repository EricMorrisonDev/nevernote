"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function LogoutButton () {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/auth/logout', {
                method: "POST"
            })
            if (res.ok) {
                router.refresh()
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
        >
            Logout
        </button>
    )
}
