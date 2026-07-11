import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest, requirePlan } from '../middleware/auth';

const router = Router();

// All wedding routes require authentication
router.use(authenticate);

// ─── Validation Schemas ───

const createWeddingSchema = z.object({
  title: z.string().optional(),
  budgetTotal: z.number().positive().optional(),
  guestCount: z.number().int().positive().optional(),
  date: z.string().datetime().optional(),
  venue: z.string().optional(),
  notes: z.string().optional(),
});

const createChecklistSchema = z.object({
  category: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dependsOn: z.string().optional(),
});

const createVendorSchema = z.object({
  category: z.enum([
    'VENUE', 'CATERING', 'PHOTO_VIDEO', 'MAKEUP_HAIR', 'DECORATION',
    'ENTERTAINMENT_MC', 'WEDDING_ORGANIZER', 'INVITATION', 'SOUVENIR',
    'TRANSPORT', 'SECURITY', 'OTHER',
  ]),
  name: z.string().min(1),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  priceRange: z.string().optional(),
  notes: z.string().optional(),
});

const createBudgetSchema = z.object({
  category: z.string().min(1),
  allocated: z.number().positive(),
  notes: z.string().optional(),
});

const createExpenseSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().optional(),
  vendorName: z.string().optional(),
});

const createGuestSchema = z.object({
  name: z.string().min(1),
  contact: z.string().optional(),
  group: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  plusOne: z.boolean().optional(),
  notes: z.string().optional(),
});

// ─────────────────────────────────────
// WEDDING CRUD
// ─────────────────────────────────────

// GET /api/wedding — List all weddings for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const weddings = await prisma.wedding.findMany({
      where: { userId: req.userId },
      include: {
        _count: { select: { checklists: true, vendors: true, guests: true } },
        budgets: { select: { category: true, allocated: true, spent: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ weddings });
  } catch (error) {
    console.error('List weddings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/wedding — Create new wedding
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = createWeddingSchema.parse(req.body);

    // Free plan: max 1 wedding
    if (req.user?.plan === 'FREE') {
      const count = await prisma.wedding.count({ where: { userId: req.userId } });
      if (count >= 1) {
        return res.status(403).json({
          error: 'Free plan allows only 1 active wedding. Upgrade to Premium for unlimited.',
        });
      }
    }

    const wedding = await prisma.wedding.create({
      data: {
        userId: req.userId!,
        title: body.title || 'My Wedding',
        budgetTotal: body.budgetTotal,
        guestCount: body.guestCount,
        date: body.date ? new Date(body.date) : undefined,
        venue: body.venue,
        notes: body.notes,
      },
    });

    // Auto-create default budget categories
    const defaultCategories = [
      'venue', 'catering', 'photo_video', 'makeup', 'decoration',
      'entertainment', 'wo', 'invitation', 'souvenir', 'transport', 'security', 'other',
    ];

    await prisma.weddingBudget.createMany({
      data: defaultCategories.map(cat => ({
        weddingId: wedding.id,
        category: cat,
        allocated: 0,
        spent: 0,
      })),
    });

    // Auto-create default checklist
    const defaultTasks = [
      { category: '12_6_months', title: 'Tentukan tanggal wedding', priority: 'urgent', order: 1 },
      { category: '12_6_months', title: 'Tentukan budget total', priority: 'urgent', order: 2 },
      { category: '12_6_months', title: 'Buat daftar guest list awal', priority: 'high', order: 3 },
      { category: '12_6_months', title: 'Survey dan booking venue', priority: 'urgent', order: 4 },
      { category: '12_6_months', title: 'Cari Wedding Organizer (opsional)', priority: 'medium', order: 5 },
      { category: '6_3_months', title: 'Booking catering', priority: 'urgent', order: 1 },
      { category: '6_3_months', title: 'Booking foto/video', priority: 'high', order: 2 },
      { category: '6_3_months', title: 'Booking makeup & hair', priority: 'high', order: 3 },
      { category: '6_3_months', title: 'Booking dekorasi', priority: 'high', order: 4 },
      { category: '6_3_months', title: 'Booking entertainment/MC', priority: 'medium', order: 5 },
      { category: '6_3_months', title: 'Pilih dan pesan undangan', priority: 'medium', order: 6 },
      { category: '3_1_month', title: 'Finalisasi guest list', priority: 'high', order: 1 },
      { category: '3_1_month', title: 'Kirim undangan', priority: 'high', order: 2 },
      { category: '3_1_month', title: 'Fitting baju pengantin', priority: 'high', order: 3 },
      { category: '3_1_month', title: 'Pilih souvenir', priority: 'medium', order: 4 },
      { category: '1_month_1_week', title: 'Final RSVP confirmation', priority: 'urgent', order: 1 },
      { category: '1_month_1_week', title: 'Final meeting dengan semua vendor', priority: 'urgent', order: 2 },
      { category: '1_month_1_week', title: 'Trial makeup & hair', priority: 'high', order: 3 },
      { category: '1_month_1_week', title: 'Susun timeline D-Day', priority: 'high', order: 4 },
      { category: 'd_day', title: 'Akad nikah', priority: 'urgent', order: 1 },
      { category: 'd_day', title: 'Resepsi', priority: 'urgent', order: 2 },
      { category: 'd_day', title: 'Foto session', priority: 'high', order: 3 },
    ];

    await prisma.weddingChecklist.createMany({
      data: defaultTasks.map(t => ({
        weddingId: wedding.id,
        ...t,
      })),
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'create',
        entity: 'wedding',
        entityId: wedding.id,
        ipAddress: req.ip,
      },
    });

    return res.status(201).json({
      message: 'Wedding created with default budget & checklist',
      wedding,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Create wedding error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/wedding/:id — Get wedding detail
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const wedding = await prisma.wedding.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        checklists: { orderBy: [{ category: 'asc' }, { order: 'asc' }] },
        vendors: { include: { quotes: true } },
        budgets: { include: { expenses: { orderBy: { date: 'desc' } } } },
        guests: { orderBy: { name: 'asc' } },
        timelines: { orderBy: { order: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!wedding) {
      return res.status(404).json({ error: 'Wedding not found' });
    }

    return res.json({ wedding });
  } catch (error) {
    console.error('Get wedding error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/wedding/:id — Update wedding
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const body = createWeddingSchema.parse(req.body);

    const wedding = await prisma.wedding.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: {
        title: body.title,
        budgetTotal: body.budgetTotal,
        guestCount: body.guestCount,
        date: body.date ? new Date(body.date) : undefined,
        venue: body.venue,
        notes: body.notes,
      },
    });

    if (wedding.count === 0) {
      return res.status(404).json({ error: 'Wedding not found' });
    }

    return res.json({ message: 'Wedding updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Update wedding error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/wedding/:id — Delete wedding
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const wedding = await prisma.wedding.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });

    if (wedding.count === 0) {
      return res.status(404).json({ error: 'Wedding not found' });
    }

    return res.json({ message: 'Wedding deleted' });
  } catch (error) {
    console.error('Delete wedding error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────
// CHECKLIST
// ─────────────────────────────────────

router.post('/:id/checklist', async (req: AuthRequest, res: Response) => {
  try {
    const body = createChecklistSchema.parse(req.body);

    const wedding = await prisma.wedding.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!wedding) return res.status(404).json({ error: 'Wedding not found' });

    const task = await prisma.weddingChecklist.create({
      data: {
        weddingId: req.params.id,
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

    const task = await prisma.weddingChecklist.updateMany({
      where: { id: req.params.taskId, weddingId: req.params.id },
      data: {
        completed: completed !== undefined ? completed : undefined,
        completedAt: completed === true ? new Date() : undefined,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
      },
    });

    if (task.count === 0) return res.status(404).json({ error: 'Task not found' });

    return res.json({ message: 'Task updated' });
  } catch (error) {
    console.error('Update checklist error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/checklist/:taskId', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.weddingChecklist.deleteMany({
      where: { id: req.params.taskId, weddingId: req.params.id },
    });
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

    // Free plan: max 5 vendors
    if (req.user?.plan === 'FREE') {
      const count = await prisma.weddingVendor.count({
        where: { wedding: { userId: req.userId } },
      });
      if (count >= 5) {
        return res.status(403).json({
          error: 'Free plan allows max 5 vendors. Upgrade to Premium for unlimited.',
        });
      }
    }

    const vendor = await prisma.weddingVendor.create({
      data: {
        weddingId: req.params.id,
        ...body,
      },
    });

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

    const vendor = await prisma.weddingVendor.updateMany({
      where: { id: req.params.vendorId, weddingId: req.params.id },
      data: { name, category, status, rating, priceRange, notes, phone, email },
    });

    if (vendor.count === 0) return res.status(404).json({ error: 'Vendor not found' });

    return res.json({ message: 'Vendor updated' });
  } catch (error) {
    console.error('Update vendor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/vendors/:vendorId', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.weddingVendor.deleteMany({
      where: { id: req.params.vendorId, weddingId: req.params.id },
    });
    return res.json({ message: 'Vendor deleted' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────
// VENDOR QUOTES
// ─────────────────────────────────────

router.post('/:id/vendors/:vendorId/quotes', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, details, fileUrl, receivedVia } = req.body;

    const quote = await prisma.weddingVendorQuote.create({
      data: {
        vendorId: req.params.vendorId,
        amount,
        details,
        fileUrl,
        receivedVia: receivedVia || 'manual',
      },
    });

    return res.status(201).json({ quote });
  } catch (error) {
    console.error('Create quote error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────
// BUDGETS
// ─────────────────────────────────────

router.put('/:id/budgets/:budgetId', async (req: AuthRequest, res: Response) => {
  try {
    const { allocated, notes } = req.body;

    const budget = await prisma.weddingBudget.updateMany({
      where: { id: req.params.budgetId, weddingId: req.params.id },
      data: { allocated, notes },
    });

    if (budget.count === 0) return res.status(404).json({ error: 'Budget not found' });

    return res.json({ message: 'Budget updated' });
  } catch (error) {
    console.error('Update budget error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────
// EXPENSES
// ─────────────────────────────────────

router.post('/:id/budgets/:budgetId/expenses', async (req: AuthRequest, res: Response) => {
  try {
    const body = createExpenseSchema.parse(req.body);

    const expense = await prisma.weddingExpense.create({
      data: {
        budgetId: req.params.budgetId,
        description: body.description,
        amount: body.amount,
        date: body.date ? new Date(body.date) : new Date(),
        vendorName: body.vendorName,
      },
    });

    // Update spent amount
    await prisma.weddingBudget.update({
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
// GUESTS
// ─────────────────────────────────────

router.post('/:id/guests', async (req: AuthRequest, res: Response) => {
  try {
    const body = createGuestSchema.parse(req.body);

    const guest = await prisma.weddingGuest.create({
      data: { weddingId: req.params.id, ...body },
    });

    return res.status(201).json({ guest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Create guest error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/guests/:guestId', async (req: AuthRequest, res: Response) => {
  try {
    const { name, rsvpStatus, tableAssignment, dietaryRestrictions, group, notes } = req.body;

    await prisma.weddingGuest.updateMany({
      where: { id: req.params.guestId, weddingId: req.params.id },
      data: { name, rsvpStatus, tableAssignment, dietaryRestrictions, group, notes },
    });

    return res.json({ message: 'Guest updated' });
  } catch (error) {
    console.error('Update guest error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/guests/:guestId', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.weddingGuest.deleteMany({
      where: { id: req.params.guestId, weddingId: req.params.id },
    });
    return res.json({ message: 'Guest deleted' });
  } catch (error) {
    console.error('Delete guest error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────
// DASHBOARD SUMMARY
// ─────────────────────────────────────

router.get('/:id/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const wedding = await prisma.wedding.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        checklists: {
          select: { id: true, completed: true, category: true, priority: true },
        },
        vendors: {
          select: { id: true, status: true, category: true },
        },
        budgets: {
          select: { category: true, allocated: true, spent: true },
        },
        guests: {
          select: { id: true, rsvpStatus: true },
        },
      },
    });

    if (!wedding) return res.status(404).json({ error: 'Wedding not found' });

    const totalTasks = wedding.checklists.length;
    const completedTasks = wedding.checklists.filter(t => t.completed).length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalBudget = wedding.budgets.reduce((sum, b) => sum + Number(b.allocated), 0);
    const totalSpent = wedding.budgets.reduce((sum, b) => sum + Number(b.spent), 0);
    const budgetRemaining = totalBudget - totalSpent;
    const budgetUsage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const vendorStats = {
      prospecting: wedding.vendors.filter(v => v.status === 'PROSPECTING').length,
      contacted: wedding.vendors.filter(v => v.status === 'CONTACTED').length,
      quoted: wedding.vendors.filter(v => v.status === 'QUOTED').length,
      negotiating: wedding.vendors.filter(v => v.status === 'NEGOTIATING').length,
      booked: wedding.vendors.filter(v => v.status === 'BOOKED').length,
      paid: wedding.vendors.filter(v => v.status === 'PAID').length,
      done: wedding.vendors.filter(v => v.status === 'DONE').length,
    };

    const guestStats = {
      total: wedding.guests.length,
      attending: wedding.guests.filter(g => g.rsvpStatus === 'attending').length,
      notAttending: wedding.guests.filter(g => g.rsvpStatus === 'not_attending').length,
      pending: wedding.guests.filter(g => g.rsvpStatus === 'pending').length,
      maybe: wedding.guests.filter(g => g.rsvpStatus === 'maybe').length,
    };

    // Countdown
    let daysUntil = null;
    if (wedding.date) {
      daysUntil = Math.ceil((new Date(wedding.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }

    return res.json({
      wedding: {
        id: wedding.id,
        title: wedding.title,
        date: wedding.date,
        venue: wedding.venue,
        guestCount: wedding.guestCount,
        status: wedding.status,
      },
      taskProgress: { total: totalTasks, completed: completedTasks, percentage: taskProgress },
      budget: {
        total: totalBudget,
        spent: totalSpent,
        remaining: budgetRemaining,
        usagePercentage: budgetUsage,
        categories: wedding.budgets.map(b => ({
          category: b.category,
          allocated: Number(b.allocated),
          spent: Number(b.spent),
          remaining: Number(b.allocated) - Number(b.spent),
        })),
      },
      vendorStats,
      guestStats,
      countdown: daysUntil !== null ? { daysUntil, date: wedding.date } : null,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;