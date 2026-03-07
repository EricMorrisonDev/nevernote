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
                    className="border-1 border-white rounded-md w-[80%] p-1"/>
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
                    className="border-1 border-white rounded-md w-[80%] p-1"/>
            </label>
            <button
            type="submit"
            className="border-1 border-white rounded-md my-2 py-1 px-2"
            >
                Login
            </button>
        </form>
    )
}
