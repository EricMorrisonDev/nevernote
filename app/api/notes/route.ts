import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { createNoteSchema } from "@/lib/validations/notes";
import { flattenError } from "zod/v4/core";

export async function POST(request: Request) {

    try{
        const body = await request.json()
        const validatedBody = createNoteSchema.safeParse(body)

        if(!validatedBody.success){
            return NextResponse.json(
                {error: "Invalid request body", details: flattenError(validatedBody.error)},
                {status: 400}
            )
        }

        const user = await getCurrentUser()

        if(!user){
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }

        const { title, content, notebookId } = validatedBody.data

        const notebookBelongsToUser = await prisma.notebook.findFirst({
            where: {
                id: notebookId,
                userId: user.id
            }
        })

        if(!notebookBelongsToUser){
            return NextResponse.json(
                {error: "Notebook not found"},
                {status: 400}
            )
        }

        const newNote = await prisma.note.create({
            data: {
                title,
                content,
                notebookId,
                userId: user.id
            }
        })

        return NextResponse.json(
            {data: newNote},
            {status: 201}
        )
    } catch (e) {
        throw e
    }
}

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const url = new URL(request.url)
        const notebookId = url.searchParams.get('notebookId')

        if (notebookId) {
            const notebookBelongsToUser = await prisma.notebook.findFirst({
                where: {
                    id: notebookId,
                    userId: user.id
                }
            })
            if (!notebookBelongsToUser) {
                return NextResponse.json(
                    { error: "Invalid notebook" },
                    { status: 400 }
                )
            }
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
        throw e
    }
}