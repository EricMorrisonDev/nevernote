import { getCurrentUser } from "@/lib/session"

export async function LoginStatus() {
    const user = await getCurrentUser()

    if (!user) {
        return null
    }

    return (
        <p>You are logged in as {user.email}</p>
    )
}
