/**
 * ═══════════════════════════════════════════════════════════════════════════
 * @magicsaas/iot-mesh - MQTT Client Wrapper
 * Cognitive Mesh OS Layer 11 - IoT Integration
 * ═══════════════════════════════════════════════════════════════════════════
 */

import mqtt, { MqttClient, IClientOptions, IPublishPacket } from 'mqtt';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import type { MqttClientConfig, MqttMessage, SensorEvent, SensorEventType } from '../types/iot.types.js';

// ═══════════════════════════════════════════════════════════════════════════
// MQTT CLIENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class MqttMeshClient extends EventEmitter {
    private client: MqttClient | null = null;
    private config: MqttClientConfig;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private isConnected = false;

    constructor(config: MqttClientConfig) {
        super();
        this.config = {
            keepalive: 60,
            reconnect_period: 5000,
            qos: 1,
            ...config,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONNECTION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Connect to MQTT broker
     */
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const options: IClientOptions = {
                clientId: this.config.client_id,
                keepalive: this.config.keepalive,
                reconnectPeriod: this.config.reconnect_period,
                clean: true,
                username: this.config.username,
                password: this.config.password,
                will: this.config.will,
            };

            this.client = mqtt.connect(this.config.broker_url, options);

            this.client.on('connect', () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log(`[IoT-Mesh] Connected to MQTT broker: ${this.config.broker_url}`);

                // Subscribe to initial topics
                if (this.config.topics?.length) {
                    this.subscribeMultiple(this.config.topics);
                }

                this.emit('connected');
                resolve();
            });

            this.client.on('error', (error) => {
                console.error('[IoT-Mesh] MQTT Error:', error.message);
                this.emit('error', error);
                if (!this.isConnected) {
                    reject(error);
                }
            });

            this.client.on('close', () => {
                this.isConnected = false;
                console.log('[IoT-Mesh] MQTT connection closed');
                this.emit('disconnected');
            });

            this.client.on('reconnect', () => {
                this.reconnectAttempts++;
                console.log(`[IoT-Mesh] Reconnecting... Attempt ${this.reconnectAttempts}`);
                this.emit('reconnecting', this.reconnectAttempts);

                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error('[IoT-Mesh] Max reconnect attempts reached');
                    this.disconnect();
                }
            });

            this.client.on('message', (topic: string, payload: Buffer, packet: IPublishPacket) => {
                try {
                    const message: MqttMessage = {
                        topic,
                        payload: this.parsePayload(payload),
                        qos: packet.qos as 0 | 1 | 2,
                        retain: packet.retain,
                        timestamp: new Date(),
                    };

                    this.emit('message', message);
                    this.emit(`topic:${topic}`, message);

                    // Parse as sensor event if applicable
                    const sensorEvent = this.parseSensorEvent(message);
                    if (sensorEvent) {
                        this.emit('sensor_event', sensorEvent);
                        this.emit(`event:${sensorEvent.type}`, sensorEvent);
                    }
                } catch (error) {
                    console.error('[IoT-Mesh] Error processing message:', error);
                }
            });
        });
    }

    /**
     * Disconnect from MQTT broker
     */
    async disconnect(): Promise<void> {
        return new Promise((resolve) => {
            if (this.client) {
                this.client.end(true, {}, () => {
                    this.isConnected = false;
                    this.client = null;
                    console.log('[IoT-Mesh] Disconnected from MQTT broker');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SUBSCRIBE / PUBLISH
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Subscribe to a topic
     */
    subscribe(topic: string, qos: 0 | 1 | 2 = 1): void {
        if (!this.client || !this.isConnected) {
            throw new Error('[IoT-Mesh] Not connected to MQTT broker');
        }

        this.client.subscribe(topic, { qos }, (err) => {
            if (err) {
                console.error(`[IoT-Mesh] Subscribe error for ${topic}:`, err);
            } else {
                console.log(`[IoT-Mesh] Subscribed to: ${topic}`);
            }
        });
    }

    /**
     * Subscribe to multiple topics
     */
    subscribeMultiple(topics: string[], qos: 0 | 1 | 2 = 1): void {
        topics.forEach(topic => this.subscribe(topic, qos));
    }

    /**
     * Unsubscribe from a topic
     */
    unsubscribe(topic: string): void {
        if (this.client && this.isConnected) {
            this.client.unsubscribe(topic);
            console.log(`[IoT-Mesh] Unsubscribed from: ${topic}`);
        }
    }

    /**
     * Publish a message to a topic
     */
    async publish(
        topic: string,
        payload: string | object,
        options?: { qos?: 0 | 1 | 2; retain?: boolean }
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client || !this.isConnected) {
                reject(new Error('[IoT-Mesh] Not connected to MQTT broker'));
                return;
            }

            const message = typeof payload === 'object' ? JSON.stringify(payload) : payload;

            this.client.publish(
                topic,
                message,
                {
                    qos: options?.qos ?? this.config.qos ?? 1,
                    retain: options?.retain ?? false,
                },
                (err) => {
                    if (err) {
                        console.error(`[IoT-Mesh] Publish error for ${topic}:`, err);
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TOPIC PATTERNS (MagicSaaS Convention)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get topic pattern for a tenant
     * Pattern: magicsaas/{tenant_id}/{petala}/{category}/{+}
     */
    static getTenantTopic(tenantId: string, petala: string, category: string): string {
        return `magicsaas/${tenantId}/${petala}/${category}/+`;
    }

    /**
     * Get topic for sensor events
     */
    static getSensorTopic(tenantId: string, petala: string, deviceId: string): string {
        return `magicsaas/${tenantId}/${petala}/sensors/${deviceId}`;
    }

    /**
     * Get topic for room occupancy
     */
    static getOccupancyTopic(tenantId: string, petala: string, roomId: string): string {
        return `magicsaas/${tenantId}/${petala}/occupancy/${roomId}`;
    }

    /**
     * Get topic for commands (actuators)
     */
    static getCommandTopic(tenantId: string, petala: string, deviceId: string): string {
        return `magicsaas/${tenantId}/${petala}/commands/${deviceId}`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Parse MQTT payload (handle JSON or string)
     */
    private parsePayload(payload: Buffer): string | Record<string, unknown> {
        const str = payload.toString();
        try {
            return JSON.parse(str);
        } catch {
            return str;
        }
    }

    /**
     * Parse message as SensorEvent if valid
     */
    private parseSensorEvent(message: MqttMessage): SensorEvent | null {
        if (typeof message.payload !== 'object') return null;

        const payload = message.payload as Record<string, unknown>;

        // Check if payload has required sensor event fields
        if (!payload.type || !payload.device_id || !payload.value) {
            return null;
        }

        try {
            return {
                id: (payload.id as string) || uuidv4(),
                type: payload.type as SensorEventType,
                device_id: payload.device_id as string,
                tenant_id: payload.tenant_id as string,
                petala: payload.petala as string,
                timestamp: payload.timestamp ? new Date(payload.timestamp as string) : new Date(),
                value: payload.value as boolean | number | string | Record<string, unknown>,
                unit: payload.unit as string | undefined,
                previous_value: payload.previous_value as boolean | number | string | Record<string, unknown> | undefined,
                metadata: payload.metadata as SensorEvent['metadata'],
            };
        } catch {
            return null;
        }
    }

    /**
     * Get connection status
     */
    get connected(): boolean {
        return this.isConnected;
    }
}
