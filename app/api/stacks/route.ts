import { requireValidation } from "@/lib/zodValidation"
import { createStackSchema } from "@/lib/validations/stacks"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/errorResponse"
import { requireUser } from "@/lib/session"

export async function POST(request: Request) {

    try{
        const body = await request.json()
        const validated = requireValidation(createStackSchema, body)
        if(validated instanceof NextResponse) return validated
    
        const user = await requireUser()
        if(user instanceof NextResponse) return user

        const { title, notebooks } = validated.data
        const notebookIds = [...new Set(notebooks)]

        const newStack = await prisma.$transaction(async (tx) => {
            const stack = await tx.stack.create({
                data: {
                    title,
                    userId: user.id,
                },
            })

            const attached = await tx.notebook.updateMany({
                where: {
                    id: { in: notebookIds },
                    userId: user.id,
                    stackId: null,
                },
                data: { stackId: stack.id },
            })

            if (attached.count !== notebookIds.length) {
                throw new Error("NOTEBOOK_ATTACH_FAILED")
            }

            return stack
        })

        return NextResponse.json(
            { data: newStack },
            { status: 201 }
        )
    } catch (e) {
        if (e instanceof Error && e.message === "NOTEBOOK_ATTACH_FAILED") {
            return NextResponse.json(
                {
                    error: "One or more notebooks could not be added. They must exist, belong to you, and not already be in a stack.",
                },
                { status: 400 }
            )
        }
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
            },
            orderBy: {
                createdAt: "asc"
            }
        })
    
        return NextResponse.json(
            {data: stacks},
            {status: 200}
        )
    } catch (e) {
            handleApiError(e)
    }
}

