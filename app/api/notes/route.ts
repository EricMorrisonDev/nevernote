import { prisma } from "@/lib/db";
import type { Prisma } from ".prisma/client";
import { requireUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { createNoteSchema } from "@/lib/validations/notes";
import { handleApiError } from "@/lib/errorResponse";
import { requireValidation } from "@/lib/zodValidation";
import { ensureNotebookBelongsToUser } from "@/lib/notebookMatch";

export async function POST(request: Request) {

    try{
        // get the current user
        const user = await requireUser()
        if(user instanceof NextResponse) return user
        
        // take request body and validate with zod schema
        const body = await request.json()
        const validated = requireValidation(createNoteSchema, body)
        if(validated instanceof NextResponse) return validated

        // destructure out the data from body
        const { title, content, notebookId } = validated.data

        // if there's a notebook id make sure it matches user
        
        const match = await ensureNotebookBelongsToUser(notebookId, user.id)
        if(match instanceof NextResponse) return match
        

        // create the new note and return it

        const createData: Prisma.NoteUncheckedCreateInput = {
            title,
            content,
            userId: user.id,
            notebookId
        }

        const newNote = await prisma.note.create({
            data: createData
        })

        return NextResponse.json(
            {data: newNote},
            {status: 201}
        )
        
    } catch (e) {
        return handleApiError(e)
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
        return handleApiError(e)
    }
}