import { getCurrentUser } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET () {

    try {
        const user = await getCurrentUser()

        if(!user){
            return NextResponse.json(
                {error: "User not found"},
                {status: 401}
            )
        }

        return NextResponse.json(
            {data: user},
            {status: 200}
        )
    } catch (e) {
        throw (e)
    }
}