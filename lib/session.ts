import "server-only"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export const getCurrentUser = async () => {
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
    
    return user
}

export const requireUser = async() => {
    const user = await getCurrentUser()

    if(!user){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        )
    }

    return user
}