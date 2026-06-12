import { prisma } from "@/lib/db";
import type { Prisma } from ".prisma/client";
import { requireUser } from "@/lib/session";
import { updateNoteSchema, noteIdParamsSchema, reorderNoteBodySchema } from "@/lib/validations/notes";
import { NextResponse } from "next/server";
import { requireValidation } from "@/lib/zodValidation";
import { ensureNotebookBelongsToUser } from "@/lib/notebookMatch";
import { handleApiError } from "@/lib/errorResponse";
import { deleteNoteDocuments, ingestNote } from "@/lib/RAG/ingest";

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

        await ingestNote(updatedNote)

        return NextResponse.json(
            {data: updatedNote},
            {status: 200}
        )

    } catch (e) {
        return handleApiError(e)
    }
}

// PATCH: persist custom order — body `{ afterId?, beforeId? }` (at least one).
// afterId = predecessor note (omit = move to start); beforeId = successor (omit = move to end).

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
        const idValidated = requireValidation(noteIdParamsSchema, { id })
        if (idValidated instanceof NextResponse) return idValidated

        const body: unknown = await request.json()
        const validatedBody = requireValidation(reorderNoteBodySchema, body)
        if (validatedBody instanceof NextResponse) return validatedBody

        const user = await requireUser()
        if (user instanceof NextResponse) return user

        const note = await ensureNoteMatchesUser(idValidated.data.id, user.id)
        if (note instanceof NextResponse) return note

        const { afterId, beforeId } = validatedBody.data

        if (afterId === id || beforeId === id) {
            return NextResponse.json(
                { error: "Neighbors cannot be the moved note" },
                { status: 400 }
            )
        }

        const notebookId = note.notebookId

        const [predNote, succNote] = await Promise.all([
            afterId
                ? prisma.note.findFirst({
                      where: { 
                        id: afterId, 
                        notebookId, 
                        userId: user.id 
                    },
                      select: { customOrder: true },
                  })
                : null,
            beforeId
                ? prisma.note.findFirst({
                      where: { id: beforeId, notebookId, userId: user.id },
                      select: { customOrder: true },
                  })
                : null,
        ])

        if (afterId && !predNote) {
            return NextResponse.json({ error: "afterId not found in this notebook" }, { status: 400 })
        }
        if (beforeId && !succNote) {
            return NextResponse.json({ error: "beforeId not found in this notebook" }, { status: 400 })
        }

        let newOrder: number
        if (predNote && succNote) {
            if (predNote.customOrder >= succNote.customOrder) {
                return NextResponse.json(
                    { error: "Invalid neighbor ordering for reorder" },
                    { status: 400 }
                )
            }
            newOrder = (predNote.customOrder + succNote.customOrder) / 2
        } else if (predNote && !succNote) {
            newOrder = predNote.customOrder + 1000
        } else if (!predNote && succNote) {
            newOrder = succNote.customOrder - 1000
        } else {
            return NextResponse.json({ error: "Invalid reorder request" }, { status: 400 })
        }

        // Reorder must not bump `updatedAt` (@updatedAt otherwise runs on any update).
        const updatedNote = await prisma.note.update({
            where: { id: note.id, userId: user.id },
            data: {
                customOrder: newOrder,
                updatedAt: note.updatedAt,
            },
        })

        return NextResponse.json({ data: updatedNote }, { status: 200 })
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

        await deleteNoteDocuments(validatedId.data.id)

        return NextResponse.json(
            {message: "note deleted"},
            {status: 200}
        )
    } catch (e) {
        return handleApiError(e)
    }
}