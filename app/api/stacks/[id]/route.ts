import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireValidation } from "@/lib/zodValidation";
import { handleApiError } from "@/lib/errorResponse";
import { updateStackSchema, stackIdParamsSchema } from "@/lib/validations/stacks";
import { NextResponse } from "next/server";

export async function PUT(request: Request, context: { params: Promise<{ id: string }>}) {

    try{
        // exract params
        const { id } = await context.params

        // parse body
        const body = await request.json()

        // validate body
        const validateBody = requireValidation(updateStackSchema, body)
        if(validateBody instanceof NextResponse) return validateBody

        // validate id
        const validateId = requireValidation(stackIdParamsSchema, { id })
        if(validateId instanceof NextResponse) return validateId

        // get user
        const user = await requireUser()
        if(user instanceof NextResponse) return user

        // update stack
        const updatedStack = await prisma.stack.update({
            where: {
                id,
                userId: user.id
            },
            data: {
                title: validateBody.data.title
            }
        })
    
        // return next response
        return NextResponse.json(
            {data: updatedStack},
            {status: 200}
        )
        

    } catch (e) {
        return handleApiError(e)
    }
}


export async function DELETE(context: { params: Promise<{ id: string }>}) {

    try{
        const { id } = await context.params
        const validateId = requireValidation(stackIdParamsSchema, { id })
        if(validateId instanceof NextResponse) return validateId
    
        const user = await requireUser()
        if(user instanceof NextResponse) return user
    
        const result = await prisma.stack.delete({
            where: {
                id,
                userId: user.id
            }
        })
    
        return NextResponse.json(
            {result},
            {status: 200}
        )
    } catch (e) {
        return handleApiError(e)
    }
}