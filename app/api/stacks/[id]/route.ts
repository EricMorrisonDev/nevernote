import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { updateStackSchema } from "@/lib/validations/stacks";
import { NextResponse } from "next/server";

export async function PUT(request: Request, context: { params: Promise<{ id: string }>}) {

    try{
        const { id } = await context.params
        const body = await request.json()
        const validated = updateStackSchema.safeParse({...body, id})

        if(!validated.success){
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
                title: validated.data.title
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
