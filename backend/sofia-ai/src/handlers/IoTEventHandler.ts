/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IOT EVENT HANDLER - Sofia AI Integration with IoT Mesh
 * Cognitive Mesh OS Layer 11 - Real-time IoT Event Processing
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Handles IoT events from @magicsaas/iot-mesh package:
 * - Room occupancy changes
 * - Sensor readings (temperature, humidity, motion)
 * - Device state changes
 * - Alerts and alarms
 */

import { EventStore } from '../events/EventStore.js';
import { logger } from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface IoTEvent {
    id: string;
    type: 'occupancy' | 'sensor' | 'device' | 'alert';
    deviceId: string;
    roomId?: string;
    tenantId: string;
    timestamp: Date;
    payload: Record<string, unknown>;
}

export interface OccupancyEvent extends IoTEvent {
    type: 'occupancy';
    payload: {
        occupied: boolean;
        personCount?: number;
        lastMotion?: Date;
        roomType?: string;
    };
}

export interface SensorEvent extends IoTEvent {
    type: 'sensor';
    payload: {
        sensorType: 'temperature' | 'humidity' | 'co2' | 'light' | 'motion';
        value: number;
        unit: string;
        threshold?: { min?: number; max?: number };
    };
}

export interface DeviceStateEvent extends IoTEvent {
    type: 'device';
    payload: {
        deviceType: string;
        state: 'online' | 'offline' | 'error' | 'unknown';
        previousState?: string;
        battery?: number;
        firmware?: string;
    };
}

export interface AlertEvent extends IoTEvent {
    type: 'alert';
    payload: {
        severity: 'info' | 'warning' | 'critical';
        message: string;
        source: string;
        acknowledged?: boolean;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// IOT EVENT HANDLER CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class IoTEventHandler {
    private eventStore: EventStore;
    private handlers: Map<string, (event: IoTEvent) => Promise<void>>;

    constructor(eventStore: EventStore) {
        this.eventStore = eventStore;
        this.handlers = new Map();
        this.registerDefaultHandlers();
    }

    /**
     * Register default event handlers
     */
    private registerDefaultHandlers(): void {
        // Occupancy handler
        this.handlers.set('occupancy', async (event: IoTEvent) => {
            const occupancy = event as OccupancyEvent;
            logger.info({
                event: 'iot:occupancy',
                roomId: occupancy.roomId,
                occupied: occupancy.payload.occupied,
                personCount: occupancy.payload.personCount,
            });

            // Store in event sourcing
            await this.eventStore.append({
                streamId: `room:${occupancy.roomId}`,
                type: 'RoomOccupancyChanged',
                data: occupancy.payload,
                metadata: {
                    deviceId: occupancy.deviceId,
                    tenantId: occupancy.tenantId,
                    timestamp: occupancy.timestamp,
                },
            });
        });

        // Sensor handler
        this.handlers.set('sensor', async (event: IoTEvent) => {
            const sensor = event as SensorEvent;
            logger.debug({
                event: 'iot:sensor',
                sensorType: sensor.payload.sensorType,
                value: sensor.payload.value,
                unit: sensor.payload.unit,
            });

            // Check thresholds
            if (sensor.payload.threshold) {
                const { min, max } = sensor.payload.threshold;
                const value = sensor.payload.value;

                if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
                    await this.triggerAlert({
                        id: `alert-${Date.now()}`,
                        type: 'alert',
                        deviceId: sensor.deviceId,
                        roomId: sensor.roomId,
                        tenantId: sensor.tenantId,
                        timestamp: new Date(),
                        payload: {
                            severity: 'warning',
                            message: `${sensor.payload.sensorType} out of range: ${value}${sensor.payload.unit}`,
                            source: sensor.deviceId,
                        },
                    });
                }
            }

            await this.eventStore.append({
                streamId: `device:${sensor.deviceId}`,
                type: 'SensorReadingReceived',
                data: sensor.payload,
                metadata: {
                    tenantId: sensor.tenantId,
                    roomId: sensor.roomId,
                },
            });
        });

        // Device state handler
        this.handlers.set('device', async (event: IoTEvent) => {
            const device = event as DeviceStateEvent;
            logger.info({
                event: 'iot:device',
                deviceId: device.deviceId,
                state: device.payload.state,
            });

            await this.eventStore.append({
                streamId: `device:${device.deviceId}`,
                type: 'DeviceStateChanged',
                data: device.payload,
                metadata: {
                    tenantId: device.tenantId,
                },
            });

            // Auto-alert on device error
            if (device.payload.state === 'error') {
                await this.triggerAlert({
                    id: `alert-${Date.now()}`,
                    type: 'alert',
                    deviceId: device.deviceId,
                    tenantId: device.tenantId,
                    timestamp: new Date(),
                    payload: {
                        severity: 'critical',
                        message: `Device ${device.deviceId} entered error state`,
                        source: 'device-monitor',
                    },
                });
            }
        });

        // Alert handler
        this.handlers.set('alert', async (event: IoTEvent) => {
            const alert = event as AlertEvent;
            logger.warn({
                event: 'iot:alert',
                severity: alert.payload.severity,
                message: alert.payload.message,
            });

            await this.eventStore.append({
                streamId: `alerts:${alert.tenantId}`,
                type: 'AlertTriggered',
                data: alert.payload,
                metadata: {
                    deviceId: alert.deviceId,
                    roomId: alert.roomId,
                },
            });
        });
    }

    /**
     * Process incoming IoT event
     */
    async processEvent(event: IoTEvent): Promise<void> {
        const handler = this.handlers.get(event.type);

        if (!handler) {
            logger.warn({ eventType: event.type }, 'No handler for IoT event type');
            return;
        }

        try {
            await handler(event);
        } catch (error) {
            logger.error({ error, event }, 'Error processing IoT event');
            throw error;
        }
    }

    /**
     * Register custom event handler
     */
    registerHandler(
        eventType: string,
        handler: (event: IoTEvent) => Promise<void>
    ): void {
        this.handlers.set(eventType, handler);
        logger.info({ eventType }, 'Registered custom IoT event handler');
    }

    /**
     * Trigger an alert (internal helper)
     */
    private async triggerAlert(alert: AlertEvent): Promise<void> {
        const handler = this.handlers.get('alert');
        if (handler) {
            await handler(alert);
        }
    }

    /**
     * Get room occupancy state
     */
    async getRoomOccupancy(roomId: string): Promise<OccupancyEvent['payload'] | null> {
        const events = await this.eventStore.getEvents(`room:${roomId}`, {
            limit: 1,
            reverse: true,
        });

        if (events.length === 0) return null;

        const lastEvent = events[0];
        if (lastEvent.type === 'RoomOccupancyChanged') {
            return lastEvent.data as OccupancyEvent['payload'];
        }

        return null;
    }
}

export default IoTEventHandler;
