import { NextResponse } from "next/server";


export function handleApiError(err: unknown) {
    
    console.error(err)
    return NextResponse.json(
        {error: "Unknown error occurred"},
        {status: 500}
    )

}