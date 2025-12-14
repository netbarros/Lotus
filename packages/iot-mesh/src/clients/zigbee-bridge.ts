/**
 * ═══════════════════════════════════════════════════════════════════════════
 * @magicsaas/iot-mesh - Zigbee2MQTT Bridge
 * Cognitive Mesh OS Layer 11 - Zigbee Device Integration
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { EventEmitter } from 'events';
import type { ZigbeeDevice, SensorEvent, SensorEventType } from '../types/iot.types.js';
import { MqttMeshClient } from './mqtt-client.js';

// ═══════════════════════════════════════════════════════════════════════════
// ZIGBEE BRIDGE CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export interface ZigbeeBridgeConfig {
    mqtt_client: MqttMeshClient;
    base_topic: string;          // Default: 'zigbee2mqtt'
    tenant_id: string;
    petala: string;
    device_mapping?: Map<string, string>; // ieee_address -> room_id
}

// ═══════════════════════════════════════════════════════════════════════════
// ZIGBEE2MQTT BRIDGE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class Zigbee2MqttBridge extends EventEmitter {
    private mqtt: MqttMeshClient;
    private baseTopic: string;
    private tenantId: string;
    private petala: string;
    private devices: Map<string, ZigbeeDevice> = new Map();
    private deviceMapping: Map<string, string>;
    private isInitialized = false;

    constructor(config: ZigbeeBridgeConfig) {
        super();
        this.mqtt = config.mqtt_client;
        this.baseTopic = config.base_topic || 'zigbee2mqtt';
        this.tenantId = config.tenant_id;
        this.petala = config.petala;
        this.deviceMapping = config.device_mapping || new Map();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Initialize the Zigbee bridge
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        // Subscribe to Zigbee2MQTT topics
        this.mqtt.subscribe(`${this.baseTopic}/bridge/state`);
        this.mqtt.subscribe(`${this.baseTopic}/bridge/devices`);
        this.mqtt.subscribe(`${this.baseTopic}/bridge/event`);
        this.mqtt.subscribe(`${this.baseTopic}/+`); // Device updates

        // Listen for messages
        this.mqtt.on('message', (message) => this.handleMessage(message));

        // Request device list
        await this.requestDeviceList();

        this.isInitialized = true;
        console.log('[Zigbee2MQTT] Bridge initialized');
    }

    /**
     * Request current device list from Zigbee2MQTT
     */
    async requestDeviceList(): Promise<void> {
        await this.mqtt.publish(`${this.baseTopic}/bridge/request/devices`, '');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MESSAGE HANDLING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Handle incoming MQTT messages
     */
    private handleMessage(message: { topic: string; payload: unknown }): void {
        const { topic, payload } = message;

        // Bridge state
        if (topic === `${this.baseTopic}/bridge/state`) {
            const state = typeof payload === 'object' ? (payload as Record<string, unknown>).state : payload;
            this.emit('bridge_state', state);
            console.log(`[Zigbee2MQTT] Bridge state: ${state}`);
            return;
        }

        // Device list update
        if (topic === `${this.baseTopic}/bridge/devices`) {
            this.handleDeviceListUpdate(payload as Record<string, unknown>[]);
            return;
        }

        // Bridge events (pairing, leave, etc.)
        if (topic === `${this.baseTopic}/bridge/event`) {
            this.handleBridgeEvent(payload as Record<string, unknown>);
            return;
        }

        // Individual device updates
        const deviceName = topic.replace(`${this.baseTopic}/`, '');
        if (!deviceName.startsWith('bridge/')) {
            this.handleDeviceUpdate(deviceName, payload as Record<string, unknown>);
        }
    }

    /**
     * Handle device list update from Zigbee2MQTT
     */
    private handleDeviceListUpdate(devices: Record<string, unknown>[]): void {
        if (!Array.isArray(devices)) return;

        this.devices.clear();

        for (const device of devices) {
            const zigbeeDevice: ZigbeeDevice = {
                ieee_address: device.ieee_address as string,
                friendly_name: device.friendly_name as string,
                type: device.type as 'Coordinator' | 'Router' | 'EndDevice',
                network_address: device.network_address as number,
                manufacturer: device.manufacturer as string | undefined,
                model_id: device.model_id as string | undefined,
                power_source: device.power_source as 'Battery' | 'Mains' | 'Unknown' | undefined,
                interview_completed: device.interview_completed as boolean,
                last_seen: device.last_seen ? new Date(device.last_seen as string) : undefined,
            };

            this.devices.set(zigbeeDevice.ieee_address, zigbeeDevice);
        }

        console.log(`[Zigbee2MQTT] Loaded ${this.devices.size} devices`);
        this.emit('devices_updated', Array.from(this.devices.values()));
    }

    /**
     * Handle bridge events (pairing, leave, etc.)
     */
    private handleBridgeEvent(event: Record<string, unknown>): void {
        const eventType = event.type as string;
        const data = event.data as Record<string, unknown>;

        switch (eventType) {
            case 'device_joined':
                console.log(`[Zigbee2MQTT] Device joined: ${data.friendly_name}`);
                this.emit('device_joined', data);
                break;
            case 'device_leave':
                console.log(`[Zigbee2MQTT] Device left: ${data.friendly_name}`);
                this.emit('device_left', data);
                break;
            case 'device_interview':
                console.log(`[Zigbee2MQTT] Device interview: ${data.friendly_name} - ${data.status}`);
                this.emit('device_interview', data);
                break;
            default:
                this.emit('bridge_event', event);
        }
    }

    /**
     * Handle individual device state update
     */
    private handleDeviceUpdate(deviceName: string, payload: Record<string, unknown>): void {
        // Find device by friendly name
        const device = Array.from(this.devices.values()).find(
            d => d.friendly_name === deviceName
        );

        if (!device) {
            console.warn(`[Zigbee2MQTT] Unknown device: ${deviceName}`);
            return;
        }

        // Convert to sensor event
        const sensorEvent = this.convertToSensorEvent(device, payload);
        if (sensorEvent) {
            this.emit('sensor_event', sensorEvent);
        }

        // Emit raw device update
        this.emit('device_update', { device, payload });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SENSOR EVENT CONVERSION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Convert Zigbee device payload to MagicSaaS SensorEvent
     */
    private convertToSensorEvent(
        device: ZigbeeDevice,
        payload: Record<string, unknown>
    ): SensorEvent | null {
        const roomId = this.deviceMapping.get(device.ieee_address) || 'unknown';
        const baseEvent = {
            id: crypto.randomUUID(),
            device_id: device.ieee_address,
            tenant_id: this.tenantId,
            petala: this.petala,
            timestamp: new Date(),
            metadata: {
                room: roomId,
                source: 'zigbee2mqtt',
            },
        };

        // Occupancy sensor
        if ('occupancy' in payload) {
            return {
                ...baseEvent,
                type: payload.occupancy ? 'occupancy.detected' : 'occupancy.cleared',
                value: payload.occupancy as boolean,
            };
        }

        // Motion sensor
        if ('motion' in payload) {
            return {
                ...baseEvent,
                type: payload.motion ? 'motion.detected' : 'motion.cleared',
                value: payload.motion as boolean,
            };
        }

        // Door/window contact sensor
        if ('contact' in payload) {
            return {
                ...baseEvent,
                type: payload.contact ? 'door.closed' : 'door.opened',
                value: !payload.contact as boolean, // contact=true means closed
            };
        }

        // Temperature sensor
        if ('temperature' in payload) {
            return {
                ...baseEvent,
                type: 'temperature.changed',
                value: payload.temperature as number,
                unit: '°C',
            };
        }

        // Humidity sensor
        if ('humidity' in payload) {
            return {
                ...baseEvent,
                type: 'humidity.changed',
                value: payload.humidity as number,
                unit: '%',
            };
        }

        // Battery level
        if ('battery' in payload && (payload.battery as number) < 20) {
            return {
                ...baseEvent,
                type: 'device.battery_low',
                value: payload.battery as number,
                unit: '%',
            };
        }

        return null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DEVICE CONTROL
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Send command to a device
     */
    async sendCommand(deviceName: string, command: Record<string, unknown>): Promise<void> {
        await this.mqtt.publish(`${this.baseTopic}/${deviceName}/set`, command);
        console.log(`[Zigbee2MQTT] Command sent to ${deviceName}:`, command);
    }

    /**
     * Get command to request device state
     */
    async requestDeviceState(deviceName: string): Promise<void> {
        await this.mqtt.publish(`${this.baseTopic}/${deviceName}/get`, { state: '' });
    }

    /**
     * Enable pairing mode
     */
    async enablePairing(timeout: number = 120): Promise<void> {
        await this.mqtt.publish(`${this.baseTopic}/bridge/request/permit_join`, {
            value: true,
            time: timeout,
        });
        console.log(`[Zigbee2MQTT] Pairing mode enabled for ${timeout}s`);
    }

    /**
     * Disable pairing mode
     */
    async disablePairing(): Promise<void> {
        await this.mqtt.publish(`${this.baseTopic}/bridge/request/permit_join`, {
            value: false,
        });
        console.log('[Zigbee2MQTT] Pairing mode disabled');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get all known devices
     */
    getDevices(): ZigbeeDevice[] {
        return Array.from(this.devices.values());
    }

    /**
     * Get device by IEEE address
     */
    getDevice(ieeeAddress: string): ZigbeeDevice | undefined {
        return this.devices.get(ieeeAddress);
    }

    /**
     * Map device to room
     */
    mapDeviceToRoom(ieeeAddress: string, roomId: string): void {
        this.deviceMapping.set(ieeeAddress, roomId);
    }
}
