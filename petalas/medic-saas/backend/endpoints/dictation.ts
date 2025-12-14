/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MedicSaaS - Medical Dictation Endpoint
 * Uses @magicsaas/voice-bridge for speech-to-text transcription
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { Redis } from 'ioredis';
import Redis from 'ioredis';
import {
    createVoiceBridge,
    type VoiceBridgeInstance,
    type DictationSession,
} from '@magicsaas/voice-bridge';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const config = {
    tenant_id: process.env.TENANT_ID || 'default',
    petala: 'medic-saas',
    redis_url: process.env.REDIS_URL || 'redis://localhost:6379',
    whisper: {
        api_key: process.env.OPENAI_API_KEY || '',
        model: 'whisper-1' as const,
    },
    alexa: {
        skill_id: process.env.ALEXA_SKILL_ID || 'amzn1.ask.skill.xxx',
        verify_signature: process.env.NODE_ENV === 'production',
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// VOICE BRIDGE SERVICE
// ═══════════════════════════════════════════════════════════════════════════

let voiceBridge: VoiceBridgeInstance | null = null;
let redis: Redis | null = null;

/**
 * Initialize Voice Bridge
 */
export async function initializeVoiceBridge(): Promise<void> {
    if (voiceBridge) return;

    redis = new Redis(config.redis_url);
    voiceBridge = createVoiceBridge(config, redis);

    console.log('[MedicSaaS] Voice Bridge initialized');

    // Set up dictation event handlers
    voiceBridge.dictation.on('session_started', (session: DictationSession) => {
        console.log(`[MedicSaaS] Dictation session started: ${session.id}`);
    });

    voiceBridge.dictation.on('chunk_transcribed', ({ session, transcription }) => {
        console.log(`[MedicSaaS] Transcribed chunk for session ${session.id}: ${transcription.text.substring(0, 50)}...`);
    });

    voiceBridge.dictation.on('session_completed', (session: DictationSession) => {
        console.log(`[MedicSaaS] Dictation completed: ${session.metadata?.word_count} words`);
        // Save to EHR system
        saveTranscriptionToEHR(session);
    });
}

/**
 * Save completed transcription to EHR
 */
async function saveTranscriptionToEHR(session: DictationSession): Promise<void> {
    // This would integrate with Directus in production
    console.log(`[MedicSaaS] Saving transcription to patient ${session.patient_id}'s record`);
    // await directus.items('medical_records').createOne({
    //   patient_id: session.patient_id,
    //   type: session.record_type,
    //   content: session.full_transcript,
    //   structured_data: session.structured_data,
    //   created_by: session.user_id,
    // });
}

// ═══════════════════════════════════════════════════════════════════════════
// API HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/dictation/start - Start a new dictation session
 */
export async function startDictationSession(
    userId: string,
    patientId: string,
    recordType: DictationSession['record_type']
): Promise<DictationSession> {
    if (!voiceBridge) {
        await initializeVoiceBridge();
    }

    return voiceBridge!.dictation.startSession({
        user_id: userId,
        patient_id: patientId,
        record_type: recordType,
    });
}

/**
 * POST /api/dictation/:sessionId/chunk - Add audio chunk
 */
export async function addDictationChunk(
    sessionId: string,
    audioData: Buffer,
    durationMs: number
): Promise<{ text?: string }> {
    if (!voiceBridge) {
        await initializeVoiceBridge();
    }

    const result = await voiceBridge!.dictation.addAudioChunk(sessionId, audioData, durationMs);
    return { text: result?.text };
}

/**
 * POST /api/dictation/:sessionId/complete - Complete session
 */
export async function completeDictationSession(
    sessionId: string
): Promise<DictationSession> {
    if (!voiceBridge) {
        await initializeVoiceBridge();
    }

    return voiceBridge!.dictation.completeSession(sessionId);
}

/**
 * POST /api/dictation/:sessionId/cancel - Cancel session
 */
export async function cancelDictationSession(sessionId: string): Promise<void> {
    if (!voiceBridge) {
        await initializeVoiceBridge();
    }

    await voiceBridge!.dictation.cancelSession(sessionId);
}

/**
 * GET /api/dictation/:sessionId - Get session status
 */
export async function getDictationSession(
    sessionId: string
): Promise<DictationSession | null> {
    if (!voiceBridge) {
        await initializeVoiceBridge();
    }

    return voiceBridge!.dictation.getSession(sessionId);
}

/**
 * GET /api/dictation/user/:userId - Get user's active sessions
 */
export async function getUserDictationSessions(
    userId: string
): Promise<DictationSession[]> {
    if (!voiceBridge) {
        await initializeVoiceBridge();
    }

    return voiceBridge!.dictation.getUserSessions(userId);
}

/**
 * POST /api/transcribe - One-shot transcription (no session)
 */
export async function transcribeAudio(
    audioData: Buffer,
    options?: {
        format?: 'mp3' | 'wav' | 'webm' | 'ogg' | 'm4a' | 'flac';
        specialty?: string;
    }
): Promise<{ text: string; duration_seconds: number }> {
    if (!voiceBridge) {
        await initializeVoiceBridge();
    }

    const result = await voiceBridge!.transcribe(audioData, {
        format: options?.format,
        medical: true,
        specialty: options?.specialty,
    });

    return {
        text: result.text,
        duration_seconds: result.duration_seconds,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// ALEXA SKILL WEBHOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/alexa/webhook - Handle Alexa skill requests
 */
export async function handleAlexaWebhook(
    request: unknown,
    headers: Record<string, string>
): Promise<unknown> {
    if (!voiceBridge) {
        await initializeVoiceBridge();
    }

    return voiceBridge!.handleAlexaRequest(request, headers);
}

/**
 * Cleanup connections
 */
export async function shutdown(): Promise<void> {
    if (redis) {
        await redis.quit();
        redis = null;
    }
    voiceBridge = null;
}
