import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string(),
  content: z.string(),
  notebookId: z.string().min(1),
})

export const updateNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  notebookId: z.string().optional()
})

export const noteIdParamsSchema = z.object({
  id: z.string(),
})

export const listNotesQuerySchema = z.object({
  notebookId: z.string().min(1).optional(),
})

/** Neighbors in the notebook after removing the moved item from ordering.
 * `afterId` = predecessor (omit = move to start). `beforeId` = successor (omit = move to end). */
export const reorderNoteBodySchema = z
  .object({
    afterId: z.string().min(1).optional(),
    beforeId: z.string().min(1).optional(),
  })
  .refine((d) => d.afterId != null || d.beforeId != null, {
    message: "Provide at least one of afterId or beforeId",
    path: ["afterId"],
  })
  .refine((d) => !d.afterId || !d.beforeId || d.afterId !== d.beforeId, {
    message: "afterId and beforeId must differ",
    path: ["beforeId"],
  })


