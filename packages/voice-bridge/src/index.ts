/**
 * ═══════════════════════════════════════════════════════════════════════════
 * @magicsaas/voice-bridge - Main Entry Point
 * Cognitive Mesh OS Layer 11 - Voice Integration
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Types
export * from './types/voice.types.js';

// Providers
export { WhisperClient, type WhisperClientConfig } from './providers/whisper-client.js';
export { AlexaSkillHandler, type AlexaHandlerConfig } from './providers/alexa-handler.js';

// Services
export { DictationService, type DictationServiceConfig } from './services/dictation-service.js';

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

import type { Redis } from 'ioredis';
import type { VoiceBridgeConfig, AlexaIntentHandler } from './types/voice.types.js';
import { WhisperClient } from './providers/whisper-client.js';
import { AlexaSkillHandler } from './providers/alexa-handler.js';
import { DictationService } from './services/dictation-service.js';

/**
 * Create and configure a Voice Bridge instance
 */
export function createVoiceBridge(config: VoiceBridgeConfig, redis: Redis) {
    // Create Whisper client (STT)
    const whisperClient = new WhisperClient({
        api_key: config.whisper.api_key,
        model: config.whisper.model,
        base_url: config.whisper.base_url,
    });

    // Create Alexa handler if configured
    let alexaHandler: AlexaSkillHandler | undefined;
    if (config.alexa) {
        alexaHandler = new AlexaSkillHandler({
            skill_id: config.alexa.skill_id,
            verify_signature: config.alexa.verify_signature,
            intents: config.alexa.intents ?? AlexaSkillHandler.createMedicSaaSIntents(),
        });
    }

    // Create dictation service
    const dictationService = new DictationService({
        whisper: whisperClient,
        redis,
        tenant_id: config.tenant_id,
        petala: config.petala,
    });

    return {
        whisper: whisperClient,
        alexa: alexaHandler,
        dictation: dictationService,

        /**
         * Transcribe audio to text
         */
        async transcribe(audioData: Buffer | string, options?: {
            format?: 'mp3' | 'wav' | 'webm' | 'ogg' | 'm4a' | 'flac';
            language?: string;
            medical?: boolean;
            specialty?: string;
        }) {
            if (options?.medical) {
                return whisperClient.transcribeMedical(audioData, {
                    format: options.format,
                    specialty: options.specialty,
                });
            }
            return whisperClient.transcribe({
                audio_data: audioData,
                format: options?.format ?? 'webm',
                language: options?.language ?? 'pt-BR',
            });
        },

        /**
         * Handle Alexa request (webhook endpoint)
         */
        async handleAlexaRequest(request: unknown, headers?: Record<string, string>) {
            if (!alexaHandler) {
                throw new Error('Alexa handler not configured');
            }
            return alexaHandler.handleRequest(request as Parameters<typeof alexaHandler.handleRequest>[0], headers);
        },

        /**
         * Register custom Alexa intent
         */
        registerAlexaIntent(intentName: string, handler: AlexaIntentHandler) {
            if (!alexaHandler) {
                throw new Error('Alexa handler not configured');
            }
            alexaHandler.registerIntent(intentName, handler);
        },
    };
}

/**
 * Voice Bridge instance type
 */
export type VoiceBridgeInstance = ReturnType<typeof createVoiceBridge>;
