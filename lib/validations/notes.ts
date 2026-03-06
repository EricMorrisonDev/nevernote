import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string(),
  content: z.string(),
  notebookId: z.string().optional(),
})

export const updateNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  notebookId: z.string().nullish(), // undefined = don't change, null = remove from notebook
})

export const noteIdParamsSchema = z.object({
  id: z.string(),
})

export const listNotesQuerySchema = z.object({
  notebookId: z.string().optional(),
})


