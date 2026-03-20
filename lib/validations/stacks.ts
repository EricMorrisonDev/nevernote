import { z } from 'zod'

export const createStackSchema = z.object({
    title: z.string().trim().min(1)
})

export const updateStackSchema = z.object({
    id: z.string(),
    title: z.string().trim().min(1)
})

export const stackIdParamsSchema = z.object({
    id: z.string()
})