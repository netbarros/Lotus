/**
 * ═══════════════════════════════════════════════════════════════════════════
 * @magicsaas/voice-bridge - Voice Type Definitions
 * Part of the Cognitive Mesh OS Layer 11
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// VOICE PROVIDER TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const VoiceProviderSchema = z.enum([
    'whisper',         // OpenAI Whisper (STT)
    'whisper_local',   // Local Whisper server
    'alexa',           // Amazon Alexa
    'google',          // Google Speech
    'azure',           // Azure Cognitive Services
    'elevenlabs',      // ElevenLabs (TTS)
]);

export type VoiceProvider = z.infer<typeof VoiceProviderSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// TRANSCRIPTION REQUEST/RESPONSE
// ═══════════════════════════════════════════════════════════════════════════

export const TranscriptionRequestSchema = z.object({
    audio_data: z.union([z.instanceof(Buffer), z.string()]), // Buffer or base64
    format: z.enum(['mp3', 'wav', 'webm', 'ogg', 'm4a', 'flac']).default('webm'),
    language: z.string().default('pt-BR'),
    prompt?: z.string(),           // Context for better transcription
    temperature: z.number().min(0).max(1).default(0),
    timestamp_granularities: z.array(z.enum(['word', 'segment'])).optional(),
});

export type TranscriptionRequest = z.infer<typeof TranscriptionRequestSchema>;

export const TranscriptionResponseSchema = z.object({
    id: z.string(),
    text: z.string(),
    language: z.string(),
    duration_seconds: z.number(),
    words: z.array(z.object({
        word: z.string(),
        start: z.number(),
        end: z.number(),
    })).optional(),
    confidence: z.number().min(0).max(1).optional(),
    provider: VoiceProviderSchema,
    processing_time_ms: z.number(),
});

export type TranscriptionResponse = z.infer<typeof TranscriptionResponseSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// TEXT-TO-SPEECH TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const TTSRequestSchema = z.object({
    text: z.string().max(5000),
    voice: z.string().default('alloy'),        // Voice ID
    speed: z.number().min(0.25).max(4).default(1),
    format: z.enum(['mp3', 'opus', 'aac', 'flac']).default('mp3'),
    model: z.enum(['tts-1', 'tts-1-hd', 'eleven_multilingual_v2']).default('tts-1'),
});

export type TTSRequest = z.infer<typeof TTSRequestSchema>;

export const TTSResponseSchema = z.object({
    id: z.string(),
    audio_data: z.instanceof(Buffer),
    format: z.string(),
    duration_seconds: z.number().optional(),
    provider: VoiceProviderSchema,
    processing_time_ms: z.number(),
});

export type TTSResponse = z.infer<typeof TTSResponseSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// ALEXA SKILL TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const AlexaRequestTypeSchema = z.enum([
    'LaunchRequest',
    'IntentRequest',
    'SessionEndedRequest',
    'CanFulfillIntentRequest',
]);

export type AlexaRequestType = z.infer<typeof AlexaRequestTypeSchema>;

export const AlexaIntentSchema = z.object({
    name: z.string(),
    confirmationStatus: z.enum(['NONE', 'CONFIRMED', 'DENIED']).optional(),
    slots: z.record(z.object({
        name: z.string(),
        value: z.string().optional(),
        confirmationStatus: z.enum(['NONE', 'CONFIRMED', 'DENIED']).optional(),
        resolutions: z.object({
            resolutionsPerAuthority: z.array(z.object({
                authority: z.string(),
                status: z.object({ code: z.string() }),
                values: z.array(z.object({
                    value: z.object({ name: z.string(), id: z.string() }),
                })),
            })),
        }).optional(),
    })).optional(),
});

export type AlexaIntent = z.infer<typeof AlexaIntentSchema>;

export const AlexaRequestSchema = z.object({
    version: z.string(),
    session: z.object({
        new: z.boolean(),
        sessionId: z.string(),
        application: z.object({ applicationId: z.string() }),
        user: z.object({
            userId: z.string(),
            accessToken: z.string().optional(),
        }),
        attributes: z.record(z.unknown()).optional(),
    }).optional(),
    context: z.object({
        System: z.object({
            application: z.object({ applicationId: z.string() }),
            user: z.object({
                userId: z.string(),
                accessToken: z.string().optional(),
            }),
            device: z.object({
                deviceId: z.string(),
                supportedInterfaces: z.record(z.unknown()).optional(),
            }).optional(),
            apiEndpoint: z.string().optional(),
            apiAccessToken: z.string().optional(),
        }),
        Viewport: z.record(z.unknown()).optional(),
    }),
    request: z.object({
        type: AlexaRequestTypeSchema,
        requestId: z.string(),
        timestamp: z.string(),
        locale: z.string(),
        intent: AlexaIntentSchema.optional(),
        reason: z.string().optional(),
        error: z.object({
            type: z.string(),
            message: z.string(),
        }).optional(),
    }),
});

export type AlexaRequest = z.infer<typeof AlexaRequestSchema>;

export interface AlexaResponse {
    version: string;
    sessionAttributes?: Record<string, unknown>;
    response: {
        outputSpeech?: {
            type: 'PlainText' | 'SSML';
            text?: string;
            ssml?: string;
        };
        card?: {
            type: 'Simple' | 'Standard' | 'LinkAccount';
            title?: string;
            content?: string;
            text?: string;
            image?: {
                smallImageUrl: string;
                largeImageUrl: string;
            };
        };
        reprompt?: {
            outputSpeech: {
                type: 'PlainText' | 'SSML';
                text?: string;
                ssml?: string;
            };
        };
        shouldEndSession: boolean;
        directives?: Array<Record<string, unknown>>;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// DICTATION SESSION (MedicSaaS Use Case)
// ═══════════════════════════════════════════════════════════════════════════

export const DictationSessionSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    petala: z.string(),
    user_id: z.string().uuid(),
    patient_id: z.string().uuid().optional(),
    record_type: z.enum([
        'medical_record',
        'prescription',
        'clinical_note',
        'soap_note',
        'referral',
        'discharge_summary',
        'consultation',
        'procedure_note',
    ]),
    status: z.enum(['recording', 'processing', 'completed', 'failed', 'cancelled']),
    started_at: z.date(),
    ended_at: z.date().optional(),
    audio_chunks: z.array(z.object({
        chunk_id: z.string(),
        timestamp: z.date(),
        duration_ms: z.number(),
        processed: z.boolean(),
        text: z.string().optional(),
    })),
    full_transcript: z.string().optional(),
    structured_data: z.record(z.unknown()).optional(), // Parsed SOAP, etc.
    metadata: z.object({
        language: z.string(),
        total_duration_seconds: z.number(),
        word_count: z.number(),
    }).optional(),
});

export type DictationSession = z.infer<typeof DictationSessionSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// VOICE BRIDGE CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export interface VoiceBridgeConfig {
    tenant_id: string;
    petala: string;
    redis_url: string;

    // Whisper (STT)
    whisper: {
        api_key: string;        // OpenAI API key
        model: 'whisper-1';
        base_url?: string;      // For local Whisper server
    };

    // TTS (optional)
    tts?: {
        provider: 'openai' | 'elevenlabs';
        api_key: string;
        default_voice?: string;
    };

    // Alexa (optional)
    alexa?: {
        skill_id: string;
        verify_signature: boolean;
        intents: Map<string, AlexaIntentHandler>;
    };
}

export type AlexaIntentHandler = (
    request: AlexaRequest,
    session: Record<string, unknown>
) => Promise<AlexaResponse>;

// ═══════════════════════════════════════════════════════════════════════════
// VOICE COMMANDS (for MedicSaaS)
// ═══════════════════════════════════════════════════════════════════════════

export const VoiceCommandSchema = z.object({
    type: z.enum([
        'start_dictation',
        'stop_dictation',
        'pause_dictation',
        'resume_dictation',
        'cancel_dictation',
        'save_dictation',
        'read_back',
        'correct',
        'next_field',
        'previous_field',
        'check_schedule',
        'next_patient',
        'call_patient',
        'set_room_status',
    ]),
    parameters: z.record(z.unknown()).optional(),
    source: z.enum(['alexa', 'web', 'mobile', 'voice_button']),
    timestamp: z.date(),
});

export type VoiceCommand = z.infer<typeof VoiceCommandSchema>;
