"use client"

import { useState } from "react";
import { SignUpForm } from "./SignUpForm";
import { LoginForm } from "./LoginForm";

export function AuthForm() {
    const [loggingIn, setLoggingIn] = useState(true)

    return(
        <div className="flex w-[300px] flex-col rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div>
                {loggingIn ? (
                    <LoginForm/>
                ) : (
                    <SignUpForm/>
                )}
            </div>
            <div className="pt-4 pb-2">
                <p className="py-1">{
                    loggingIn ? "Not yet registered?" : "Already have an account?"
                }</p>
                <button
                onClick={() => {
                    setLoggingIn(prev => !prev)
                }}
                className="w-[50%] rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:border-control-border hover:text-control-hover">
                    {loggingIn ? "Sign up" : "Log in"}
                </button>
            </div>
        </div>
    )
} 