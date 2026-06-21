import "server-only"

import { prisma } from "@/lib/db"
import type { Note } from "@/lib/types/api"
import {
    ORDER_STEP,
    computeCustomOrderFromNeighborOrders,
    needsRebalance,
} from "@/app/lib/customOrder"

const customOrderSort = [
    { customOrder: "asc" as const },
    { createdAt: "asc" as const },
    { id: "asc" as const },
]

type DbNote = Awaited<ReturnType<typeof prisma.note.findMany>>[number]

function toApiNote(note: DbNote): Note {
    return {
        id: note.id,
        title: note.title,
        content: note.content,
        notebookId: note.notebookId,
        userId: note.userId,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        customOrder: note.customOrder,
    }
}

async function fetchNeighborOrders(
    notebookId: string,
    userId: string,
    afterId?: string,
    beforeId?: string
): Promise<
    | { ok: true; predOrder: number | null; succOrder: number | null }
    | { ok: false; error: string }
> {
    const [predNote, succNote] = await Promise.all([
        afterId
            ? prisma.note.findFirst({
                  where: { id: afterId, notebookId, userId },
                  select: { customOrder: true },
              })
            : null,
        beforeId
            ? prisma.note.findFirst({
                  where: { id: beforeId, notebookId, userId },
                  select: { customOrder: true },
              })
            : null,
    ])

    if (afterId && !predNote) {
        return { ok: false, error: "afterId not found in this notebook" }
    }
    if (beforeId && !succNote) {
        return { ok: false, error: "beforeId not found in this notebook" }
    }

    return {
        ok: true,
        predOrder: predNote?.customOrder ?? null,
        succOrder: succNote?.customOrder ?? null,
    }
}

function neighborOrdersFromNotes(
    notes: Note[],
    afterId?: string,
    beforeId?: string
): { predOrder: number | null; succOrder: number | null } {
    const byId = new Map(notes.map((n) => [n.id, n]))
    const pred = afterId ? byId.get(afterId) ?? null : null
    const succ = beforeId ? byId.get(beforeId) ?? null : null

    return {
        predOrder: pred?.customOrder ?? null,
        succOrder: succ?.customOrder ?? null,
    }
}

export async function rebalanceNotebook(
    notebookId: string,
    userId: string
): Promise<Note[]> {
    const notes = await prisma.note.findMany({
        where: { notebookId, userId },
        orderBy: customOrderSort,
    })

    await prisma.$transaction(
        notes.map((note, i) =>
            prisma.note.update({
                where: { id: note.id, userId },
                data: {
                    customOrder: (i + 1) * ORDER_STEP,
                    updatedAt: note.updatedAt,
                },
            })
        )
    )

    return prisma.note
        .findMany({
            where: { notebookId, userId },
            orderBy: customOrderSort,
        })
        .then((notes) => notes.map(toApiNote))
}

export type ResolveCustomOrderResult =
    | {
          ok: true
          newOrder: number
          rebalancedNotes: Note[] | null
      }
    | { ok: false; error: string }

export async function resolveCustomOrderForMove({
    notebookId,
    userId,
    afterId,
    beforeId,
}: {
    notebookId: string
    userId: string
    afterId?: string
    beforeId?: string
}): Promise<ResolveCustomOrderResult> {
    const neighbors = await fetchNeighborOrders(
        notebookId,
        userId,
        afterId,
        beforeId
    )
    if (!neighbors.ok) {
        return neighbors
    }

    let { predOrder, succOrder } = neighbors
    let rebalancedNotes: Note[] | null = null

    if (predOrder != null && succOrder != null && needsRebalance(predOrder, succOrder)) {
        rebalancedNotes = await rebalanceNotebook(notebookId, userId)
        const refreshed = neighborOrdersFromNotes(rebalancedNotes, afterId, beforeId)
        predOrder = refreshed.predOrder
        succOrder = refreshed.succOrder
    }

    const newOrder = computeCustomOrderFromNeighborOrders(predOrder, succOrder)
    if (newOrder === null) {
        return { ok: false, error: "Invalid reorder request" }
    }

    return { ok: true, newOrder, rebalancedNotes }
}
