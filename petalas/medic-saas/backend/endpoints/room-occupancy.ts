/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MedicSaaS - Room Occupancy Endpoint
 * Uses @magicsaas/iot-mesh for real-time room status
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { Redis } from 'ioredis';
import Redis from 'ioredis';
import {
    createIoTMesh,
    type IoTMeshInstance,
    type RoomOccupancy,
} from '@magicsaas/iot-mesh';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const config = {
    mqtt: {
        broker_url: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
        client_id: `medic-saas-${process.env.INSTANCE_ID || 'main'}`,
        topics: [
            'magicsaas/+/medic-saas/sensors/#',
            'magicsaas/+/medic-saas/occupancy/#',
        ],
    },
    redis_url: process.env.REDIS_URL || 'redis://localhost:6379',
    tenant_id: process.env.TENANT_ID || 'default',
    petala: 'medic-saas',
    zigbee: {
        enabled: process.env.ZIGBEE_ENABLED === 'true',
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOM OCCUPANCY SERVICE
// ═══════════════════════════════════════════════════════════════════════════

let iotMesh: IoTMeshInstance | null = null;
let redis: Redis | null = null;

/**
 * Initialize IoT Mesh connection
 */
export async function initializeIoTMesh(): Promise<void> {
    if (iotMesh) return;

    redis = new Redis(config.redis_url);
    iotMesh = await createIoTMesh(config, redis);

    console.log('[MedicSaaS] IoT Mesh initialized');

    // Register clinic rooms
    await registerClinicRooms();

    // Set up event handlers
    iotMesh.occupancy.on('room_occupied', ({ room, event }) => {
        console.log(`[MedicSaaS] Room ${room.room_name} is now occupied`);
        // Trigger Inngest workflow if patient arrival detected
        if (event?.type === 'patient.arrived') {
            triggerPatientArrivalWorkflow(room);
        }
    });

    iotMesh.occupancy.on('room_available', ({ room }) => {
        console.log(`[MedicSaaS] Room ${room.room_name} is now available`);
    });
}

/**
 * Register clinic rooms for occupancy tracking
 */
async function registerClinicRooms(): Promise<void> {
    if (!iotMesh) return;

    const rooms = [
        { room_id: 'reception', room_name: 'Recepção', sensors: [] },
        { room_id: 'waiting-room', room_name: 'Sala de Espera', sensors: [] },
        { room_id: 'consult-1', room_name: 'Consultório 1', sensors: [] },
        { room_id: 'consult-2', room_name: 'Consultório 2', sensors: [] },
        { room_id: 'consult-3', room_name: 'Consultório 3', sensors: [] },
        { room_id: 'exam-1', room_name: 'Sala de Exames 1', sensors: [] },
        { room_id: 'exam-2', room_name: 'Sala de Exames 2', sensors: [] },
        { room_id: 'procedure', room_name: 'Sala de Procedimentos', sensors: [] },
    ];

    for (const room of rooms) {
        await iotMesh.occupancy.registerRoom(room);
    }

    console.log(`[MedicSaaS] Registered ${rooms.length} clinic rooms`);
}

/**
 * Trigger patient arrival workflow via Inngest
 */
async function triggerPatientArrivalWorkflow(room: RoomOccupancy): Promise<void> {
    // This would integrate with Inngest in production
    console.log(`[MedicSaaS] Triggering patient arrival workflow for ${room.room_name}`);
    // inngest.send({ name: 'medic-saas/patient.arrived', data: { room } });
}

// ═══════════════════════════════════════════════════════════════════════════
// API HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/rooms - Get all room occupancy status
 */
export async function getAllRooms(): Promise<RoomOccupancy[]> {
    if (!iotMesh) {
        await initializeIoTMesh();
    }
    return iotMesh!.occupancy.getAllRooms();
}

/**
 * GET /api/rooms/:roomId - Get specific room status
 */
export async function getRoomStatus(roomId: string): Promise<RoomOccupancy | null> {
    if (!iotMesh) {
        await initializeIoTMesh();
    }
    return iotMesh!.occupancy.getRoomState(roomId);
}

/**
 * POST /api/rooms/:roomId/assign - Assign appointment to room
 */
export async function assignAppointmentToRoom(
    roomId: string,
    appointmentId: string,
    patientId?: string,
    providerId?: string
): Promise<void> {
    if (!iotMesh) {
        await initializeIoTMesh();
    }
    await iotMesh!.occupancy.assignAppointment(roomId, appointmentId, patientId, providerId);
}

/**
 * POST /api/rooms/:roomId/status - Set room status (maintenance/cleaning)
 */
export async function setRoomMaintenanceStatus(
    roomId: string,
    status: 'maintenance' | 'cleaning'
): Promise<void> {
    if (!iotMesh) {
        await initializeIoTMesh();
    }
    await iotMesh!.occupancy.setRoomMaintenance(roomId, status);
}

/**
 * Cleanup connections
 */
export async function shutdown(): Promise<void> {
    if (iotMesh) {
        await iotMesh.disconnect();
        iotMesh = null;
    }
    if (redis) {
        await redis.quit();
        redis = null;
    }
}
