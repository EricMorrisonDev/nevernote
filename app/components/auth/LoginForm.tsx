"use client"

import { useState } from "react"

export function LoginForm () {

    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const handleLogin = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setError(null)

        const res = await fetch('/api/auth/login', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password})
        })

        if (!res.ok) {
            const data = await res.json().catch(() => null)
            setError(data?.error ?? "Login failed")
            return
        }

        window.location.href = '/'
    }
    
    return(
        <form
        onSubmit={(e) => {
            handleLogin(e)
        }}
        className="">
            {error && (
                <p className="text-red-500">{error}</p>
            )}
            <label htmlFor="login-email"
            className="flex flex-col my-1">
                Email
                <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                    }} 
                    className="w-[80%] rounded-lg border border-border bg-background p-2 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-ring/40"/>
            </label>
            <label htmlFor="login-password"
            className="flex flex-col my-1">
                Password
                <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }} 
                    className="w-[80%] rounded-lg border border-border bg-background p-2 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-ring/40"/>
            </label>
            <button
            type="submit"
            className="my-2 rounded-lg border border-accent bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/15"
            >
                Login
            </button>
        </form>
    )
}
