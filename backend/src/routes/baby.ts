import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const createBabyPlanSchema = z.object({
  title: z.string().optional(),
  targetDate: z.string().datetime().optional(),
  budgetTotal: z.number().positive().optional(),
  trimester: z.string().optional(),
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
  category: z.enum(['HOSPITAL_CLINIC', 'OBGYN_DOCTOR', 'PEDIATRICIAN', 'BABY_STORE', 'INSURANCE', 'NANNY_AGENCY', 'DAYCARE', 'OTHER']),
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
  date: z.string().datetime().optional(),
  vendorName: z.string().optional(),
});

const createMilestoneSchema = z.object({
  phase: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// ─── CRUD ───

router.get('/', async (req: AuthRequest, res: Response) => {
  const plans = await prisma.babyPlan.findMany({
    where: { userId: req.userId },
    include: { _count: { select: { checklists: true, vendors: true, milestones: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ plans });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = createBabyPlanSchema.parse(req.body);
    if (req.user?.plan === 'FREE') {
      const count = await prisma.babyPlan.count({ where: { userId: req.userId } });
      if (count >= 1) return res.status(403).json({ error: 'Free plan: max 1 baby plan. Upgrade to Premium.' });
    }

    const plan = await prisma.babyPlan.create({
      data: {
        userId: req.userId!,
        title: body.title || 'Baby Plan',
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
        budgetTotal: body.budgetTotal,
        trimester: body.trimester,
        notes: body.notes,
      },
    });

    // Default budget categories
    const categories = ['medical', 'nursery', 'gear', 'clothing', 'diapers_formula', 'education_fund', 'insurance', 'nanny_daycare', 'other'];
    await prisma.babyBudget.createMany({
      data: categories.map(cat => ({ babyPlanId: plan.id, category: cat, allocated: 0, spent: 0 })),
    });

    // Default checklist
    const tasks = [
      { category: 'medical', title: 'Pilih dokter obgyn/bidan', priority: 'urgent', order: 1 },
      { category: 'medical', title: 'Jadwal prenatal checkup rutin', priority: 'urgent', order: 2 },
      { category: 'medical', title: 'Pilih rumah sakit/klinik untuk melahirkan', priority: 'high', order: 3 },
      { category: 'financial', title: 'Buat budget persiapan bayi', priority: 'high', order: 1 },
      { category: 'financial', title: 'Cek asuransi kesehatan (cover melahirkan?)', priority: 'high', order: 2 },
      { category: 'financial', title: 'Siapkan dana darurat', priority: 'medium', order: 3 },
      { category: 'nursery', title: 'Siapkan kamar bayi / nursery corner', priority: 'medium', order: 1 },
      { category: 'gear', title: 'Beli stroller & car seat', priority: 'medium', order: 1 },
      { category: 'gear', title: 'Beli breast pump & sterilizer', priority: 'medium', order: 2 },
      { category: 'clothing', title: 'Beli baju newborn (0-3 bulan)', priority: 'medium', order: 1 },
      { category: 'clothing', title: 'Beli popok & perlengkapan mandi', priority: 'high', order: 2 },
    ];

    await prisma.babyChecklist.createMany({
      data: tasks.map(t => ({ babyPlanId: plan.id, ...t })),
    });

    // Default milestones
    const milestones = [
      { phase: 'pre_conception', title: 'Pre-conception checkup', order: 1 },
      { phase: 'trimester_1', title: 'First prenatal visit (week 8-12)', order: 1 },
      { phase: 'trimester_1', title: 'First ultrasound', order: 2 },
      { phase: 'trimester_2', title: 'Anatomy scan (week 18-22)', order: 1 },
      { phase: 'trimester_2', title: 'Glucose screening test', order: 2 },
      { phase: 'trimester_3', title: 'Birth plan discussion', order: 1 },
      { phase: 'trimester_3', title: 'Hospital bag ready', order: 2 },
      { phase: 'birth', title: 'Delivery day!', order: 1 },
      { phase: 'newborn', title: 'First pediatrician visit', order: 1 },
      { phase: 'newborn', title: 'Register birth certificate', order: 2 },
    ];

    await prisma.babyMilestone.createMany({
      data: milestones.map(m => ({ babyPlanId: plan.id, ...m })),
    });

    return res.status(201).json({ message: 'Baby plan created with defaults', plan });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    console.error('Create baby plan error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const plan = await prisma.babyPlan.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: {
      checklists: { orderBy: [{ category: 'asc' }, { order: 'asc' }] },
      vendors: { include: { quotes: true } },
      budgets: { include: { expenses: { orderBy: { date: 'desc' } } } },
      milestones: { orderBy: [{ phase: 'asc' }, { order: 'asc' }] },
    },
  });
  if (!plan) return res.status(404).json({ error: 'Baby plan not found' });
  return res.json({ plan });
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const body = createBabyPlanSchema.parse(req.body);
    await prisma.babyPlan.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: {
        title: body.title, targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
        budgetTotal: body.budgetTotal, trimester: body.trimester, notes: body.notes,
      },
    });
    return res.json({ message: 'Baby plan updated' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await prisma.babyPlan.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  return res.json({ message: 'Baby plan deleted' });
});

// ─── CHECKLIST ───

router.post('/:id/checklist', async (req: AuthRequest, res: Response) => {
  try {
    const body = createChecklistSchema.parse(req.body);
    const task = await prisma.babyChecklist.create({
      data: { babyPlanId: req.params.id, ...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined },
    });
    return res.status(201).json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/checklist/:taskId', async (req: AuthRequest, res: Response) => {
  const { completed, title, description, dueDate, priority } = req.body;
  await prisma.babyChecklist.updateMany({
    where: { id: req.params.taskId, babyPlanId: req.params.id },
    data: { completed, completedAt: completed === true ? new Date() : undefined, title, description, dueDate: dueDate ? new Date(dueDate) : undefined, priority },
  });
  return res.json({ message: 'Task updated' });
});

router.delete('/:id/checklist/:taskId', async (req: AuthRequest, res: Response) => {
  await prisma.babyChecklist.deleteMany({ where: { id: req.params.taskId, babyPlanId: req.params.id } });
  return res.json({ message: 'Task deleted' });
});

// ─── VENDORS ───

router.post('/:id/vendors', async (req: AuthRequest, res: Response) => {
  try {
    const body = createVendorSchema.parse(req.body);
    if (req.user?.plan === 'FREE') {
      const count = await prisma.babyVendor.count({ where: { babyPlan: { userId: req.userId } } });
      if (count >= 5) return res.status(403).json({ error: 'Free plan: max 5 vendors.' });
    }
    const vendor = await prisma.babyVendor.create({ data: { babyPlanId: req.params.id, ...body } });
    return res.status(201).json({ vendor });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/vendors/:vendorId', async (req: AuthRequest, res: Response) => {
  const { name, category, status, rating, priceRange, notes, phone, email } = req.body;
  await prisma.babyVendor.updateMany({
    where: { id: req.params.vendorId, babyPlanId: req.params.id },
    data: { name, category, status, rating, priceRange, notes, phone, email },
  });
  return res.json({ message: 'Vendor updated' });
});

router.delete('/:id/vendors/:vendorId', async (req: AuthRequest, res: Response) => {
  await prisma.babyVendor.deleteMany({ where: { id: req.params.vendorId, babyPlanId: req.params.id } });
  return res.json({ message: 'Vendor deleted' });
});

// ─── BUDGETS & EXPENSES ───

router.put('/:id/budgets/:budgetId', async (req: AuthRequest, res: Response) => {
  const { allocated, notes } = req.body;
  await prisma.babyBudget.updateMany({ where: { id: req.params.budgetId, babyPlanId: req.params.id }, data: { allocated, notes } });
  return res.json({ message: 'Budget updated' });
});

router.post('/:id/budgets/:budgetId/expenses', async (req: AuthRequest, res: Response) => {
  try {
    const body = createExpenseSchema.parse(req.body);
    const expense = await prisma.babyExpense.create({
      data: { budgetId: req.params.budgetId, description: body.description, amount: body.amount, date: body.date ? new Date(body.date) : new Date(), vendorName: body.vendorName },
    });
    await prisma.babyBudget.update({ where: { id: req.params.budgetId }, data: { spent: { increment: body.amount } } });
    return res.status(201).json({ expense });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── MILESTONES ───

router.post('/:id/milestones', async (req: AuthRequest, res: Response) => {
  try {
    const body = createMilestoneSchema.parse(req.body);
    const milestone = await prisma.babyMilestone.create({ data: { babyPlanId: req.params.id, ...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined } });
    return res.status(201).json({ milestone });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/milestones/:milestoneId', async (req: AuthRequest, res: Response) => {
  const { achieved, title, description, notes } = req.body;
  await prisma.babyMilestone.updateMany({
    where: { id: req.params.milestoneId, babyPlanId: req.params.id },
    data: { achieved, achievedAt: achieved === true ? new Date() : undefined, title, description, notes },
  });
  return res.json({ message: 'Milestone updated' });
});

// ─── DASHBOARD ───

router.get('/:id/dashboard', async (req: AuthRequest, res: Response) => {
  const plan = await prisma.babyPlan.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: {
      checklists: { select: { id: true, completed: true } },
      vendors: { select: { id: true, status: true } },
      budgets: { select: { category: true, allocated: true, spent: true } },
      milestones: { select: { id: true, achieved: true, phase: true } },
    },
  });
  if (!plan) return res.status(404).json({ error: 'Baby plan not found' });

  const totalTasks = plan.checklists.length;
  const completedTasks = plan.checklists.filter((t: any) => t.completed).length;
  const totalBudget = plan.budgets.reduce((sum: number, b: any) => sum + Number(b.allocated), 0);
  const totalSpent = plan.budgets.reduce((sum: number, b: any) => sum + Number(b.spent), 0);
  const totalMilestones = plan.milestones.length;
  const achievedMilestones = plan.milestones.filter((m: any) => m.achieved).length;

  return res.json({
    plan: { id: plan.id, title: plan.title, targetDate: plan.targetDate, trimester: plan.trimester, status: plan.status },
    taskProgress: { total: totalTasks, completed: completedTasks, percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 },
    budget: { total: totalBudget, spent: totalSpent, remaining: totalBudget - totalSpent },
    milestones: { total: totalMilestones, achieved: achievedMilestones, percentage: totalMilestones > 0 ? Math.round((achievedMilestones / totalMilestones) * 100) : 0 },
  });
});

export default router;