"use client"

import { useState } from "react";
import { LoginForm } from "./components/auth/LoginForm";
import { LogoutButton } from "./components/auth/LogoutButton";
import { SignUpForm } from "./components/auth/SignUpForm";
import { CreateStackForm } from "./components/stacks/CreateStackForm";
import { GetStacksForm } from "./components/stacks/GetStacksForm";
import { LoginStatus } from "./components/auth/LoginStatus";

export default function Home() {
    const [loggingIn, setLoggingIn] = useState(false)

  return (
    <div className="flex flex-col p-10 gap-4">
      <div>
        <LoginStatus/>
      </div>
      <div className="flex flex-col w-[300px] border-1 border-white rounded-md p-2">
        {loggingIn ? (
          <LoginForm />
        ) : (
          <SignUpForm />
        )}
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
      <div className="flex flex-col w-[300px] border-1 border-white rounded-md p-2">
        <CreateStackForm/>
      </div>
      <div className="flex flex-col w-[300px] border-1 border-white rounded-md p-2">
        <GetStacksForm/>
      </div>
      <div>
        <LogoutButton/>
      </div>
    </div>
  );
}
