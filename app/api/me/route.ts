import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";

export async function GET() {

    const user = await requireUser()
    if(user instanceof NextResponse){
        return user
    }

    return NextResponse.json(
        {user},
        {status: 200}
    )
}