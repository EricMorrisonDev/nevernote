import { NextResponse } from "next/server"


export const handleError = (err: unknown) => {
    console.error(err)
    return NextResponse.json(
        {error: "Unknown server error"},
        {status: 500}
    )
}