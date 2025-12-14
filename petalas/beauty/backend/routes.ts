/**
 * Beauty Salon Backend API
 * Endpoints for appointments, clients, services, and staff management
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const ClientSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().optional(),
    phone: z.string().min(10),
    birthDate: z.string().optional(),
    preferences: z.record(z.string()).optional(),
    notes: z.string().optional(),
});

const ServiceSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    duration: z.number().min(15), // minutes
    price: z.number().positive(),
    category: z.string(),
    active: z.boolean().default(true),
});

const AppointmentSchema = z.object({
    clientId: z.string().uuid(),
    staffId: z.string().uuid(),
    serviceIds: z.array(z.string().uuid()),
    scheduledAt: z.string().datetime(),
    notes: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════════════════════════════

router.get('/clients', async (req: Request, res: Response) => {
    // List clients with pagination
    const { page = 1, limit = 20, search } = req.query;
    // TODO: Connect to Directus
    res.json({
        data: [],
        pagination: { page: Number(page), limit: Number(limit), total: 0 },
    });
});

router.get('/clients/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ data: { id, name: 'Sample Client' } });
});

router.post('/clients', async (req: Request, res: Response) => {
    const result = ClientSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }
    // TODO: Create in Directus
    res.status(201).json({ id: crypto.randomUUID(), ...result.data });
});

router.put('/clients/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = ClientSchema.partial().safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }
    res.json({ id, ...result.data });
});

router.get('/clients/:id/history', async (req: Request, res: Response) => {
    const { id } = req.params;
    // Get appointment history
    res.json({ data: [] });
});

// ═══════════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════════

router.get('/services', async (req: Request, res: Response) => {
    const { category, active } = req.query;
    res.json({ data: [] });
});

router.get('/services/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ data: { id, name: 'Sample Service', price: 50 } });
});

router.post('/services', async (req: Request, res: Response) => {
    const result = ServiceSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }
    res.status(201).json({ id: crypto.randomUUID(), ...result.data });
});

router.put('/services/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = ServiceSchema.partial().safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }
    res.json({ id, ...result.data });
});

// ═══════════════════════════════════════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════════════════════════════════════

router.get('/appointments', async (req: Request, res: Response) => {
    const { date, staffId, status } = req.query;
    res.json({ data: [] });
});

router.get('/appointments/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({ data: { id, status: 'scheduled' } });
});

router.post('/appointments', async (req: Request, res: Response) => {
    const result = AppointmentSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }
    // TODO: Check availability, create in Directus
    res.status(201).json({
        id: crypto.randomUUID(),
        ...result.data,
        status: 'scheduled',
    });
});

router.put('/appointments/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    res.json({ id, status });
});

router.delete('/appointments/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    // TODO: Cancel appointment, notify client
    res.json({ message: 'Appointment cancelled', id });
});

// ═══════════════════════════════════════════════════════════════════════════
// STAFF
// ═══════════════════════════════════════════════════════════════════════════

router.get('/staff', async (req: Request, res: Response) => {
    res.json({ data: [] });
});

router.get('/staff/:id/schedule', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { date } = req.query;
    res.json({ data: { staffId: id, date, slots: [] } });
});

router.get('/staff/:id/availability', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { date, serviceId } = req.query;
    // Return available time slots
    res.json({
        data: {
            staffId: id,
            date,
            availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

router.get('/dashboard/stats', async (req: Request, res: Response) => {
    res.json({
        data: {
            todayAppointments: 12,
            weekRevenue: 4500,
            newClients: 8,
            occupancyRate: 75,
        }
    });
});

router.get('/dashboard/upcoming', async (req: Request, res: Response) => {
    // Next 5 appointments
    res.json({ data: [] });
});

export default router;
