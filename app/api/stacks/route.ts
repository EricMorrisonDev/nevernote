import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { createStackSchema } from "@/lib/validations/stacks";
import { NextResponse } from "next/server";
import { requireValidation } from "@/lib/zodErrors";

export async function POST(request: Request) {

    try{
        const result = await requireUser()
        if (result instanceof NextResponse) return result
        const user = result

        const body = await request.json()
        const validationResult = requireValidation(createStackSchema, body)
        if(validationResult instanceof NextResponse) return validationResult

        const validated = validationResult

        const title = validated.data?.title

        const newStack = await prisma.stack.create({
            data: {
                title,
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