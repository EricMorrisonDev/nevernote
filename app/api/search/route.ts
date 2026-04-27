import { requireUser } from "@/lib/session"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { handleApiError } from "@/lib/errorResponse"
import type { SearchHit } from "@/lib/types/search"

export async function GET(request: Request) {
    try {
        const url = new URL(request.url)
        const raw = url.searchParams.get("q")
        const term = raw?.trim() ?? ""

        if (term.length < 3) {
            return NextResponse.json({ data: [] as SearchHit[] })
        }

        const user = await requireUser()
        if (user instanceof NextResponse) return user

        const [stacks, notebooks, notesByTitle, notesByContent] = await Promise.all([
            prisma.stack.findMany({
                where: {
                    userId: user.id,
                    title: { contains: term, mode: "insensitive" },
                },
                orderBy: { createdAt: "desc" },
            }),

            prisma.notebook.findMany({
                where: {
                    userId: user.id,
                    title: { contains: term, mode: "insensitive" },
                },
                orderBy: { createdAt: "desc" },
                include: {
                    stack: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            }),

            prisma.note.findMany({
                where: {
                    userId: user.id,
                    title: { contains: term, mode: "insensitive" },
                },
                orderBy: { createdAt: "desc" },
                include: {
                    notebook: {
                        select: {
                            id: true,
                            title: true,
                            stack: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }
                }
            }),

            prisma.note.findMany({
                where: {
                    userId: user.id,
                    content: { contains: term, mode: "insensitive" },
                    NOT: {
                        title: { contains: term, mode: "insensitive" },
                    },
                },
                orderBy: { createdAt: "desc" },
                include: {
                    notebook: {
                        select: {
                            id: true,
                            title: true,
                            stack: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }
                }
            }),
        ])

        const data: SearchHit[] = [
            ...stacks.map((s) => ({
                kind: "stack" as const,
                id: s.id,
                title: s.title,
                createdAt: s.createdAt.toISOString(),
            })),
            ...notebooks.map((n) => ({
                kind: "notebook" as const,
                id: n.id,
                title: n.title,
                stackId: n.stackId,
                stackTitle: n.stack?.title,
                createdAt: n.createdAt.toISOString(),
            })),
            ...notesByTitle.map((n) => ({
                kind: "note" as const,
                id: n.id,
                title: n.title,
                notebookId: n.notebookId,
                notebookTitle: n.notebook?.title,
                stackId: n.notebook?.stack?.id,
                stackTitle: n.notebook?.stack?.title,
                match: "title" as const,
                createdAt: n.createdAt.toISOString(),
            })),
            ...notesByContent.map((n) => ({
                kind: "note" as const,
                id: n.id,
                title: n.title,
                notebookId: n.notebook?.id,
                notebookTitle: n.notebook?.title,
                stackId: n.notebook?.stack?.id,
                stackTitle: n.notebook?.stack?.title,
                match: "content" as const,
                createdAt: n.createdAt.toISOString(),
            })),
        ]

        return NextResponse.json({ data })
    } catch (e) {
        return handleApiError(e)
    }
}
