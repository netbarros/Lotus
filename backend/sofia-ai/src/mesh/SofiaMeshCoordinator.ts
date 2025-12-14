/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOFIA MESH COORDINATOR - Central Integration Hub
 * Cognitive Mesh OS Layer 11 - Unified Event Processing
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Wires together all Sofia AI components:
 * - IntentionEngine → DirectusOrchestrator
 * - IoT/Voice/WhatsApp Event Handlers
 * - Inngest Durable Functions
 * - Real-time processing pipeline
 */

import type { Redis } from 'ioredis';
import { EventStore } from '../events/EventStore.js';
import { Metrics } from '../telemetry/Metrics.js';
import { IntentionEngine, type IntentionRequest, type GeneratedSolution } from '../core/IntentionEngine.js';
import { DirectusOrchestrator, type IntentSchema } from '../integrations/directus-orchestrator.js';
import { IoTEventHandler, type IoTEvent } from '../handlers/IoTEventHandler.js';
import { VoiceEventHandler, type VoiceEvent, type DictationEvent } from '../handlers/VoiceEventHandler.js';
import { WhatsAppEventHandler, type WhatsAppEvent } from '../handlers/WhatsAppEventHandler.js';
import { logger } from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface MeshConfig {
    redis: Redis;
    eventStore: EventStore;
    metrics: Metrics;
    anthropicApiKey: string;
    directusUrl: string;
    directusToken: string;
}

export interface MeshEvent {
    source: 'iot' | 'voice' | 'whatsapp' | 'intention' | 'internal';
    type: string;
    tenantId: string;
    timestamp: Date;
    payload: unknown;
}

// ═══════════════════════════════════════════════════════════════════════════
// SOFIA MESH COORDINATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class SofiaMeshCoordinator {
    private intentionEngine: IntentionEngine;
    private directusOrchestrator: DirectusOrchestrator;
    private iotHandler: IoTEventHandler;
    private voiceHandler: VoiceEventHandler;
    private whatsappHandler: WhatsAppEventHandler;
    private eventStore: EventStore;
    private metrics: Metrics;

    constructor(config: MeshConfig) {
        // Initialize core components
        this.eventStore = config.eventStore;
        this.metrics = config.metrics;

        // Initialize IntentionEngine
        this.intentionEngine = new IntentionEngine(
            config.redis,
            config.eventStore,
            config.metrics,
            config.anthropicApiKey
        );

        // Initialize DirectusOrchestrator
        this.directusOrchestrator = new DirectusOrchestrator(
            config.directusUrl,
            config.directusToken
        );

        // Initialize Event Handlers
        this.iotHandler = new IoTEventHandler(config.eventStore);
        this.voiceHandler = new VoiceEventHandler(config.eventStore);
        this.whatsappHandler = new WhatsAppEventHandler(config.eventStore);

        // Wire handlers together
        this.wireIntegrations();

        logger.info('SofiaMeshCoordinator initialized');
    }

    /**
     * Wire all integrations together
     */
    private wireIntegrations(): void {
        // Voice → EHR callback
        this.voiceHandler.setEHRCallback(async (dictation) => {
            await this.processDictationToEHR(dictation);
        });

        // Register custom IoT handlers for medical scenarios
        this.iotHandler.registerHandler('occupancy', async (event) => {
            await this.handleMedicalRoomOccupancy(event);
        });

        logger.info('Mesh integrations wired');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INTENTION → DIRECTUS INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Process intention and auto-create Directus collections
     */
    async processIntentionWithDirectus(
        request: IntentionRequest
    ): Promise<{
        solution: GeneratedSolution;
        directusResult?: {
            collections_created: string[];
            fields_created: number;
            relations_created: number;
        };
    }> {
        // Step 1: Process intention via IntentionEngine
        const solution = await this.intentionEngine.processIntention(request);

        // Step 2: If SaaS generation, auto-create Directus collections
        if (
            (request.type === 'generate-saas' || request.type === 'generate-api') &&
            solution.status === 'completed'
        ) {
            try {
                // Generate schema from solution artifacts
                const schema = this.generateDirectusSchema(request, solution);

                if (schema.collections.length > 0) {
                    const directusResult = await this.directusOrchestrator.createFromIntent(schema);

                    logger.info({
                        collections: directusResult.collections_created,
                        fields: directusResult.fields_created,
                    }, 'Directus collections created from intention');

                    return { solution, directusResult };
                }
            } catch (error) {
                logger.error({ error }, 'Failed to create Directus collections');
                // Don't fail the whole operation
            }
        }

        return { solution };
    }

    /**
     * Generate Directus schema from solution
     */
    private generateDirectusSchema(
        request: IntentionRequest,
        solution: GeneratedSolution
    ): IntentSchema {
        // Map vertical to collection templates
        const vertical = request.requirements?.targets?.vertical?.toLowerCase() || 'general';

        const schemaTemplates: Record<string, IntentSchema> = {
            healthcare: {
                collections: [
                    {
                        name: 'patients',
                        icon: 'face',
                        color: '#4CAF50',
                        fields: [
                            { name: 'full_name', type: 'string', required: true },
                            { name: 'cpf', type: 'string', unique: true },
                            { name: 'date_of_birth', type: 'date' },
                            { name: 'phone', type: 'string' },
                            { name: 'email', type: 'string' },
                        ],
                    },
                    {
                        name: 'appointments',
                        icon: 'event',
                        color: '#2196F3',
                        fields: [
                            { name: 'scheduled_at', type: 'datetime', required: true },
                            { name: 'duration_minutes', type: 'integer', default: 30 },
                            { name: 'status', type: 'string', validation: { choices: ['scheduled', 'confirmed', 'completed', 'cancelled'] } },
                            { name: 'notes', type: 'text' },
                        ],
                        relations: [
                            { field: 'patient_id', related_collection: 'patients', type: 'many-to-one' },
                        ],
                    },
                ],
            },
            restaurant: {
                collections: [
                    {
                        name: 'menu_items',
                        icon: 'restaurant',
                        color: '#FF9800',
                        fields: [
                            { name: 'name', type: 'string', required: true },
                            { name: 'description', type: 'text' },
                            { name: 'price', type: 'float', required: true },
                            { name: 'category', type: 'string' },
                            { name: 'available', type: 'boolean', default: true },
                        ],
                    },
                    {
                        name: 'orders',
                        icon: 'receipt',
                        color: '#4CAF50',
                        fields: [
                            { name: 'table_number', type: 'integer' },
                            { name: 'status', type: 'string', validation: { choices: ['pending', 'preparing', 'ready', 'delivered', 'paid'] } },
                            { name: 'total', type: 'float' },
                            { name: 'notes', type: 'text' },
                        ],
                    },
                ],
            },
            general: {
                collections: [
                    {
                        name: 'items',
                        icon: 'folder',
                        color: '#9E9E9E',
                        fields: [
                            { name: 'name', type: 'string', required: true },
                            { name: 'description', type: 'text' },
                            { name: 'status', type: 'string' },
                            { name: 'metadata', type: 'json' },
                        ],
                    },
                ],
            },
        };

        return schemaTemplates[vertical] || schemaTemplates.general;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // IOT PROCESSING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Process IoT event through the mesh
     */
    async processIoTEvent(event: IoTEvent): Promise<void> {
        this.metrics.decisionsTotal.inc({ type: 'iot', status: 'received' });
        await this.iotHandler.processEvent(event);
    }

    /**
     * Handle medical room occupancy changes
     */
    private async handleMedicalRoomOccupancy(event: IoTEvent): Promise<void> {
        const occupancy = event.payload as { occupied: boolean; personCount?: number };

        // If room became occupied, check for upcoming appointments
        if (occupancy.occupied && event.roomId) {
            logger.info({
                roomId: event.roomId,
                personCount: occupancy.personCount,
            }, 'Medical room occupied');

            // Could trigger appointment start workflow here
            await this.eventStore.append({
                streamId: `medical:room:${event.roomId}`,
                type: 'MedicalRoomOccupied',
                data: {
                    roomId: event.roomId,
                    personCount: occupancy.personCount,
                    timestamp: event.timestamp,
                },
                metadata: {
                    tenantId: event.tenantId,
                    deviceId: event.deviceId,
                },
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // VOICE PROCESSING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Process voice event through the mesh
     */
    async processVoiceEvent(event: VoiceEvent): Promise<void> {
        this.metrics.decisionsTotal.inc({ type: 'voice', status: 'received' });
        await this.voiceHandler.processEvent(event);
    }

    /**
     * Process dictation to EHR system
     */
    private async processDictationToEHR(
        dictation: DictationEvent['payload']
    ): Promise<void> {
        if (!dictation.patientId) return;

        // Create medical record in Directus
        try {
            const schema: IntentSchema = {
                collections: [
                    {
                        name: 'medical_records',
                        icon: 'description',
                        color: '#FF9800',
                        fields: [
                            { name: 'patient_id', type: 'uuid', required: true },
                            { name: 'record_type', type: 'string', required: true },
                            { name: 'content', type: 'text' },
                            { name: 'structured_data', type: 'json' },
                            { name: 'created_at', type: 'datetime' },
                        ],
                    },
                ],
            };

            // Ensure collection exists
            const exists = await this.directusOrchestrator.collectionExists('medical_records');
            if (!exists) {
                await this.directusOrchestrator.createFromIntent(schema);
            }

            logger.info({
                patientId: dictation.patientId,
                category: dictation.category,
            }, 'Dictation processed to EHR');
        } catch (error) {
            logger.error({ error }, 'Failed to process dictation to EHR');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // WHATSAPP PROCESSING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Process WhatsApp event through the mesh
     */
    async processWhatsAppEvent(event: WhatsAppEvent): Promise<void> {
        this.metrics.decisionsTotal.inc({ type: 'whatsapp', status: 'received' });
        await this.whatsappHandler.processEvent(event);
    }

    /**
     * Send appointment reminder via WhatsApp
     */
    async sendAppointmentReminder(
        appointment: {
            id: string;
            patientPhone: string;
            patientName: string;
            doctorName: string;
            dateTime: Date;
            location?: string;
        },
        tenantId: string
    ): Promise<void> {
        await this.whatsappHandler.sendAppointmentReminder(appointment, tenantId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UNIFIED EVENT PROCESSING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Process any mesh event
     */
    async processEvent(event: MeshEvent): Promise<void> {
        logger.debug({
            source: event.source,
            type: event.type,
        }, 'Processing mesh event');

        switch (event.source) {
            case 'iot':
                await this.processIoTEvent(event.payload as IoTEvent);
                break;
            case 'voice':
                await this.processVoiceEvent(event.payload as VoiceEvent);
                break;
            case 'whatsapp':
                await this.processWhatsAppEvent(event.payload as WhatsAppEvent);
                break;
            default:
                logger.warn({ source: event.source }, 'Unknown event source');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════════════════════════

    get intention(): IntentionEngine {
        return this.intentionEngine;
    }

    get directus(): DirectusOrchestrator {
        return this.directusOrchestrator;
    }

    get iot(): IoTEventHandler {
        return this.iotHandler;
    }

    get voice(): VoiceEventHandler {
        return this.voiceHandler;
    }

    get whatsapp(): WhatsAppEventHandler {
        return this.whatsappHandler;
    }
}

export default SofiaMeshCoordinator;
