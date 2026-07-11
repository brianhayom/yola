import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// ─── Validation ───

const createTripSchema = z.object({
  title: z.string().optional(),
  destination: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budgetTotal: z.number().positive().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
});

const createChecklistSchema = z.object({
  category: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

const createVendorSchema = z.object({
  category: z.enum(['FLIGHT', 'HOTEL_AIRBNB', 'TOUR_OPERATOR', 'TRAVEL_INSURANCE', 'CAR_RENTAL', 'LOCAL_TRANSPORT', 'OTHER']),
  name: z.string().min(1),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  priceRange: z.string().optional(),
  notes: z.string().optional(),
});

const createExpenseSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().optional(),
  date: z.string().datetime().optional(),
  vendorName: z.string().optional(),
});

const createItinerarySchema = z.object({
  day: z.number().int().positive(),
  date: z.string().datetime().optional(),
  time: z.string().optional(),
  activity: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  duration: z.number().int().positive().optional(),
  cost: z.number().positive().optional(),
});

const createPackingItemSchema = z.object({
  category: z.string(),
  item: z.string().min(1),
  quantity: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

// ─────────────────────────────────────
// TRIP CRUD
// ─────────────────────────────────────

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.userId },
      include: {
        _count: { select: { checklists: true, vendors: true, itineraries: true } },
        budgets: { select: { category: true, allocated: true, spent: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ trips });
  } catch (error) {
    console.error('List trips error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = createTripSchema.parse(req.body);

    if (req.user?.plan === 'FREE') {
      const count = await prisma.trip.count({ where: { userId: req.userId } });
      if (count >= 1) {
        return res.status(403).json({
          error: 'Free plan allows only 1 active trip. Upgrade to Premium for unlimited.',
        });
      }
    }

    const trip = await prisma.trip.create({
      data: {
        userId: req.userId!,
        title: body.title || 'My Trip',
        destination: body.destination,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        budgetTotal: body.budgetTotal,
        currency: body.currency || 'IDR',
        notes: body.notes,
      },
    });

    // Default budget categories
    const categories = ['transport', 'accommodation', 'food', 'activities', 'shopping', 'misc'];
    await prisma.tripBudget.createMany({
      data: categories.map(cat => ({
        tripId: trip.id,
        category: cat,
        allocated: 0,
        spent: 0,
        currency: body.currency || 'IDR',
      })),
    });

    // Default checklist
    const tasks = [
      { category: 'pre_trip', title: 'Cek masa berlaku passport', priority: 'urgent', order: 1 },
      { category: 'pre_trip', title: 'Apply visa (jika diperlukan)', priority: 'urgent', order: 2 },
      { category: 'pre_trip', title: 'Cek rekomendasi destinasi & waktu terbaik', priority: 'high', order: 3 },
      { category: 'booking', title: 'Booking tiket pesawat/transport', priority: 'urgent', order: 1 },
      { category: 'booking', title: 'Booking akomodasi (hotel/Airbnb)', priority: 'urgent', order: 2 },
      { category: 'booking', title: 'Beli travel insurance', priority: 'high', order: 3 },
      { category: 'booking', title: 'Booking tour/aktivitas (opsional)', priority: 'medium', order: 4 },
      { category: 'documents', title: 'Scan & simpan passport, visa, tiket', priority: 'high', order: 1 },
      { category: 'documents', title: 'Print itinerary & booking confirmations', priority: 'medium', order: 2 },
      { category: 'packing', title: 'Buat packing list', priority: 'medium', order: 1 },
      { category: 'packing', title: 'Packing baju & toiletries', priority: 'medium', order: 2 },
      { category: 'packing', title: 'Siapkan obat-obatan & first aid', priority: 'high', order: 3 },
      { category: 'packing', title: 'Siapkan electronics & charger', priority: 'medium', order: 4 },
    ];

    await prisma.tripChecklist.createMany({
      data: tasks.map(t => ({ tripId: trip.id, ...t })),
    });

    return res.status(201).json({ message: 'Trip created with defaults', trip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Create trip error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        checklists: { orderBy: [{ category: 'asc' }, { order: 'asc' }] },
        vendors: { include: { quotes: true } },
        budgets: { include: { expenses: { orderBy: { date: 'desc' } } } },
        itineraries: { orderBy: [{ day: 'asc' }, { order: 'asc' }] },
        packingLists: { orderBy: { category: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    return res.json({ trip });
  } catch (error) {
    console.error('Get trip error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const body = createTripSchema.parse(req.body);
    await prisma.trip.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: {
        title: body.title,
        destination: body.destination,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        budgetTotal: body.budgetTotal,
        currency: body.currency,
        notes: body.notes,
      },
    });
    return res.json({ message: 'Trip updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Update trip error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.trip.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    return res.json({ message: 'Trip deleted' });
  } catch (error) {
    console.error('Delete trip error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────
// CHECKLIST
// ─────────────────────────────────────

router.post('/:id/checklist', async (req: AuthRequest, res: Response) => {
  try {
    const body = createChecklistSchema.parse(req.body);
    const task = await prisma.tripChecklist.create({
      data: {
        tripId: req.params.id,
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    });
    return res.status(201).json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Create checklist error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/checklist/:taskId', async (req: AuthRequest, res: Response) => {
  try {
    const { completed, title, description, dueDate, priority } = req.body;
    await prisma.tripChecklist.updateMany({
      where: { id: req.params.taskId, tripId: req.params.id },
      data: {
        completed: completed !== undefined ? completed : undefined,
        completedAt: completed === true ? new Date() : undefined,
        title, description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
      },
    });
    return res.json({ message: 'Task updated' });
  } catch (error) {
    console.error('Update checklist error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/checklist/:taskId', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.tripChecklist.deleteMany({ where: { id: req.params.taskId, tripId: req.params.id } });
    return res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete checklist error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────
// VENDORS
// ─────────────────────────────────────

router.post('/:id/vendors', async (req: AuthRequest, res: Response) => {
  try {
    const body = createVendorSchema.parse(req.body);
    if (req.user?.plan === 'FREE') {
      const count = await prisma.tripVendor.count({ where: { trip: { userId: req.userId } } });
      if (count >= 5) return res.status(403).json({ error: 'Free plan: max 5 vendors. Upgrade to Premium.' });
    }
    const vendor = await prisma.tripVendor.create({ data: { tripId: req.params.id, ...body } });
    return res.status(201).json({ vendor });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Create vendor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/vendors/:vendorId', async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, status, rating, priceRange, notes, phone, email } = req.body;
    await prisma.tripVendor.updateMany({
      where: { id: req.params.vendorId, tripId: req.params.id },
      data: { name, category, status, rating, priceRange, notes, phone, email },
    });
    return res.json({ message: 'Vendor updated' });
  } catch (error) {
    console.error('Update vendor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/vendors/:vendorId', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.tripVendor.deleteMany({ where: { id: req.params.vendorId, tripId: req.params.id } });
    return res.json({ message: 'Vendor deleted' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────
// BUDGETS & EXPENSES
// ─────────────────────────────────────

router.put('/:id/budgets/:budgetId', async (req: AuthRequest, res: Response) => {
  try {
    const { allocated, notes } = req.body;
    await prisma.tripBudget.updateMany({
      where: { id: req.params.budgetId, tripId: req.params.id },
      data: { allocated, notes },
    });
    return res.json({ message: 'Budget updated' });
  } catch (error) {
    console.error('Update budget error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/budgets/:budgetId/expenses', async (req: AuthRequest, res: Response) => {
  try {
    const body = createExpenseSchema.parse(req.body);
    const expense = await prisma.tripExpense.create({
      data: {
        budgetId: req.params.budgetId,
        description: body.description,
        amount: body.amount,
        currency: body.currency || 'IDR',
        date: body.date ? new Date(body.date) : new Date(),
        vendorName: body.vendorName,
      },
    });
    await prisma.tripBudget.update({
      where: { id: req.params.budgetId },
      data: { spent: { increment: body.amount } },
    });
    return res.status(201).json({ expense });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Create expense error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────
// ITINERARY
// ─────────────────────────────────────

router.post('/:id/itinerary', async (req: AuthRequest, res: Response) => {
  try {
    const body = createItinerarySchema.parse(req.body);
    const item = await prisma.tripItinerary.create({ data: { tripId: req.params.id, ...body } });
    return res.status(201).json({ item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Create itinerary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/itinerary/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    const { day, date, time, activity, description, location, duration, cost } = req.body;
    await prisma.tripItinerary.updateMany({
      where: { id: req.params.itemId, tripId: req.params.id },
      data: { day, date: date ? new Date(date) : undefined, time, activity, description, location, duration, cost },
    });
    return res.json({ message: 'Itinerary updated' });
  } catch (error) {
    console.error('Update itinerary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/itinerary/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.tripItinerary.deleteMany({ where: { id: req.params.itemId, tripId: req.params.id } });
    return res.json({ message: 'Itinerary deleted' });
  } catch (error) {
    console.error('Delete itinerary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────
// PACKING LIST
// ─────────────────────────────────────

router.post('/:id/packing', async (req: AuthRequest, res: Response) => {
  try {
    const body = createPackingItemSchema.parse(req.body);
    const item = await prisma.tripPackingList.create({ data: { tripId: req.params.id, ...body } });
    return res.status(201).json({ item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Create packing item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/packing/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    const { packed, item, quantity, notes } = req.body;
    await prisma.tripPackingList.updateMany({
      where: { id: req.params.itemId, tripId: req.params.id },
      data: { packed, item, quantity, notes },
    });
    return res.json({ message: 'Packing item updated' });
  } catch (error) {
    console.error('Update packing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/packing/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.tripPackingList.deleteMany({ where: { id: req.params.itemId, tripId: req.params.id } });
    return res.json({ message: 'Packing item deleted' });
  } catch (error) {
    console.error('Delete packing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────

router.get('/:id/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        checklists: { select: { id: true, completed: true } },
        vendors: { select: { id: true, status: true } },
        budgets: { select: { category: true, allocated: true, spent: true } },
      },
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const totalTasks = trip.checklists.length;
    const completedTasks = trip.checklists.filter((t: any) => t.completed).length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalBudget = trip.budgets.reduce((sum: number, b: any) => sum + Number(b.allocated), 0);
    const totalSpent = trip.budgets.reduce((sum: number, b: any) => sum + Number(b.spent), 0);

    let daysUntil = null;
    if (trip.startDate) {
      daysUntil = Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }

    return res.json({
      trip: { id: trip.id, title: trip.title, destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate, status: trip.status },
      taskProgress: { total: totalTasks, completed: completedTasks, percentage: taskProgress },
      budget: { total: totalBudget, spent: totalSpent, remaining: totalBudget - totalSpent },
      countdown: daysUntil !== null ? { daysUntil, date: trip.startDate } : null,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;