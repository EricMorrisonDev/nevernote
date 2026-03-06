import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { createStackSchema } from "@/lib/validations/stacks";
import { NextResponse } from "next/server";
import { requireValidation } from "@/lib/zodValidation";

export async function POST(request: Request) {
    try {
        const userResult = await requireUser()
        if(userResult instanceof NextResponse) return userResult
        const user = userResult
        
        const body = await request.json()
        const validatedResult = requireValidation(createStackSchema, body)
        if(validatedResult instanceof NextResponse) return validatedResult
        const validated = validatedResult
        
        const newStack = await prisma.stack.create({
            data: {
                title: validated.data.title,
                userId: user.id
            }
        })

        return NextResponse.json(
            {data: newStack},
            {status: 201}
        )
    } catch (e) {
        throw e
    }
}

export async function GET() {

    try{
        const result = await requireUser()
        if (result instanceof NextResponse) return result
        const user = result

        const stacks = await prisma.stack.findMany({
            where: {
                userId: user.id
            }
        })

        return NextResponse.json(
            {data: stacks},
            {status: 200}
        )

    } catch (e) {
        throw (e)
    }
}