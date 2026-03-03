import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/db"
import { updateNotebookSchema, notebookIdParamsSchema } from "@/lib/validations/notebooks"
import { NextResponse } from "next/server"
import { flattenError } from "zod/v4/core"


export async function PUT (request: Request, context: { params: Promise<{ id: string }>}) {
    try{
        const body = await request.json()
        const validatedBody = updateNotebookSchema.safeParse(body)

        const { id } = await context.params
        const validatedId = notebookIdParamsSchema.safeParse({ id })

        if(!validatedBody.success){
            return NextResponse.json(
                {error: "Failed to validate", details: flattenError(validatedBody.error)},
                {status: 400}
            )
        }

        if(!validatedId.success){
            return NextResponse.json(
                {error: "Invalid notebook id", details: flattenError(validatedId.error)},
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

        if(validatedBody.data.stackId){
            const stackIdMatchesUser = await prisma.stack.findFirst({
                where: {
                    id: validatedBody.data.stackId,
                    userId: user.id
                }
            })

            if(!stackIdMatchesUser){
                return NextResponse.json(
                    {error: "Stack id does not match user"},
                    {status: 400}
                )
            }
        }

        const updatedNotebook = await prisma.notebook.update({
            where: {
                id,
                userId: user.id
            },
            data: {
                title: validatedBody.data.title,
                stackId: validatedBody.data.stackId
            }
        })

        return NextResponse.json(
            {data: updatedNotebook},
            {status: 200}
        )
    } catch (e) {
        throw e
    }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
    
    try {
        const { id } = await context.params
        const validatedId = notebookIdParamsSchema.safeParse({ id })

        if (!validatedId.success) {
            return NextResponse.json(
                { error: "Invalid notebook id", details: flattenError(validatedId.error) },
                { status: 400 }
            )
        }

        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        await prisma.notebook.delete({
            where: {
                id,
                userId: user.id
            }
        })

        return NextResponse.json(
            { message: "Notebook deleted" },
            { status: 200 }
        )
    } catch (e) {
        throw e
    }
}
