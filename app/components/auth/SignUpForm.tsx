"use client"

import { useState } from "react"

export function SignUpForm () {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password, confirmPassword })
            })

            if(!res.ok){
                const data = await res.json().catch(() => null)
                setError(data?.error ?? "Unknown error occurred")
                console.log(data?.details)
            } else {
                setSuccess('Registration Successful :)')
            }
        } finally {
            setEmail('')
            setPassword('')
            setConfirmPassword('')
            setIsLoading(false)
        }

        window.location.href = '/'
    }

    return(
        <form
        onSubmit={(e) => {
            handleSubmit(e)
        }}
        className="">
            {error && (
                <p className="text-red-500">{error}</p>
            )}
            {success && (
                <p className="text-green-500">{success}</p>
            )}
            <label htmlFor="input-email"
            className="flex flex-col my-1">
                Email
                <input
                id="input-email"
                type="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value)
                }}
                className="border-1 border-white rounded-md w-[80%] p-1" />
            </label>
            <label htmlFor="input-password"
            className="flex flex-col my-1">
                Password
                <input
                id="input-password"
                type="password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value)
                }}
                className="border-1 border-white rounded-md w-[80%] p-1" />
            </label>
            <label htmlFor="confirm-password"
            className="flex flex-col my-1">
                Confirm Password
                <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                    setConfirmPassword(e.target.value)
                }}
                className="border-1 border-white rounded-md w-[80%] p-1" />
            </label>
            <button
            type="submit"
            disabled={isLoading}
            className="border-1 border-white rounded-md my-2 py-1 px-2 ">
                Sign Up
            </button>
        </form>
    )
}