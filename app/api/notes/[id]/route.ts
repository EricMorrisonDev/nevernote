import { prisma } from "@/lib/db";
import type { Prisma } from ".prisma/client";
import { requireUser } from "@/lib/session";
import { updateNoteSchema, noteIdParamsSchema } from "@/lib/validations/notes";
import { NextResponse } from "next/server";
import { flattenError } from "zod/v4/core";

export async function PUT(request: Request, context: { params: Promise<{ id: string }>}) {

    try{
        const body = await request.json()
        const validatedBody = updateNoteSchema.safeParse(body)

        const { id } = await context.params
        const idValidated = noteIdParamsSchema.safeParse({ id })

        if(!validatedBody.success){
            return NextResponse.json(
                {error: "Invalid request body", details: flattenError(validatedBody.error)},
                {status: 400}
            )
        }

        if(!idValidated.success){
            return NextResponse.json(
                {error: "Invalid id", details: flattenError(idValidated.error)},
                {status: 400}
            )
        }

        const result = await requireUser()
        if (result instanceof NextResponse) return result
        const user = result

        const noteIdMatchesUser = await prisma.note.findFirst({
            where: {
                id,
                userId: user.id
            }
        })

        if(!noteIdMatchesUser){
            return NextResponse.json(
                {error: "Note Id does not match this user"},
                {status: 400}
            )
        }

        if(validatedBody.data.notebookId !== undefined && validatedBody.data.notebookId !== null){
            const matchesUser = await prisma.notebook.findFirst({
                where: {
                    id: validatedBody.data.notebookId,
                    userId: user.id
                }
            })

            if(!matchesUser){
                return NextResponse.json(
                    {error: "Notebook id does not match user"},
                    {status: 400}
                )
            }
        }

        const data: Record<string, unknown> = {}
        if(validatedBody.data.title !== undefined) data.title = validatedBody.data.title
        if(validatedBody.data.content !== undefined) data.content = validatedBody.data.content
        if(validatedBody.data.notebookId !== undefined) data.notebookId = validatedBody.data.notebookId

        const updatedNote = await prisma.note.update({
            where: {
                id,
                userId:user.id
            },
            data: data as Prisma.NoteUncheckedUpdateInput
        })

        return NextResponse.json(
            {data: updatedNote},
            {status: 200}
        )

    } catch (e) {
        throw e
    }
}