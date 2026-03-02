import { z } from 'zod'

export const createStackSchema = z.object({
    title: z.string()
})

export const updateStackSchema = z.object({
    id: z.string(),
    title: z.string()
})

export const stackIdParamsSchema = z.object({
    id: z.string()
})