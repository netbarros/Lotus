/**
 * ═══════════════════════════════════════════════════════════════════════════
 * @magicsaas/iot-mesh - Room Occupancy Handler
 * Cognitive Mesh OS Layer 11 - MedicSaaS Use Case
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { EventEmitter } from 'events';
import type { Redis } from 'ioredis';
import type { RoomOccupancy, SensorEvent } from '../types/iot.types.js';

// ═══════════════════════════════════════════════════════════════════════════
// OCCUPANCY HANDLER CLASS
// ═══════════════════════════════════════════════════════════════════════════

export interface OccupancyHandlerConfig {
    redis: Redis;
    tenant_id: string;
    petala: string;
    occupancy_timeout_ms?: number; // Time before room is considered empty (default: 5 min)
    redis_key_prefix?: string;
}

export class RoomOccupancyHandler extends EventEmitter {
    private redis: Redis;
    private tenantId: string;
    private petala: string;
    private occupancyTimeout: number;
    private keyPrefix: string;
    private rooms: Map<string, RoomOccupancy> = new Map();
    private timeoutHandles: Map<string, NodeJS.Timeout> = new Map();

    constructor(config: OccupancyHandlerConfig) {
        super();
        this.redis = config.redis;
        this.tenantId = config.tenant_id;
        this.petala = config.petala;
        this.occupancyTimeout = config.occupancy_timeout_ms ?? 5 * 60 * 1000; // 5 minutes
        this.keyPrefix = config.redis_key_prefix ?? `magicsaas:${config.tenant_id}:${config.petala}:occupancy`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ROOM MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Register a room for occupancy tracking
     */
    async registerRoom(room: Omit<RoomOccupancy, 'is_occupied' | 'occupant_count' | 'last_activity'>): Promise<void> {
        const occupancy: RoomOccupancy = {
            ...room,
            is_occupied: false,
            occupant_count: 0,
            last_activity: new Date(),
            status: 'available',
        };

        this.rooms.set(room.room_id, occupancy);
        await this.saveRoomState(room.room_id, occupancy);

        console.log(`[Occupancy] Registered room: ${room.room_name} (${room.room_id})`);
    }

    /**
     * Get room occupancy state
     */
    async getRoomState(roomId: string): Promise<RoomOccupancy | null> {
        // Check memory first
        const cached = this.rooms.get(roomId);
        if (cached) return cached;

        // Load from Redis
        const data = await this.redis.get(`${this.keyPrefix}:${roomId}`);
        if (data) {
            const occupancy = JSON.parse(data) as RoomOccupancy;
            occupancy.last_activity = new Date(occupancy.last_activity);
            this.rooms.set(roomId, occupancy);
            return occupancy;
        }

        return null;
    }

    /**
     * Get all rooms occupancy state
     */
    async getAllRooms(): Promise<RoomOccupancy[]> {
        const keys = await this.redis.keys(`${this.keyPrefix}:*`);
        const rooms: RoomOccupancy[] = [];

        for (const key of keys) {
            const data = await this.redis.get(key);
            if (data) {
                const occupancy = JSON.parse(data) as RoomOccupancy;
                occupancy.last_activity = new Date(occupancy.last_activity);
                rooms.push(occupancy);
            }
        }

        return rooms;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT PROCESSING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Process sensor event and update room occupancy
     */
    async handleSensorEvent(event: SensorEvent): Promise<void> {
        const roomId = event.metadata?.room;
        if (!roomId) return;

        const room = await this.getRoomState(roomId);
        if (!room) {
            console.warn(`[Occupancy] Unknown room: ${roomId}`);
            return;
        }

        // Process based on event type
        switch (event.type) {
            case 'occupancy.detected':
            case 'motion.detected':
            case 'patient.arrived':
                await this.setRoomOccupied(roomId, true, event);
                break;

            case 'occupancy.cleared':
            case 'patient.left':
                await this.setRoomOccupied(roomId, false, event);
                break;

            case 'occupancy.count_changed':
                if (typeof event.value === 'number') {
                    await this.updateOccupantCount(roomId, event.value);
                }
                break;

            case 'door.opened':
                // Motion expected, extend timeout
                this.resetOccupancyTimeout(roomId);
                break;
        }
    }

    /**
     * Set room occupied state
     */
    async setRoomOccupied(roomId: string, occupied: boolean, event?: SensorEvent): Promise<void> {
        const room = await this.getRoomState(roomId);
        if (!room) return;

        const wasOccupied = room.is_occupied;
        room.is_occupied = occupied;
        room.last_activity = new Date();

        if (occupied) {
            room.status = 'occupied';
            room.occupant_count = Math.max(1, room.occupant_count);
            this.resetOccupancyTimeout(roomId);
        } else {
            room.status = 'available';
            room.occupant_count = 0;
            room.current_appointment_id = undefined;
            room.patient_id = undefined;
            room.provider_id = undefined;
            this.clearOccupancyTimeout(roomId);
        }

        await this.saveRoomState(roomId, room);

        // Emit events
        if (occupied && !wasOccupied) {
            this.emit('room_occupied', { room, event });
            console.log(`[Occupancy] Room occupied: ${room.room_name}`);
        } else if (!occupied && wasOccupied) {
            this.emit('room_available', { room, event });
            console.log(`[Occupancy] Room available: ${room.room_name}`);
        }

        this.emit('room_updated', room);
    }

    /**
     * Update occupant count
     */
    async updateOccupantCount(roomId: string, count: number): Promise<void> {
        const room = await this.getRoomState(roomId);
        if (!room) return;

        const previousCount = room.occupant_count;
        room.occupant_count = count;
        room.is_occupied = count > 0;
        room.status = count > 0 ? 'occupied' : 'available';
        room.last_activity = new Date();

        await this.saveRoomState(roomId, room);

        this.emit('room_count_changed', { room, previousCount, newCount: count });
        console.log(`[Occupancy] Room ${room.room_name} count: ${previousCount} → ${count}`);
    }

    /**
     * Assign appointment to room
     */
    async assignAppointment(
        roomId: string,
        appointmentId: string,
        patientId?: string,
        providerId?: string
    ): Promise<void> {
        const room = await this.getRoomState(roomId);
        if (!room) return;

        room.current_appointment_id = appointmentId;
        room.patient_id = patientId;
        room.provider_id = providerId;
        room.status = 'reserved';

        await this.saveRoomState(roomId, room);
        this.emit('room_assigned', { room, appointmentId, patientId, providerId });
        console.log(`[Occupancy] Room ${room.room_name} assigned to appointment ${appointmentId}`);
    }

    /**
     * Set room to maintenance/cleaning status
     */
    async setRoomMaintenance(roomId: string, status: 'maintenance' | 'cleaning'): Promise<void> {
        const room = await this.getRoomState(roomId);
        if (!room) return;

        room.status = status;
        room.is_occupied = false;
        room.occupant_count = 0;

        await this.saveRoomState(roomId, room);
        this.emit('room_maintenance', { room, status });
        console.log(`[Occupancy] Room ${room.room_name} set to ${status}`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TIMEOUT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Reset occupancy timeout for a room
     */
    private resetOccupancyTimeout(roomId: string): void {
        this.clearOccupancyTimeout(roomId);

        const handle = setTimeout(async () => {
            console.log(`[Occupancy] Timeout expired for room ${roomId}`);
            await this.setRoomOccupied(roomId, false);
        }, this.occupancyTimeout);

        this.timeoutHandles.set(roomId, handle);
    }

    /**
     * Clear occupancy timeout for a room
     */
    private clearOccupancyTimeout(roomId: string): void {
        const handle = this.timeoutHandles.get(roomId);
        if (handle) {
            clearTimeout(handle);
            this.timeoutHandles.delete(roomId);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Save room state to Redis
     */
    private async saveRoomState(roomId: string, occupancy: RoomOccupancy): Promise<void> {
        this.rooms.set(roomId, occupancy);
        await this.redis.set(
            `${this.keyPrefix}:${roomId}`,
            JSON.stringify(occupancy),
            'EX',
            86400 // 24 hour TTL
        );

        // Publish update for real-time subscribers
        await this.redis.publish(
            `${this.keyPrefix}:updates`,
            JSON.stringify({ type: 'room_updated', room: occupancy })
        );
    }

    /**
     * Subscribe to real-time room updates (for other services)
     */
    subscribeToUpdates(callback: (update: { type: string; room: RoomOccupancy }) => void): void {
        const subscriber = this.redis.duplicate();
        subscriber.subscribe(`${this.keyPrefix}:updates`);
        subscriber.on('message', (_channel, message) => {
            callback(JSON.parse(message));
        });
    }
}
