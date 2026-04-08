import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
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


