import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"
import { updateNotebookSchema, notebookIdParamsSchema } from "@/lib/validations/notebooks"
import { requireValidation } from "@/lib/zodValidation"
import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/errorResponse"

async function ensureStackMatchesUser(stackId: string, userId: string) {

    const result = await prisma.stack.findFirst({
        where: {
            id: stackId,
            userId
        }
    })

    if(!result){
        return NextResponse.json(
            {error: "StackId does not match user"},
            {status: 400}
        )
    }
}

export async function PUT (request: Request, context: { params: Promise<{ id: string }>}) {
    try{
        const body = await request.json()
        const validatedBody = requireValidation(updateNotebookSchema, body)
        if(validatedBody instanceof NextResponse) return validatedBody

        const { id } = await context.params
        const validatedId = requireValidation(notebookIdParamsSchema, { id })
        if(validatedId instanceof NextResponse) return validatedId

        const user = await requireUser()
        if (user instanceof NextResponse) return user

        if(validatedBody.data.stackId){
            const match = ensureStackMatchesUser(validatedBody.data.stackId, user.id)
            if(match instanceof NextResponse) return match
        }

        const updatedNotebook = await prisma.notebook.update({
            where: {
                id: validatedId.data.id,
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
        return handleApiError(e)
    }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
    
    try {
        const { id } = await context.params
        const validatedId = requireValidation(notebookIdParamsSchema, { id })
        if(validatedId instanceof NextResponse) return validatedId

        const user = await requireUser()
        if (user instanceof NextResponse) return user
        

        await prisma.notebook.delete({
            where: {
                id: validatedId.data.id,
                userId: user.id
            }
        })

        return NextResponse.json(
            { message: "Notebook deleted" },
            { status: 200 }
        )
    } catch (e) {
        return handleApiError(e)
    }
}
