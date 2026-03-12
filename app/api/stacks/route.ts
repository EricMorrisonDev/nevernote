import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { createStackSchema } from "@/lib/validations/stacks";
import { NextResponse } from "next/server";
import { requireValidation } from "@/lib/zodValidation";
import { handleApiError } from "@/lib/errorResponse";

export async function POST(request: Request) {

    try { 
        const result = await requireUser()
        if(result instanceof NextResponse) return result
    
        const userId = result.id
    
        const body = await request.json()
        const validated = requireValidation(createStackSchema, body)
        if(validated instanceof NextResponse) return validated
    
        const newStack = await prisma.stack.create({
            data: {
                title: validated.data.title,
                userId
            }
        })
    
        return NextResponse.json(
            {data: newStack},
            {status: 201}
        )
    } catch (e) {
        return handleApiError(e)
    }

}

export async function GET() {

    try{
        const user = await requireUser()
        if(user instanceof NextResponse) return user
    
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
        return handleApiError(e)
    }
}