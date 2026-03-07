import { useState } from "react";
import { LoginForm } from "./components/auth/LoginForm";
import { LogoutButton } from "./components/auth/LogoutButton";
import { SignUpForm } from "./components/auth/SignUpForm";

export default function Home() {
    const [loggingIn, setLoggingIn] = useState(false)

  return (
    <div>
      {loggingIn ? (
        <LoginForm />
      ) : (
        <SignUpForm />
      )}
        <p>{
          loggingIn ? "Not yet registered?" : "Already have an account?"
          }</p>
        <button
        onClick={() => {
          setLoggingIn(prev => !prev)
        }}>
          {loggingIn ? "Sign up" : "Log in"}
        </button>
        <LogoutButton />
    </div>
  );
}
