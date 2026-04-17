"use client"

import { useEffect, useState } from "react"

export function LoginStatus() {

    const [user, setUser] = useState<{email: string} | null>(null)

    useEffect(() => {
        fetch('/api/me', {method: "GET"})
            .then((res) => res.ok ? res.json() : null)
            .then((data) => data?.user ?? null)
            .then(setUser)
    }, [])

    if(!user){
        return <p className="text-red-500">You are not logged in !</p>
    }

    return <p className="text-accent">You are logged in as {user.email}</p>
}