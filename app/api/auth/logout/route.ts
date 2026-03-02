import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = 'session'

export async function POST () {

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    const sessionId = sessionCookie?.value

    if (sessionId) {
        try {
            await prisma.session.delete({
                where: { id: sessionId }
            })
        } catch {
            // Session already deleted or invalid; still clear cookie and succeed
        }
    }

    cookieStore.delete(SESSION_COOKIE_NAME)

    return NextResponse.json(
        { message: "Session cleared" },
        { status: 200 }
    )
}
