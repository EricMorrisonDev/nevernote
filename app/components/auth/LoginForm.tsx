"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function LoginForm () {

    const router = useRouter()
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

        router.refresh()
    }
    
    return(
        <form
        onSubmit={(e) => {
            handleLogin(e)
        }}>
            {error && (
                <p className="text-red-500">{error}</p>
            )}
            <label htmlFor="login-email">
                email
                <input
                    id="login-email"
                    type="email"
                    placeholder="type email here"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                    }} />
            </label>
            <label htmlFor="login-password">
                password
                <input
                    id="login-password"
                    type="password"
                    placeholder="type password here"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }} />
            </label>
            <button
            type="submit"
            >
                Login
            </button>
        </form>
    )
}