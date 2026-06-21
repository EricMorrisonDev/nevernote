import type { Note } from "@/lib/types/api"

export const MIN_GAP = 200
export const ORDER_STEP = 1000

export function underMinGap(pred: number, succ: number) {
    return succ - pred < MIN_GAP
}

export function needsRebalance(pred: number, succ: number) {
    return pred >= succ || underMinGap(pred, succ)
}

export function computeOrderBetween(pred: number, succ: number): number | null {
    if (pred >= succ) return null
    return (pred + succ) / 2
}

export function computeOrderAtEnd(pred: number): number {
    return pred + ORDER_STEP
}

export function computeOrderAtStart(succ: number): number {
    return succ - ORDER_STEP
}

export function computeCustomOrderFromNeighborOrders(
    predOrder: number | null | undefined,
    succOrder: number | null | undefined
): number | null {
    const hasPred = predOrder != null
    const hasSucc = succOrder != null

    if (hasPred && hasSucc) {
        return computeOrderBetween(predOrder!, succOrder!)
    }
    if (hasPred && !hasSucc) {
        return computeOrderAtEnd(predOrder!)
    }
    if (!hasPred && hasSucc) {
        return computeOrderAtStart(succOrder!)
    }
    return null
}

export function computeCustomOrderAfterMove(
    afterId: string | undefined,
    beforeId: string | undefined,
    byId: Map<string, Note>
): number | null {
    const pred = afterId ? byId.get(afterId) ?? null : null
    const succ = beforeId ? byId.get(beforeId) ?? null : null

    if (afterId && !pred) return null
    if (beforeId && !succ) return null

    return computeCustomOrderFromNeighborOrders(
        pred?.customOrder ?? null,
        succ?.customOrder ?? null
    )
}
