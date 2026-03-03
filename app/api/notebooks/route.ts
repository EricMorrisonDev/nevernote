import { getCurrentUser } from "@/lib/session";
import { createNotebookSchema } from "@/lib/validations/notebooks";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"
import { flattenError } from "zod/v4/core";

export async function POST(request: Request) {

    try{
        const body = await request.json()
        const validated = createNotebookSchema.safeParse(body)

        if(!validated.success){
            return NextResponse.json(
                {error: "Validation failed", details: flattenError(validated.error)},
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

        const stackId = validated.data.stackId ?? undefined

        if(stackId){
            const matchesUser = await prisma.stack.findFirst({
                where: {
                    id: stackId,
                    userId: user.id
                }
            })

            if(!matchesUser){
                return NextResponse.json(
                    {error: "Stack not found"},
                    {status: 400}
                )
            }
        }

        const newNotebook = await prisma.notebook.create({
            data: {
                title: validated.data.title,
                userId: user.id,
                stackId
            }
        })

        return NextResponse.json(
            {data: newNotebook},
            {status: 201}
        )

    } catch (e) {
        throw e
    }
}

export async function GET (request: Request) {

    try{

        const user = await getCurrentUser()

        if(!user){
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }

        const url = new URL(request.url)
        const stackId = url.searchParams.get('stackId') ?? undefined

        if(stackId){
            const stackIsValid = await prisma.stack.findFirst({
                where: {
                    id: stackId,
                    userId: user.id
                }
            })
    
            if(!stackIsValid){
                return NextResponse.json(
                    {error: "Stack does not match user"},
                    {status: 400}
                )
            }
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
        throw (e)
    }
}