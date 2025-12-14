/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INNGEST DURABLE FUNCTIONS - MedicSaaS Workflows
 * Cognitive Mesh OS Layer 11 - Event-Driven Orchestration
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Inngest functions for:
 * - Appointment reminders (24h, 2h, 30min)
 * - Medical record processing
 * - IoT alert escalation
 * - Voice transcription pipeline
 * - WhatsApp notification flows
 */

import { Inngest } from 'inngest';

// ═══════════════════════════════════════════════════════════════════════════
// INNGEST CLIENT
// ═══════════════════════════════════════════════════════════════════════════

export const inngest = new Inngest({
    id: 'magicsaas-medic-saas',
    name: 'MagicSaaS MedicSaaS',
});

// ═══════════════════════════════════════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AppointmentCreatedEvent {
    name: 'medicsaas/appointment.created';
    data: {
        appointmentId: string;
        patientId: string;
        patientName: string;
        patientPhone: string;
        providerId: string;
        providerName: string;
        scheduledAt: string; // ISO date
        duration: number;
        location?: string;
        tenantId: string;
    };
}

export interface DictationCompletedEvent {
    name: 'medicsaas/dictation.completed';
    data: {
        dictationId: string;
        patientId: string;
        providerId: string;
        appointmentId?: string;
        rawText: string;
        category: 'soap_note' | 'prescription' | 'referral' | 'general';
        tenantId: string;
    };
}

export interface IoTAlertTriggeredEvent {
    name: 'medicsaas/iot.alert';
    data: {
        alertId: string;
        deviceId: string;
        roomId?: string;
        severity: 'info' | 'warning' | 'critical';
        message: string;
        tenantId: string;
    };
}

export interface RoomOccupancyChangedEvent {
    name: 'medicsaas/room.occupancy';
    data: {
        roomId: string;
        occupied: boolean;
        personCount?: number;
        deviceId: string;
        tenantId: string;
    };
}

// Combined event types
export type MedicSaaSEvents =
    | AppointmentCreatedEvent
    | DictationCompletedEvent
    | IoTAlertTriggeredEvent
    | RoomOccupancyChangedEvent;

// ═══════════════════════════════════════════════════════════════════════════
// INNGEST FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Appointment Reminder Flow
 * Sends WhatsApp reminders at 24h, 2h, and 30min before appointment
 */
export const appointmentReminderFlow = inngest.createFunction(
    { id: 'appointment-reminder-flow', name: 'Appointment Reminder Flow' },
    { event: 'medicsaas/appointment.created' },
    async ({ event, step }) => {
        const { data } = event;
        const appointmentTime = new Date(data.scheduledAt);
        const now = new Date();

        // Calculate reminder times
        const reminder24h = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000);
        const reminder2h = new Date(appointmentTime.getTime() - 2 * 60 * 60 * 1000);
        const reminder30min = new Date(appointmentTime.getTime() - 30 * 60 * 1000);

        // 24h reminder
        if (reminder24h > now) {
            await step.sleepUntil('wait-24h', reminder24h);
            await step.run('send-24h-reminder', async () => {
                return sendWhatsAppReminder(data, '24 horas');
            });
        }

        // 2h reminder
        if (reminder2h > now) {
            await step.sleepUntil('wait-2h', reminder2h);
            await step.run('send-2h-reminder', async () => {
                return sendWhatsAppReminder(data, '2 horas');
            });
        }

        // 30min reminder
        if (reminder30min > now) {
            await step.sleepUntil('wait-30min', reminder30min);
            await step.run('send-30min-reminder', async () => {
                return sendWhatsAppReminder(data, '30 minutos');
            });
        }

        return { status: 'all_reminders_sent', appointmentId: data.appointmentId };
    }
);

/**
 * Medical Dictation Processing Pipeline
 * Processes dictation → extracts structured data → updates EHR
 */
export const dictationProcessingPipeline = inngest.createFunction(
    { id: 'dictation-processing', name: 'Dictation Processing Pipeline' },
    { event: 'medicsaas/dictation.completed' },
    async ({ event, step }) => {
        const { data } = event;

        // Step 1: Extract structured data from dictation
        const extractedData = await step.run('extract-structured-data', async () => {
            return extractSOAPData(data.rawText);
        });

        // Step 2: Create medical record in Directus
        const recordId = await step.run('create-medical-record', async () => {
            return createMedicalRecord({
                patientId: data.patientId,
                providerId: data.providerId,
                appointmentId: data.appointmentId,
                category: data.category,
                rawText: data.rawText,
                extractedData,
                tenantId: data.tenantId,
            });
        });

        // Step 3: Notify provider via internal system
        await step.run('notify-provider', async () => {
            return notifyProvider(data.providerId, {
                type: 'dictation_processed',
                recordId,
                patientId: data.patientId,
            });
        });

        return {
            status: 'processed',
            recordId,
            extractedFields: Object.keys(extractedData).length
        };
    }
);

/**
 * IoT Alert Escalation Flow
 * Escalates critical alerts through multiple channels
 */
export const iotAlertEscalation = inngest.createFunction(
    { id: 'iot-alert-escalation', name: 'IoT Alert Escalation' },
    { event: 'medicsaas/iot.alert' },
    async ({ event, step }) => {
        const { data } = event;

        // Only escalate warning and critical
        if (data.severity === 'info') {
            return { status: 'logged_only', alertId: data.alertId };
        }

        // Step 1: Send immediate notification
        await step.run('send-immediate-notification', async () => {
            return sendAlertNotification(data);
        });

        // Step 2: For critical alerts, escalate if not acknowledged in 5 min
        if (data.severity === 'critical') {
            await step.sleep('wait-5-min', '5m');

            const acknowledged = await step.run('check-acknowledgment', async () => {
                return checkAlertAcknowledged(data.alertId);
            });

            if (!acknowledged) {
                await step.run('escalate-to-supervisor', async () => {
                    return escalateAlert(data);
                });
            }
        }

        return { status: 'escalated', alertId: data.alertId };
    }
);

/**
 * Room Status Update Flow
 * Updates room availability and triggers downstream actions
 */
export const roomStatusFlow = inngest.createFunction(
    { id: 'room-status-update', name: 'Room Status Update' },
    { event: 'medicsaas/room.occupancy' },
    async ({ event, step }) => {
        const { data } = event;

        // Step 1: Update room status in database
        await step.run('update-room-status', async () => {
            return updateRoomStatus(data.roomId, data.occupied, data.personCount);
        });

        // Step 2: If room became vacant, trigger cleaning notification
        if (!data.occupied) {
            await step.run('trigger-cleaning', async () => {
                return triggerCleaningNotification(data.roomId, data.tenantId);
            });
        }

        // Step 3: Update dashboard in real-time
        await step.run('broadcast-status', async () => {
            return broadcastRoomStatus(data);
        });

        return { status: 'updated', roomId: data.roomId, occupied: data.occupied };
    }
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (Stubs - to be connected to actual services)
// ═══════════════════════════════════════════════════════════════════════════

async function sendWhatsAppReminder(
    appointment: AppointmentCreatedEvent['data'],
    timeframe: string
): Promise<{ messageId: string }> {
    console.log(`[Inngest] Sending ${timeframe} reminder to ${appointment.patientPhone}`);
    // TODO: Connect to WhatsAppEventHandler
    return { messageId: `msg-${Date.now()}` };
}

function extractSOAPData(rawText: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const markers = [
        { key: 'subjective', patterns: ['subjective', 'S:', 'patient reports'] },
        { key: 'objective', patterns: ['objective', 'O:', 'examination'] },
        { key: 'assessment', patterns: ['assessment', 'A:', 'diagnosis'] },
        { key: 'plan', patterns: ['plan', 'P:', 'treatment'] },
    ];

    for (const { key, patterns } of markers) {
        for (const pattern of patterns) {
            const idx = rawText.toLowerCase().indexOf(pattern.toLowerCase());
            if (idx !== -1) {
                const start = idx + pattern.length;
                const remaining = rawText.substring(start);
                const nextSection = remaining.search(/\b(subjective|objective|assessment|plan|S:|O:|A:|P:)\b/i);
                sections[key] = remaining.substring(0, nextSection > 0 ? nextSection : undefined).trim();
                break;
            }
        }
    }

    return sections;
}

async function createMedicalRecord(record: {
    patientId: string;
    providerId: string;
    appointmentId?: string;
    category: string;
    rawText: string;
    extractedData: Record<string, string>;
    tenantId: string;
}): Promise<string> {
    console.log(`[Inngest] Creating medical record for patient ${record.patientId}`);
    // TODO: Connect to DirectusOrchestrator
    return `record-${Date.now()}`;
}

async function notifyProvider(
    providerId: string,
    notification: { type: string; recordId: string; patientId: string }
): Promise<void> {
    console.log(`[Inngest] Notifying provider ${providerId}:`, notification);
    // TODO: Connect to notification service
}

async function sendAlertNotification(
    alert: IoTAlertTriggeredEvent['data']
): Promise<void> {
    console.log(`[Inngest] Alert notification: ${alert.severity} - ${alert.message}`);
    // TODO: Connect to notification service
}

async function checkAlertAcknowledged(alertId: string): Promise<boolean> {
    console.log(`[Inngest] Checking if alert ${alertId} is acknowledged`);
    // TODO: Check database
    return false;
}

async function escalateAlert(alert: IoTAlertTriggeredEvent['data']): Promise<void> {
    console.log(`[Inngest] Escalating alert ${alert.alertId} to supervisor`);
    // TODO: Connect to escalation service
}

async function updateRoomStatus(
    roomId: string,
    occupied: boolean,
    personCount?: number
): Promise<void> {
    console.log(`[Inngest] Room ${roomId}: occupied=${occupied}, count=${personCount}`);
    // TODO: Update database
}

async function triggerCleaningNotification(
    roomId: string,
    tenantId: string
): Promise<void> {
    console.log(`[Inngest] Triggering cleaning for room ${roomId}`);
    // TODO: Notify cleaning staff
}

async function broadcastRoomStatus(
    data: RoomOccupancyChangedEvent['data']
): Promise<void> {
    console.log(`[Inngest] Broadcasting room status:`, data);
    // TODO: WebSocket broadcast
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const functions = [
    appointmentReminderFlow,
    dictationProcessingPipeline,
    iotAlertEscalation,
    roomStatusFlow,
];

export default inngest;
