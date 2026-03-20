import { requireUser } from "@/lib/session";
import { requireValidation } from "@/lib/zodValidation";
import { createNotebookSchema } from "@/lib/validations/notebooks";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/errorResponse";

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

export async function POST(request: Request) {

    try{
        // parse and validate req body
        const body = await request.json()
        const validated = requireValidation(createNotebookSchema, body)
        if(validated instanceof NextResponse) return validated

        // get user
        const user = await requireUser()
        if(user instanceof NextResponse) return user

        // get stack id if it exists
        const stackId = validated.data?.stackId ?? undefined

        // if we have a stack id, check it matches user
        if(stackId){
            const match = await ensureStackMatchesUser(stackId, user.id)
            if(match instanceof NextResponse) return match
        }

        // create the new noteboook
        const newNotebook = await prisma.notebook.create({
            data: {
                title: validated.data.title,
                userId: user.id
            }
        })

        // return the notebook
        return NextResponse.json(
            {data: newNotebook},
            {status: 201}
        )

    } catch (e) {
        return handleApiError(e)
    }
}

export async function GET (request: Request) {

    try{

        const result = await requireUser()
        if (result instanceof NextResponse) return result
        const user = result

        const url = new URL(request.url)
        const stackId = url.searchParams.get('stackId') ?? undefined

        if(stackId){
            const result = await ensureStackMatchesUser(stackId, user.id)
            if(result instanceof NextResponse) return result
        }

        const notebooks = await prisma.notebook.findMany({
            where: {
                userId: user.id,
                stackId
            }
        })

        return NextResponse.json(
            {data: notebooks}
        )
    } catch (e) {
        return handleApiError(e)
    }
}