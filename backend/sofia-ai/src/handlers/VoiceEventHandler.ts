/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VOICE EVENT HANDLER - Sofia AI Integration with Voice Bridge
 * Cognitive Mesh OS Layer 11 - Medical Dictation & Voice Commands
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Handles voice events from @magicsaas/voice-bridge package:
 * - Speech-to-text transcription results
 * - Medical dictation processing
 * - Voice command recognition
 * - Alexa skill intents
 */

import { EventStore } from '../events/EventStore.js';
import { logger } from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface VoiceEvent {
    id: string;
    type: 'transcription' | 'dictation' | 'command' | 'alexa';
    userId: string;
    tenantId: string;
    timestamp: Date;
    payload: Record<string, unknown>;
}

export interface TranscriptionEvent extends VoiceEvent {
    type: 'transcription';
    payload: {
        text: string;
        language: string;
        confidence: number;
        duration: number; // seconds
        segments?: Array<{
            text: string;
            start: number;
            end: number;
            confidence: number;
        }>;
    };
}

export interface DictationEvent extends VoiceEvent {
    type: 'dictation';
    payload: {
        rawText: string;
        processedText?: string;
        category: 'soap_note' | 'prescription' | 'referral' | 'general';
        patientId?: string;
        appointmentId?: string;
        extractedData?: {
            chiefComplaint?: string;
            subjective?: string;
            objective?: string;
            assessment?: string;
            plan?: string;
            medications?: Array<{
                name: string;
                dosage?: string;
                frequency?: string;
            }>;
            diagnoses?: Array<{
                code?: string;
                description: string;
            }>;
        };
    };
}

export interface VoiceCommandEvent extends VoiceEvent {
    type: 'command';
    payload: {
        command: string;
        intent: string;
        entities: Record<string, string>;
        confidence: number;
        action?: string;
    };
}

export interface AlexaIntentEvent extends VoiceEvent {
    type: 'alexa';
    payload: {
        intentName: string;
        slots: Record<string, { name: string; value: string }>;
        sessionId: string;
        requestType: 'LaunchRequest' | 'IntentRequest' | 'SessionEndedRequest';
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// VOICE EVENT HANDLER CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class VoiceEventHandler {
    private eventStore: EventStore;
    private handlers: Map<string, (event: VoiceEvent) => Promise<void>>;
    private ehrCallback?: (data: DictationEvent['payload']) => Promise<void>;

    constructor(eventStore: EventStore) {
        this.eventStore = eventStore;
        this.handlers = new Map();
        this.registerDefaultHandlers();
    }

    /**
     * Register EHR callback for dictation processing
     */
    setEHRCallback(callback: (data: DictationEvent['payload']) => Promise<void>): void {
        this.ehrCallback = callback;
        logger.info('EHR callback registered for dictation events');
    }

    /**
     * Register default event handlers
     */
    private registerDefaultHandlers(): void {
        // Transcription handler
        this.handlers.set('transcription', async (event: VoiceEvent) => {
            const transcription = event as TranscriptionEvent;
            logger.info({
                event: 'voice:transcription',
                language: transcription.payload.language,
                confidence: transcription.payload.confidence,
                duration: transcription.payload.duration,
            });

            await this.eventStore.append({
                streamId: `voice:${transcription.userId}`,
                type: 'TranscriptionCompleted',
                data: {
                    text: transcription.payload.text,
                    language: transcription.payload.language,
                    confidence: transcription.payload.confidence,
                    duration: transcription.payload.duration,
                },
                metadata: {
                    tenantId: transcription.tenantId,
                    hasSegments: !!transcription.payload.segments,
                },
            });
        });

        // Dictation handler (medical)
        this.handlers.set('dictation', async (event: VoiceEvent) => {
            const dictation = event as DictationEvent;
            logger.info({
                event: 'voice:dictation',
                category: dictation.payload.category,
                patientId: dictation.payload.patientId,
                hasExtractedData: !!dictation.payload.extractedData,
            });

            // Store dictation event
            await this.eventStore.append({
                streamId: `dictation:${dictation.payload.patientId || dictation.userId}`,
                type: 'MedicalDictationReceived',
                data: dictation.payload,
                metadata: {
                    tenantId: dictation.tenantId,
                    userId: dictation.userId,
                    appointmentId: dictation.payload.appointmentId,
                },
            });

            // Call EHR callback if registered
            if (this.ehrCallback && dictation.payload.patientId) {
                try {
                    await this.ehrCallback(dictation.payload);
                    logger.info({
                        patientId: dictation.payload.patientId,
                    }, 'Dictation sent to EHR');
                } catch (error) {
                    logger.error({ error }, 'Failed to send dictation to EHR');
                }
            }
        });

        // Voice command handler
        this.handlers.set('command', async (event: VoiceEvent) => {
            const command = event as VoiceCommandEvent;
            logger.info({
                event: 'voice:command',
                intent: command.payload.intent,
                command: command.payload.command,
                confidence: command.payload.confidence,
            });

            await this.eventStore.append({
                streamId: `commands:${command.tenantId}`,
                type: 'VoiceCommandReceived',
                data: command.payload,
                metadata: {
                    userId: command.userId,
                },
            });

            // Execute action if specified
            if (command.payload.action) {
                await this.executeAction(command);
            }
        });

        // Alexa handler
        this.handlers.set('alexa', async (event: VoiceEvent) => {
            const alexa = event as AlexaIntentEvent;
            logger.info({
                event: 'voice:alexa',
                intentName: alexa.payload.intentName,
                requestType: alexa.payload.requestType,
            });

            await this.eventStore.append({
                streamId: `alexa:${alexa.payload.sessionId}`,
                type: 'AlexaIntentReceived',
                data: alexa.payload,
                metadata: {
                    tenantId: alexa.tenantId,
                    userId: alexa.userId,
                },
            });
        });
    }

    /**
     * Execute voice command action
     */
    private async executeAction(command: VoiceCommandEvent): Promise<void> {
        const { action, entities } = command.payload;

        switch (action) {
            case 'room_status':
                logger.info({ roomId: entities.room }, 'Executing: Get room status');
                // Integration with IoT handler would go here
                break;

            case 'patient_lookup':
                logger.info({ patientName: entities.patient }, 'Executing: Patient lookup');
                // Integration with EHR would go here
                break;

            case 'schedule_appointment':
                logger.info({ date: entities.date, time: entities.time }, 'Executing: Schedule appointment');
                // Integration with scheduling would go here
                break;

            default:
                logger.warn({ action }, 'Unknown voice command action');
        }
    }

    /**
     * Process incoming voice event
     */
    async processEvent(event: VoiceEvent): Promise<void> {
        const handler = this.handlers.get(event.type);

        if (!handler) {
            logger.warn({ eventType: event.type }, 'No handler for voice event type');
            return;
        }

        try {
            await handler(event);
        } catch (error) {
            logger.error({ error, event }, 'Error processing voice event');
            throw error;
        }
    }

    /**
     * Process SOAP note dictation and extract structured data
     */
    async processSOAPDictation(
        rawText: string,
        metadata: { userId: string; tenantId: string; patientId: string }
    ): Promise<DictationEvent['payload']['extractedData']> {
        // Simple extraction logic - in production would use NLP/LLM
        const sections = {
            subjective: this.extractSection(rawText, ['subjective', 'S:', 'patient reports']),
            objective: this.extractSection(rawText, ['objective', 'O:', 'examination shows']),
            assessment: this.extractSection(rawText, ['assessment', 'A:', 'diagnosis']),
            plan: this.extractSection(rawText, ['plan', 'P:', 'we will']),
        };

        // Store as dictation event
        await this.processEvent({
            id: `dictation-${Date.now()}`,
            type: 'dictation',
            userId: metadata.userId,
            tenantId: metadata.tenantId,
            timestamp: new Date(),
            payload: {
                rawText,
                category: 'soap_note',
                patientId: metadata.patientId,
                extractedData: sections,
            },
        });

        return sections;
    }

    /**
     * Extract section from dictation text
     */
    private extractSection(text: string, markers: string[]): string | undefined {
        const lowerText = text.toLowerCase();

        for (const marker of markers) {
            const idx = lowerText.indexOf(marker.toLowerCase());
            if (idx !== -1) {
                // Extract text after marker until next section or end
                const start = idx + marker.length;
                const remaining = text.substring(start);
                const nextSection = remaining.search(/\b(subjective|objective|assessment|plan|S:|O:|A:|P:)\b/i);

                return remaining.substring(0, nextSection > 0 ? nextSection : undefined).trim();
            }
        }

        return undefined;
    }

    /**
     * Register custom event handler
     */
    registerHandler(
        eventType: string,
        handler: (event: VoiceEvent) => Promise<void>
    ): void {
        this.handlers.set(eventType, handler);
        logger.info({ eventType }, 'Registered custom voice event handler');
    }
}

export default VoiceEventHandler;
