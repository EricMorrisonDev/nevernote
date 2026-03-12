import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "./db";

export async function getCurrentUser() {

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    const sessionId = sessionCookie?.value

    if(!sessionId){
        return null
    }

    const session = await prisma.session.findUnique({
        where: {
            id: sessionId
        }
    })

    if(!session || session.expiresAt <= new Date()){
        return null
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session.userId
        }
    })

    if(!user){
        return null
    }

    return user
}

export async function requireUser() {

    const user = await getCurrentUser()

    if(!user){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        )
    }

    return user
}