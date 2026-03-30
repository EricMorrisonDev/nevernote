import { AuthForm } from "@/app/components/auth/AuthForm"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="mb-6 text-xl font-semibold">Nevernote</h1>
      <AuthForm />
    </div>
  )
}
