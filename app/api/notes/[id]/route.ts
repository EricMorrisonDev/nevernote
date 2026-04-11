import { prisma } from "@/lib/db";
import type { Prisma } from ".prisma/client";
import { requireUser } from "@/lib/session";
import { updateNoteSchema, noteIdParamsSchema } from "@/lib/validations/notes";
import { NextResponse } from "next/server";
import { requireValidation } from "@/lib/zodValidation";
import { ensureNotebookBelongsToUser } from "@/lib/notebookMatch";
import { handleApiError } from "@/lib/errorResponse";

async function ensureNoteMatchesUser(noteId: string, userId: string) {
    const match = await prisma.note.findFirst({
        where: {
            id: noteId,
            userId
        }
    })

    if(!match){
        return NextResponse.json(
            {error: "Note Id does not match this user"},
            {status: 400}
        )
    }

    return match
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }>}) {

    try{
        const body = await request.json()
        const validatedBody = requireValidation(updateNoteSchema, body)
        if(validatedBody instanceof NextResponse) return validatedBody

        const { id } = await context.params
        const idValidated = requireValidation(noteIdParamsSchema, {id})
        if(idValidated instanceof NextResponse) return idValidated

        const user = await requireUser()
        if (user instanceof NextResponse) return user
        
        const noteIdMatchesUser = await ensureNoteMatchesUser(id, user.id)
        if(noteIdMatchesUser instanceof NextResponse) return noteIdMatchesUser

        if(validatedBody.data.notebookId !== undefined && validatedBody.data.notebookId !== null){
            const match = await ensureNotebookBelongsToUser(validatedBody.data.notebookId, user.id)
            if(match instanceof NextResponse) return match
        }

        const data: Prisma.NoteUncheckedUpdateInput = {}
        if(validatedBody.data.title !== undefined) data.title = validatedBody.data.title
        if(validatedBody.data.content !== undefined) data.content = validatedBody.data.content
        if(validatedBody.data.notebookId !== undefined) data.notebookId = validatedBody.data.notebookId

        const updatedNote = await prisma.note.update({
            where: {
                id,
                userId:user.id
            },
            data: data
        })

        return NextResponse.json(
            {data: updatedNote},
            {status: 200}
        )

    } catch (e) {
        return handleApiError(e)
    }
}

// set up get specific note api

export async function GET(_request: Request, context: { params: Promise<{ id: string }>}) {

    try{
        const { id } = await context.params 
        const validatedId = requireValidation(noteIdParamsSchema, { id })
        if(validatedId instanceof NextResponse) return validatedId

        const user = await requireUser()
        if(user instanceof NextResponse) return user

        const note = await ensureNoteMatchesUser(validatedId.data.id, user.id)
        if(note instanceof NextResponse) return note


        return NextResponse.json(
            {data: note},
            {status: 200}
        )

    } catch (e) {
        return handleApiError(e)
    }

}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string}>}) {

    try{
        const { id } = await context.params
        const validatedId = requireValidation(noteIdParamsSchema, { id })
        if(validatedId instanceof NextResponse) return validatedId

        const user = await requireUser()
        if(user instanceof NextResponse) return user

        const result = await prisma.note.deleteMany({
            where: {
                id: validatedId.data.id,
                userId: user.id
            }
        })

        if(result.count === 0){
            return NextResponse.json(
                {error: "Note not found"},
                {status: 404}
            )
        }

        return NextResponse.json(
            {message: "note deleted"},
            {status: 200}
        )
    } catch (e) {
        return handleApiError(e)
    }
}