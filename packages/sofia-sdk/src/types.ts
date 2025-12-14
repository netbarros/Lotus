
import { z } from 'zod';

export const IntentionRequestSchema = z.object({
    intention: z.string(),
    context: z.record(z.unknown()).optional(),
    petala: z.string().optional(),
    user_id: z.string().optional(),
});

export type IntentionRequest = z.infer<typeof IntentionRequestSchema>;

export interface SofiaResponse {
    intention: string;
    action: string;
    parameters: Record<string, unknown>;
    confidence: number;
    explanation?: string;
}

export interface GenerationRequest {
    prompt: string;
    model?: string;
    temperature?: number;
    max_tokens?: number;
}
