import { NextResponse } from "next/server"
import { prisma } from "./db"

export async function ensureNotebookBelongsToUser(notebookid: string, userId: string) {

    const match = await prisma.notebook.findFirst({
        where: {
            id: notebookid,
            userId
        }
    })

    if(!match){
        return NextResponse.json(
            {error: "NotebookId does not match user"},
            {status: 400}
        )
    }
}