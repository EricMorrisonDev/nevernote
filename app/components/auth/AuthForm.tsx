"use client"

import { useState } from "react";
import { SignUpForm } from "./SignUpForm";
import { LoginForm } from "./LoginForm";

export function AuthForm() {
    const [loggingIn, setLoggingIn] = useState(false)

    return(
        <div className="flex flex-col w-[300px] border-1 border-white rounded-md p-2">
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
                className="w-[50%] border-1 border-white rounded-md">
                    {loggingIn ? "Sign up" : "Log in"}
                </button>
            </div>
        </div>
    )
} 