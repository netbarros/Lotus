
import { z } from 'zod';

export const AlexaSkillRequestSchema = z.object({
    version: z.string(),
    session: z.object({
        new: z.boolean(),
        sessionId: z.string(),
        application: z.object({
            applicationId: z.string(),
        }),
        user: z.object({
            userId: z.string(),
            accessToken: z.string().optional(),
        }),
    }),
    request: z.object({
        type: z.string(),
        requestId: z.string(),
        timestamp: z.string(),
        locale: z.string().optional(),
        intent: z.object({
            name: z.string(),
            slots: z.record(z.any()).optional(),
        }).optional(),
    }),
});

export type AlexaSkillRequest = z.infer<typeof AlexaSkillRequestSchema>;
