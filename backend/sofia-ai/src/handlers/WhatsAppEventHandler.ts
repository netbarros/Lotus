/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WHATSAPP EVENT HANDLER - Sofia AI Integration with WhatsApp Gateway
 * Cognitive Mesh OS Layer 11 - Multi-Channel Messaging
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Handles WhatsApp events from @magicsaas/whatsapp-gateway package:
 * - Incoming messages
 * - Message status updates
 * - Template message triggers
 * - Appointment reminders
 */

import { EventStore } from '../events/EventStore.js';
import { logger } from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface WhatsAppEvent {
    id: string;
    type: 'message_received' | 'message_sent' | 'status_update' | 'template_trigger';
    tenantId: string;
    timestamp: Date;
    payload: Record<string, unknown>;
}

export interface MessageReceivedEvent extends WhatsAppEvent {
    type: 'message_received';
    payload: {
        from: string;
        to: string;
        messageId: string;
        messageType: 'text' | 'image' | 'audio' | 'document' | 'location' | 'contact';
        text?: string;
        media?: {
            url: string;
            mimeType: string;
            caption?: string;
        };
        location?: {
            latitude: number;
            longitude: number;
            name?: string;
        };
        contact?: {
            name: string;
            phone: string;
        };
        contextMessageId?: string;
        isForwarded?: boolean;
    };
}

export interface MessageSentEvent extends WhatsAppEvent {
    type: 'message_sent';
    payload: {
        to: string;
        messageId: string;
        messageType: 'text' | 'template' | 'media';
        text?: string;
        templateName?: string;
        templateParams?: Record<string, string>;
    };
}

export interface StatusUpdateEvent extends WhatsAppEvent {
    type: 'status_update';
    payload: {
        messageId: string;
        status: 'sent' | 'delivered' | 'read' | 'failed';
        recipientPhone: string;
        timestamp: Date;
        errorCode?: string;
        errorMessage?: string;
    };
}

export interface TemplateTriggerEvent extends WhatsAppEvent {
    type: 'template_trigger';
    payload: {
        templateName: string;
        recipientPhone: string;
        params: Record<string, string>;
        triggerSource: 'appointment' | 'reminder' | 'notification' | 'marketing';
        scheduledAt?: Date;
        appointmentId?: string;
        patientId?: string;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// WHATSAPP EVENT HANDLER CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class WhatsAppEventHandler {
    private eventStore: EventStore;
    private handlers: Map<string, (event: WhatsAppEvent) => Promise<void>>;
    private sendMessageCallback?: (to: string, message: string) => Promise<string>;
    private sendTemplateCallback?: (
        to: string,
        templateName: string,
        params: Record<string, string>
    ) => Promise<string>;

    constructor(eventStore: EventStore) {
        this.eventStore = eventStore;
        this.handlers = new Map();
        this.registerDefaultHandlers();
    }

    /**
     * Set callback for sending messages
     */
    setSendMessageCallback(
        callback: (to: string, message: string) => Promise<string>
    ): void {
        this.sendMessageCallback = callback;
        logger.info('WhatsApp send message callback registered');
    }

    /**
     * Set callback for sending template messages
     */
    setSendTemplateCallback(
        callback: (
            to: string,
            templateName: string,
            params: Record<string, string>
        ) => Promise<string>
    ): void {
        this.sendTemplateCallback = callback;
        logger.info('WhatsApp send template callback registered');
    }

    /**
     * Register default event handlers
     */
    private registerDefaultHandlers(): void {
        // Message received handler
        this.handlers.set('message_received', async (event: WhatsAppEvent) => {
            const message = event as MessageReceivedEvent;
            logger.info({
                event: 'whatsapp:message_received',
                from: message.payload.from,
                messageType: message.payload.messageType,
            });

            await this.eventStore.append({
                streamId: `whatsapp:${message.payload.from}`,
                type: 'WhatsAppMessageReceived',
                data: {
                    messageId: message.payload.messageId,
                    messageType: message.payload.messageType,
                    text: message.payload.text,
                    hasMedia: !!message.payload.media,
                },
                metadata: {
                    tenantId: message.tenantId,
                    to: message.payload.to,
                },
            });

            // Auto-reply logic for common messages
            if (message.payload.text) {
                await this.handleIncomingText(message);
            }
        });

        // Message sent handler
        this.handlers.set('message_sent', async (event: WhatsAppEvent) => {
            const sent = event as MessageSentEvent;
            logger.info({
                event: 'whatsapp:message_sent',
                to: sent.payload.to,
                messageId: sent.payload.messageId,
            });

            await this.eventStore.append({
                streamId: `whatsapp:${sent.payload.to}`,
                type: 'WhatsAppMessageSent',
                data: sent.payload,
                metadata: {
                    tenantId: sent.tenantId,
                },
            });
        });

        // Status update handler
        this.handlers.set('status_update', async (event: WhatsAppEvent) => {
            const status = event as StatusUpdateEvent;
            logger.debug({
                event: 'whatsapp:status_update',
                messageId: status.payload.messageId,
                status: status.payload.status,
            });

            await this.eventStore.append({
                streamId: `whatsapp:messages:${status.payload.messageId}`,
                type: 'WhatsAppStatusUpdated',
                data: status.payload,
                metadata: {
                    tenantId: status.tenantId,
                },
            });

            // Log failures
            if (status.payload.status === 'failed') {
                logger.error({
                    messageId: status.payload.messageId,
                    errorCode: status.payload.errorCode,
                    errorMessage: status.payload.errorMessage,
                }, 'WhatsApp message delivery failed');
            }
        });

        // Template trigger handler
        this.handlers.set('template_trigger', async (event: WhatsAppEvent) => {
            const trigger = event as TemplateTriggerEvent;
            logger.info({
                event: 'whatsapp:template_trigger',
                templateName: trigger.payload.templateName,
                triggerSource: trigger.payload.triggerSource,
            });

            await this.eventStore.append({
                streamId: `whatsapp:templates:${trigger.tenantId}`,
                type: 'WhatsAppTemplateTrigger',
                data: trigger.payload,
                metadata: {
                    tenantId: trigger.tenantId,
                },
            });

            // Send the template if callback is registered
            if (this.sendTemplateCallback) {
                try {
                    const messageId = await this.sendTemplateCallback(
                        trigger.payload.recipientPhone,
                        trigger.payload.templateName,
                        trigger.payload.params
                    );
                    logger.info({ messageId, templateName: trigger.payload.templateName }, 'Template sent');
                } catch (error) {
                    logger.error({ error }, 'Failed to send WhatsApp template');
                }
            }
        });
    }

    /**
     * Handle incoming text message with auto-reply logic
     */
    private async handleIncomingText(message: MessageReceivedEvent): Promise<void> {
        const text = message.payload.text?.toLowerCase().trim() || '';

        // Simple keyword-based responses
        const responses: Record<string, string> = {
            'oi': 'Olá! Como posso ajudar?',
            'olá': 'Olá! Como posso ajudar?',
            'horario': 'Nosso horário de funcionamento é de Segunda a Sexta, 8h às 18h.',
            'horário': 'Nosso horário de funcionamento é de Segunda a Sexta, 8h às 18h.',
            'agendar': 'Para agendar uma consulta, por favor informe seu nome completo e a data desejada.',
            'cancelar': 'Para cancelar sua consulta, informe o número do agendamento.',
            'ajuda': 'Opções disponíveis:\n• Agendar consulta\n• Cancelar consulta\n• Horário de funcionamento\n• Falar com atendente',
        };

        for (const [keyword, response] of Object.entries(responses)) {
            if (text.includes(keyword) && this.sendMessageCallback) {
                await this.sendMessageCallback(message.payload.from, response);
                break;
            }
        }
    }

    /**
     * Process incoming WhatsApp event
     */
    async processEvent(event: WhatsAppEvent): Promise<void> {
        const handler = this.handlers.get(event.type);

        if (!handler) {
            logger.warn({ eventType: event.type }, 'No handler for WhatsApp event type');
            return;
        }

        try {
            await handler(event);
        } catch (error) {
            logger.error({ error, event }, 'Error processing WhatsApp event');
            throw error;
        }
    }

    /**
     * Send appointment reminder
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
        const formattedDate = appointment.dateTime.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
        const formattedTime = appointment.dateTime.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });

        await this.processEvent({
            id: `reminder-${appointment.id}`,
            type: 'template_trigger',
            tenantId,
            timestamp: new Date(),
            payload: {
                templateName: 'appointment_reminder',
                recipientPhone: appointment.patientPhone,
                params: {
                    patient_name: appointment.patientName,
                    doctor_name: appointment.doctorName,
                    date: formattedDate,
                    time: formattedTime,
                    location: appointment.location || 'Clínica',
                },
                triggerSource: 'appointment',
                appointmentId: appointment.id,
            },
        });
    }

    /**
     * Send notification message
     */
    async sendNotification(
        phone: string,
        message: string,
        tenantId: string
    ): Promise<string | null> {
        if (!this.sendMessageCallback) {
            logger.warn('No send message callback registered');
            return null;
        }

        try {
            const messageId = await this.sendMessageCallback(phone, message);

            await this.processEvent({
                id: messageId,
                type: 'message_sent',
                tenantId,
                timestamp: new Date(),
                payload: {
                    to: phone,
                    messageId,
                    messageType: 'text',
                    text: message,
                },
            });

            return messageId;
        } catch (error) {
            logger.error({ error, phone }, 'Failed to send WhatsApp notification');
            return null;
        }
    }

    /**
     * Register custom event handler
     */
    registerHandler(
        eventType: string,
        handler: (event: WhatsAppEvent) => Promise<void>
    ): void {
        this.handlers.set(eventType, handler);
        logger.info({ eventType }, 'Registered custom WhatsApp event handler');
    }
}

export default WhatsAppEventHandler;
