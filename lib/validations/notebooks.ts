import { z } from 'zod'

export const createNotebookSchema = z.object({
  title: z.string(),
  stackId: z.string().optional().nullable(),
})

export const updateNotebookSchema = z.object({
  title: z.string().optional(),
  stackId: z.string().optional().nullable(),
})

export const notebookIdParamsSchema = z.object({
  id: z.string(),
})


