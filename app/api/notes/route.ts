import { prisma } from "@/lib/db";
import type { Prisma } from ".prisma/client";
import { getCurrentUser, requireUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { createNoteSchema } from "@/lib/validations/notes";
import { flattenError } from "zod/v4/core";
import { handleApiError } from "@/lib/errorResponse";

async function ensureNotebookBelongsToUser(notebookid: string, userId: string) {

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

export async function POST(request: Request) {

    try{
        // take request body and validate with zod schema
        const body = await request.json()
        const validated = createNoteSchema.safeParse(body)

        if(!validated.success){
            return NextResponse.json(
                {error: "Validation failed", details: flattenError(validated.error)},
                {status: 400}
            )
        }

        // get the current user
        const user = await getCurrentUser()

        if(!user){
            return NextResponse.json(
                {error: "User not found"},
                {status: 400}
            )
        }

        // destructure out the data from body
        const { title, content, notebookId } = validated.data

        // if there's a notebook id make sure it matches user
        if(notebookId){
            const result = await ensureNotebookBelongsToUser(notebookId, user.id)
            if(result instanceof NextResponse) return result
        }

        // create the new note and return it

        const createData: Prisma.NoteUncheckedCreateInput = {
            title,
            content,
            userId: user.id,
            ...(notebookId ? { notebookId } : {})
        }

        const newNote = await prisma.note.create({
            data: createData
        })

        return NextResponse.json(
            {data: newNote},
            {status: 200}
        )
        
    } catch (e) {
        handleApiError(e)
    }
}

export async function GET(request: Request) {
    try {
        const result = await requireUser()
        if (result instanceof NextResponse) return result
        const user = result

        const url = new URL(request.url)
        const notebookId = url.searchParams.get('notebookId')

        if (notebookId) {
            const result = await ensureNotebookBelongsToUser(notebookId, user.id)
            if(result instanceof NextResponse) return result
        }

        const where: {userId: string, notebookId?: string} = { userId: user.id }
        if (notebookId) where.notebookId = notebookId

        const notes = await prisma.note.findMany({
            where,
            orderBy: { updatedAt: "desc" }
        })

        return NextResponse.json(
            { data: notes },
            { status: 200 }
        )
    } catch (e) {
        handleApiError(e)
    }
}