/**
 * Hospitality Backend API
 * Endpoints for rooms, reservations, guests, and housekeeping
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const GuestSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    documentType: z.enum(['cpf', 'passport', 'rg']),
    documentNumber: z.string(),
    nationality: z.string().optional(),
    preferences: z.record(z.string()).optional(),
});

const ReservationSchema = z.object({
    guestId: z.string().uuid(),
    roomTypeId: z.string().uuid(),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    adults: z.number().min(1),
    children: z.number().min(0).default(0),
    specialRequests: z.string().optional(),
    source: z.enum(['direct', 'booking', 'expedia', 'airbnb', 'other']).default('direct'),
});

const RoomSchema = z.object({
    number: z.string(),
    floor: z.number(),
    roomTypeId: z.string().uuid(),
    status: z.enum(['available', 'occupied', 'cleaning', 'maintenance', 'out_of_order']),
    amenities: z.array(z.string()).optional(),
});

// ═══════════════════════════════════════════════════════════════════════════
// ROOMS
// ═══════════════════════════════════════════════════════════════════════════

router.get('/rooms', async (req: Request, res: Response) => {
    const { floor, status, roomTypeId } = req.query;
    res.json({ data: [] });
});

router.get('/rooms/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ data: { id, number: '101', status: 'available' } });
});

router.put('/rooms/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    res.json({ id, status, notes });
});

router.get('/rooms/availability', async (req: Request, res: Response) => {
    const { checkIn, checkOut, roomTypeId, adults } = req.query;
    res.json({
        data: {
            available: [],
            checkIn,
            checkOut,
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ROOM TYPES
// ═══════════════════════════════════════════════════════════════════════════

router.get('/room-types', async (req: Request, res: Response) => {
    res.json({
        data: [
            { id: '1', name: 'Standard', capacity: 2, basePrice: 200 },
            { id: '2', name: 'Deluxe', capacity: 2, basePrice: 350 },
            { id: '3', name: 'Suite', capacity: 4, basePrice: 600 },
        ]
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// GUESTS
// ═══════════════════════════════════════════════════════════════════════════

router.get('/guests', async (req: Request, res: Response) => {
    const { search, page = 1, limit = 20 } = req.query;
    res.json({ data: [], pagination: { page, limit, total: 0 } });
});

router.get('/guests/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ data: { id, firstName: 'John', lastName: 'Doe' } });
});

router.post('/guests', async (req: Request, res: Response) => {
    const result = GuestSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }
    res.status(201).json({ id: crypto.randomUUID(), ...result.data });
});

router.get('/guests/:id/stays', async (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ data: [] });
});

// ═══════════════════════════════════════════════════════════════════════════
// RESERVATIONS
// ═══════════════════════════════════════════════════════════════════════════

router.get('/reservations', async (req: Request, res: Response) => {
    const { status, checkIn, checkOut } = req.query;
    res.json({ data: [] });
});

router.get('/reservations/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ data: { id, status: 'confirmed' } });
});

router.post('/reservations', async (req: Request, res: Response) => {
    const result = ReservationSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }
    // TODO: Check availability, calculate price, create in Directus
    res.status(201).json({
        id: crypto.randomUUID(),
        ...result.data,
        status: 'pending',
        confirmationCode: `RES-${Date.now()}`,
    });
});

router.put('/reservations/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    res.json({ id, status });
});

router.post('/reservations/:id/check-in', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { roomId } = req.body;
    // TODO: Assign room, update status, generate key
    res.json({
        id,
        status: 'checked_in',
        roomId,
        keyCode: Math.random().toString().substring(2, 8),
    });
});

router.post('/reservations/:id/check-out', async (req: Request, res: Response) => {
    const { id } = req.params;
    // TODO: Calculate final bill, process payment, update room status
    res.json({
        id,
        status: 'checked_out',
        finalBill: { total: 0, charges: [] },
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// HOUSEKEEPING
// ═══════════════════════════════════════════════════════════════════════════

router.get('/housekeeping/tasks', async (req: Request, res: Response) => {
    const { status, floor, assignedTo } = req.query;
    res.json({ data: [] });
});

router.post('/housekeeping/tasks', async (req: Request, res: Response) => {
    const { roomId, type, priority, notes } = req.body;
    res.status(201).json({
        id: crypto.randomUUID(),
        roomId,
        type,
        priority,
        status: 'pending',
    });
});

router.put('/housekeeping/tasks/:id/complete', async (req: Request, res: Response) => {
    const { id } = req.params;
    // TODO: Update room status, notify front desk
    res.json({ id, status: 'completed', completedAt: new Date() });
});

// ═══════════════════════════════════════════════════════════════════════════
// IOT INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

router.get('/rooms/:id/sensors', async (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({
        data: {
            roomId: id,
            temperature: 22,
            humidity: 45,
            occupied: false,
            lastMotion: null,
        }
    });
});

router.post('/rooms/:id/climate', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { temperature, mode } = req.body;
    // TODO: Send command to IoT device
    res.json({ roomId: id, temperature, mode, status: 'command_sent' });
});

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

router.get('/dashboard/stats', async (req: Request, res: Response) => {
    res.json({
        data: {
            occupancyRate: 78,
            todayArrivals: 12,
            todayDepartures: 8,
            roomsToClean: 5,
            revenue: { today: 4500, week: 32000, month: 145000 },
        }
    });
});

router.get('/dashboard/room-status', async (req: Request, res: Response) => {
    // Room grid for front desk
    res.json({
        data: {
            available: 15,
            occupied: 42,
            cleaning: 3,
            maintenance: 2,
        }
    });
});

export default router;
