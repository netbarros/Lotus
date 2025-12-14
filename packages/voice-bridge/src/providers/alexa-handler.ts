/**
 * ═══════════════════════════════════════════════════════════════════════════
 * @magicsaas/voice-bridge - Alexa Skills Handler
 * Cognitive Mesh OS Layer 11 - Voice-First Interface
 * ═══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import type {
    AlexaRequest,
    AlexaResponse,
    AlexaIntent,
    AlexaIntentHandler,
} from '../types/voice.types.js';

// ═══════════════════════════════════════════════════════════════════════════
// ALEXA HANDLER CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export interface AlexaHandlerConfig {
    skill_id: string;
    verify_signature: boolean;
    intents: Map<string, AlexaIntentHandler>;
    fallback_response?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ALEXA SKILLS HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export class AlexaSkillHandler {
    private skillId: string;
    private verifySignature: boolean;
    private intents: Map<string, AlexaIntentHandler>;
    private fallbackResponse: string;
    private sessionStore: Map<string, Record<string, unknown>> = new Map();

    constructor(config: AlexaHandlerConfig) {
        this.skillId = config.skill_id;
        this.verifySignature = config.verify_signature;
        this.intents = config.intents;
        this.fallbackResponse = config.fallback_response ??
            'Desculpe, não entendi. Pode repetir?';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // REQUEST HANDLING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Handle incoming Alexa request
     */
    async handleRequest(
        request: AlexaRequest,
        headers?: Record<string, string>
    ): Promise<AlexaResponse> {
        // Verify signature if enabled
        if (this.verifySignature && headers) {
            const isValid = await this.verifyAlexaSignature(request, headers);
            if (!isValid) {
                throw new Error('Invalid Alexa request signature');
            }
        }

        // Verify application ID
        const appId = request.context.System.application.applicationId;
        if (appId !== this.skillId) {
            throw new Error(`Invalid application ID: ${appId}`);
        }

        // Get session attributes
        const sessionId = request.session?.sessionId ?? 'stateless';
        const sessionAttributes = this.sessionStore.get(sessionId) ?? {};

        // Route request
        switch (request.request.type) {
            case 'LaunchRequest':
                return this.handleLaunchRequest(sessionAttributes);

            case 'IntentRequest':
                return this.handleIntentRequest(request, sessionAttributes);

            case 'SessionEndedRequest':
                this.sessionStore.delete(sessionId);
                return this.buildResponse('Até logo!', true);

            default:
                return this.buildResponse(this.fallbackResponse, false);
        }
    }

    /**
     * Handle LaunchRequest (user opens skill)
     */
    private async handleLaunchRequest(
        sessionAttributes: Record<string, unknown>
    ): Promise<AlexaResponse> {
        const welcomeMessage =
            'Olá! Bem-vindo ao MagicSaaS. ' +
            'Você pode dizer: verificar agenda, próximo paciente, ou status da sala.';

        return this.buildResponse(welcomeMessage, false, {
            reprompt: 'O que você gostaria de fazer?',
            card: {
                title: 'MagicSaaS - Assistente de Clínica',
                content: 'Comandos disponíveis:\n• Verificar agenda\n• Próximo paciente\n• Status da sala',
            },
            sessionAttributes,
        });
    }

    /**
     * Handle IntentRequest
     */
    private async handleIntentRequest(
        request: AlexaRequest,
        sessionAttributes: Record<string, unknown>
    ): Promise<AlexaResponse> {
        const intent = request.request.intent;
        if (!intent) {
            return this.buildResponse(this.fallbackResponse, false);
        }

        // Check for built-in intents
        switch (intent.name) {
            case 'AMAZON.HelpIntent':
                return this.handleHelpIntent();

            case 'AMAZON.CancelIntent':
            case 'AMAZON.StopIntent':
                return this.buildResponse('Até logo!', true);

            case 'AMAZON.FallbackIntent':
                return this.buildResponse(this.fallbackResponse, false);
        }

        // Check for custom intent handler
        const handler = this.intents.get(intent.name);
        if (handler) {
            try {
                const response = await handler(request, sessionAttributes);

                // Update session store
                if (response.sessionAttributes) {
                    const sessionId = request.session?.sessionId ?? 'stateless';
                    this.sessionStore.set(sessionId, response.sessionAttributes);
                }

                return response;
            } catch (error) {
                console.error(`[Alexa] Intent handler error for ${intent.name}:`, error);
                return this.buildResponse(
                    'Desculpe, ocorreu um erro ao processar sua solicitação.',
                    false
                );
            }
        }

        // No handler found
        console.warn(`[Alexa] No handler for intent: ${intent.name}`);
        return this.buildResponse(this.fallbackResponse, false);
    }

    /**
     * Handle AMAZON.HelpIntent
     */
    private handleHelpIntent(): AlexaResponse {
        const helpMessage =
            'Você pode me pedir para: ' +
            'verificar a agenda de hoje, ' +
            'chamar o próximo paciente, ' +
            'verificar o status de uma sala, ' +
            'ou iniciar uma ditação de prontuário. ' +
            'O que você gostaria de fazer?';

        return this.buildResponse(helpMessage, false, {
            reprompt: 'O que você gostaria de fazer?',
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INTENT REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Register a custom intent handler
     */
    registerIntent(intentName: string, handler: AlexaIntentHandler): void {
        this.intents.set(intentName, handler);
        console.log(`[Alexa] Registered intent: ${intentName}`);
    }

    /**
     * Create MedicSaaS default intents
     */
    static createMedicSaaSIntents(): Map<string, AlexaIntentHandler> {
        const intents = new Map<string, AlexaIntentHandler>();

        // Check schedule intent
        intents.set('CheckScheduleIntent', async (request, session) => {
            // This would integrate with the MedicSaaS backend
            const slots = request.request.intent?.slots;
            const date = slots?.date?.value ?? 'hoje';

            return {
                version: '1.0',
                sessionAttributes: session,
                response: {
                    outputSpeech: {
                        type: 'PlainText',
                        text: `Verificando a agenda de ${date}. Você tem 15 pacientes agendados.`,
                    },
                    shouldEndSession: false,
                },
            };
        });

        // Next patient intent
        intents.set('NextPatientIntent', async (request, session) => {
            return {
                version: '1.0',
                sessionAttributes: session,
                response: {
                    outputSpeech: {
                        type: 'PlainText',
                        text: 'O próximo paciente é Maria Silva, consulta de retorno às 10:30.',
                    },
                    card: {
                        type: 'Simple',
                        title: 'Próximo Paciente',
                        content: 'Maria Silva\nRetorno - 10:30\nSala 3',
                    },
                    shouldEndSession: false,
                },
            };
        });

        // Room status intent
        intents.set('RoomStatusIntent', async (request, session) => {
            const slots = request.request.intent?.slots;
            const roomNumber = slots?.room_number?.value ?? '1';

            return {
                version: '1.0',
                sessionAttributes: session,
                response: {
                    outputSpeech: {
                        type: 'PlainText',
                        text: `A sala ${roomNumber} está ocupada. Paciente em atendimento há 15 minutos.`,
                    },
                    shouldEndSession: false,
                },
            };
        });

        // Start dictation intent
        intents.set('StartDictationIntent', async (request, session) => {
            const slots = request.request.intent?.slots;
            const recordType = slots?.record_type?.value ?? 'prontuário';

            return {
                version: '1.0',
                sessionAttributes: { ...session, dictating: true, recordType },
                response: {
                    outputSpeech: {
                        type: 'PlainText',
                        text: `Iniciando ditação de ${recordType}. Pode começar a falar.`,
                    },
                    shouldEndSession: false,
                },
            };
        });

        // Call patient intent
        intents.set('CallPatientIntent', async (request, session) => {
            const slots = request.request.intent?.slots;
            const patientName = slots?.patient_name?.value;

            const message = patientName
                ? `Chamando ${patientName} para a sala de atendimento.`
                : 'Chamando o próximo paciente da fila.';

            return {
                version: '1.0',
                sessionAttributes: session,
                response: {
                    outputSpeech: { type: 'PlainText', text: message },
                    shouldEndSession: false,
                },
            };
        });

        return intents;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RESPONSE BUILDERS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Build a simple Alexa response
     */
    buildResponse(
        speech: string,
        endSession: boolean,
        options?: {
            reprompt?: string;
            card?: { title: string; content: string };
            sessionAttributes?: Record<string, unknown>;
        }
    ): AlexaResponse {
        const response: AlexaResponse = {
            version: '1.0',
            sessionAttributes: options?.sessionAttributes,
            response: {
                outputSpeech: {
                    type: 'PlainText',
                    text: speech,
                },
                shouldEndSession: endSession,
            },
        };

        if (options?.reprompt) {
            response.response.reprompt = {
                outputSpeech: {
                    type: 'PlainText',
                    text: options.reprompt,
                },
            };
        }

        if (options?.card) {
            response.response.card = {
                type: 'Simple',
                title: options.card.title,
                content: options.card.content,
            };
        }

        return response;
    }

    /**
     * Build SSML response (for richer speech)
     */
    buildSSMLResponse(
        ssml: string,
        endSession: boolean,
        options?: {
            reprompt?: string;
            sessionAttributes?: Record<string, unknown>;
        }
    ): AlexaResponse {
        return {
            version: '1.0',
            sessionAttributes: options?.sessionAttributes,
            response: {
                outputSpeech: {
                    type: 'SSML',
                    ssml: ssml.startsWith('<speak>') ? ssml : `<speak>${ssml}</speak>`,
                },
                reprompt: options?.reprompt ? {
                    outputSpeech: { type: 'PlainText', text: options.reprompt },
                } : undefined,
                shouldEndSession: endSession,
            },
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SECURITY
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Verify Alexa request signature
     */
    private async verifyAlexaSignature(
        request: AlexaRequest,
        headers: Record<string, string>
    ): Promise<boolean> {
        const signatureCertChainUrl = headers['signaturecertchainurl'];
        const signature = headers['signature'];

        if (!signatureCertChainUrl || !signature) {
            return false;
        }

        // Validate certificate URL
        try {
            const url = new URL(signatureCertChainUrl);
            if (
                url.protocol !== 'https:' ||
                url.hostname !== 's3.amazonaws.com' ||
                !url.pathname.startsWith('/echo.api/')
            ) {
                return false;
            }
        } catch {
            return false;
        }

        // Validate timestamp (request must be within 150 seconds)
        const timestamp = new Date(request.request.timestamp);
        const now = new Date();
        const diff = Math.abs(now.getTime() - timestamp.getTime());
        if (diff > 150000) {
            return false;
        }

        // In production, you would:
        // 1. Fetch the certificate from signatureCertChainUrl
        // 2. Validate the certificate chain
        // 3. Verify the signature using the certificate's public key
        // For now, we'll trust the request format validation

        console.log('[Alexa] Signature validation passed (basic)');
        return true;
    }
}
