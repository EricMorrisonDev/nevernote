import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { updateStackSchema, stackIdParamsSchema } from "@/lib/validations/stacks";
import { NextResponse } from "next/server";

export async function PUT(request: Request, context: { params: Promise<{ id: string }>}) {

    try{
        const { id } = await context.params
        const body = await request.json()
        const validatedBody = updateStackSchema.safeParse(body)
        const validatedId = stackIdParamsSchema.safeParse(id)

        if(!validatedBody.success || !validatedId.success){
            return NextResponse.json(
                {error: "Request validation failed"},
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

        const updatedStack = await prisma.stack.update({
            where:{
                id,
                userId: user.id
            },
            data: {
                title: validatedBody.data.title
            }
        })

        return NextResponse.json(
            {updatedStack: updatedStack},
            {status: 200}
        )

    } catch (e) {
        throw e
    }
}


export async function DELETE(request: Request, context: { params: Promise<{ id: string }>}) {

    try{
        const { id } = await context.params
        const validatedId = stackIdParamsSchema.safeParse({ id })

        if(!validatedId.success){
            return NextResponse.json(
                {error: "Request validation failed"},
                {status: 401}
            )
        }

        const user = await getCurrentUser()

        if(!user){
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 400}
            )
        }

        const stack = await prisma.stack.findUnique({
            where: {
                id,
                userId: user.id
            }
        })

        const notebooks = stack.notebooks?


        const result = await prisma.stack.delete({
            where: {
                id,
                userId: user.id
            }
        })

        return NextResponse.json(
            {result: result},
            {status: 200}
        )

    } catch (e) {
        throw e
    }
}