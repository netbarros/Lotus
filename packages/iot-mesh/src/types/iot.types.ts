/**
 * ═══════════════════════════════════════════════════════════════════════════
 * @magicsaas/iot-mesh - IoT Type Definitions
 * Part of the Cognitive Mesh OS Layer 11
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const DeviceTypeSchema = z.enum([
    'sensor',
    'actuator',
    'gateway',
    'controller',
    'display',
    'camera',
    'lock',
    'thermostat',
    'light',
    'switch',
    'motion_sensor',
    'door_sensor',
    'occupancy_sensor',
    'temperature_sensor',
    'humidity_sensor',
    'air_quality_sensor',
    'wearable',
    'beacon',
]);

export type DeviceType = z.infer<typeof DeviceTypeSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const IoTDeviceSchema = z.object({
    id: z.string().uuid(),
    type: DeviceTypeSchema,
    name: z.string(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    firmware_version: z.string().optional(),
    protocol: z.enum(['mqtt', 'zigbee', 'zwave', 'wifi', 'ble', 'thread', 'matter']),
    location: z.object({
        building: z.string().optional(),
        floor: z.string().optional(),
        room: z.string(),
        zone: z.string().optional(),
        coordinates: z.object({
            lat: z.number(),
            lng: z.number(),
        }).optional(),
    }),
    tenant_id: z.string().uuid(),
    petala: z.string(), // Which petal owns this device
    status: z.enum(['online', 'offline', 'error', 'maintenance']),
    battery_level: z.number().min(0).max(100).optional(),
    signal_strength: z.number().optional(),
    last_seen: z.date(),
    metadata: z.record(z.unknown()).optional(),
});

export type IoTDevice = z.infer<typeof IoTDeviceSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// SENSOR EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const SensorEventTypeSchema = z.enum([
    // Occupancy
    'occupancy.detected',
    'occupancy.cleared',
    'occupancy.count_changed',

    // Motion
    'motion.detected',
    'motion.cleared',

    // Door/Window
    'door.opened',
    'door.closed',
    'window.opened',
    'window.closed',

    // Environmental
    'temperature.changed',
    'humidity.changed',
    'air_quality.changed',
    'co2.threshold_exceeded',

    // Medical (MedicSaaS specific)
    'patient.arrived',
    'patient.left',
    'vitals.updated',
    'alert.triggered',

    // Access Control
    'access.granted',
    'access.denied',
    'badge.scanned',

    // Generic
    'device.online',
    'device.offline',
    'device.error',
    'device.battery_low',
]);

export type SensorEventType = z.infer<typeof SensorEventTypeSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// SENSOR EVENT SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const SensorEventSchema = z.object({
    id: z.string().uuid(),
    type: SensorEventTypeSchema,
    device_id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    petala: z.string(),
    timestamp: z.date(),
    value: z.union([
        z.boolean(),
        z.number(),
        z.string(),
        z.record(z.unknown()),
    ]),
    unit: z.string().optional(), // e.g., '°C', '%', 'ppm'
    previous_value: z.union([
        z.boolean(),
        z.number(),
        z.string(),
        z.record(z.unknown()),
    ]).optional(),
    metadata: z.object({
        room: z.string().optional(),
        zone: z.string().optional(),
        confidence: z.number().min(0).max(1).optional(),
        source: z.string().optional(),
    }).optional(),
});

export type SensorEvent = z.infer<typeof SensorEventSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// MQTT MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const MqttMessageSchema = z.object({
    topic: z.string(),
    payload: z.union([z.string(), z.record(z.unknown())]),
    qos: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
    retain: z.boolean().optional(),
    timestamp: z.date(),
});

export type MqttMessage = z.infer<typeof MqttMessageSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// ZIGBEE DEVICE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const ZigbeeDeviceSchema = z.object({
    ieee_address: z.string(), // e.g., '0x00158d0001234567'
    friendly_name: z.string(),
    type: z.enum(['Coordinator', 'Router', 'EndDevice']),
    network_address: z.number(),
    manufacturer: z.string().optional(),
    model_id: z.string().optional(),
    power_source: z.enum(['Battery', 'Mains', 'Unknown']).optional(),
    interview_completed: z.boolean(),
    last_seen: z.date().optional(),
});

export type ZigbeeDevice = z.infer<typeof ZigbeeDeviceSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// ROOM OCCUPANCY (MedicSaaS Use Case)
// ═══════════════════════════════════════════════════════════════════════════

export const RoomOccupancySchema = z.object({
    room_id: z.string(),
    room_name: z.string(),
    is_occupied: z.boolean(),
    occupant_count: z.number().min(0),
    last_activity: z.date(),
    sensors: z.array(z.string().uuid()), // Device IDs of sensors
    status: z.enum(['available', 'occupied', 'reserved', 'maintenance', 'cleaning']),
    current_appointment_id: z.string().uuid().optional(),
    patient_id: z.string().uuid().optional(),
    provider_id: z.string().uuid().optional(),
});

export type RoomOccupancy = z.infer<typeof RoomOccupancySchema>;

// ═══════════════════════════════════════════════════════════════════════════
// MQTT CLIENT CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export interface MqttClientConfig {
    broker_url: string;           // e.g., 'mqtt://localhost:1883'
    client_id: string;
    username?: string;
    password?: string;
    keepalive?: number;           // seconds
    reconnect_period?: number;    // ms
    qos?: 0 | 1 | 2;
    topics?: string[];            // Initial topics to subscribe
    will?: {
        topic: string;
        payload: string;
        qos: 0 | 1 | 2;
        retain: boolean;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// IOT MESH CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export interface IoTMeshConfig {
    mqtt: MqttClientConfig;
    redis_url: string;
    tenant_id: string;
    petala: string;
    zigbee?: {
        enabled: boolean;
        bridge_url?: string; // Zigbee2MQTT API URL
    };
    event_ttl_seconds?: number; // How long to keep events in Redis
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

export type SensorEventHandler = (event: SensorEvent) => void | Promise<void>;

export interface EventSubscription {
    event_types: SensorEventType[];
    handler: SensorEventHandler;
    filter?: {
        device_ids?: string[];
        rooms?: string[];
        zones?: string[];
    };
}
