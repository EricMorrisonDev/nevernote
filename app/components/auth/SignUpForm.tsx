"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function SignUpForm () {

    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password })
            })

            if(!res.ok){
                const data = await res.json().catch(() => null)
                setError(data?.error ?? "Unknown error occurred")
            }
        } finally {
            setIsLoading(false)
        }

        router.refresh()
    }

    return(
        <form
        onSubmit={(e) => {
            handleSubmit(e)
        }}>
            {error && (
                <p className="text-red-500">{error}</p>
            )}
            <label htmlFor="input-email">
                Email
                <input
                id="input-email"
                type="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value)
                }} />
            </label>
            <label htmlFor="input-password">
                Password
                <input
                id="input-password"
                type="password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value)
                }} />
            </label>
            <button
            type="submit"
            disabled={isLoading}>
                Sign Up
            </button>
        </form>
    )
}