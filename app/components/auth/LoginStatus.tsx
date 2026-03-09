"use client"

import { useEffect, useState } from "react"

export function LoginStatus() {
    const [user, setUser] = useState<{ email: string } | null>(null)

    useEffect(() => {
        fetch("/api/me", { method: "GET" })
            .then((res) => (res.ok ? res.json() : null))
            .then(setUser)
    }, [])

    if (!user) {
        return <p>You are not logged in!</p>
    }

    return <p>You are logged in as {user.email}</p>
}
