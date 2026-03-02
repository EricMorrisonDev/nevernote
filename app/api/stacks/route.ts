import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createStackSchema } from "@/lib/validations/stacks";
import { NextResponse } from "next/server";
import { flattenError } from "zod";

export async function POST(request: Request) {

    try{
        const user = await getCurrentUser()
        if(!user){
            return NextResponse.json(
                {error: "User not found"},
                { status: 401}
            )
        }

        const body = await request.json()
        const validated = createStackSchema.safeParse(body)

        if(!validated.success){
            return NextResponse.json(
                {error: "Validation failed", details: flattenError(validated.error)},
                {status: 400}
            )
        }

        const title = validated.data?.title

        const newStack = await prisma.stack.create({
            data: {
                title,
                userId: user.id
            }
        })

        return NextResponse.json(
            {stack: newStack},
            {status: 201}
        )
    } catch (e) {
        throw e
    }
}