import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  weddingAssistant,
  tripAssistant,
  babyAssistant,
  generateChecklist,
  recommendBudget,
} from '../services/ai';

const router = Router();
router.use(authenticate);

// ─── POST /api/ai/chat/wedding ───
router.post('/chat/wedding', async (req: AuthRequest, res: Response) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const result = await weddingAssistant(message, context);
    return res.json(result);
  } catch (error) {
    console.error('Wedding AI error:', error);
    return res.status(500).json({ error: 'AI service error' });
  }
});

// ─── POST /api/ai/chat/trip ───
router.post('/chat/trip', async (req: AuthRequest, res: Response) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const result = await tripAssistant(message, context);
    return res.json(result);
  } catch (error) {
    console.error('Trip AI error:', error);
    return res.status(500).json({ error: 'AI service error' });
  }
});

// ─── POST /api/ai/chat/baby ───
router.post('/chat/baby', async (req: AuthRequest, res: Response) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const result = await babyAssistant(message, context);
    return res.json(result);
  } catch (error) {
    console.error('Baby AI error:', error);
    return res.status(500).json({ error: 'AI service error' });
  }
});

// ─── POST /api/ai/generate-checklist ───
router.post('/generate-checklist', async (req: AuthRequest, res: Response) => {
  try {
    const { module, input } = req.body;
    if (!module || !input) return res.status(400).json({ error: 'Module and input are required' });
    if (!['wedding', 'trip', 'baby'].includes(module)) {
      return res.status(400).json({ error: 'Module must be wedding, trip, or baby' });
    }

    const items = await generateChecklist(module, input);
    return res.json({ items });
  } catch (error) {
    console.error('Generate checklist error:', error);
    return res.status(500).json({ error: 'AI service error' });
  }
});

// ─── POST /api/ai/recommend-budget ───
router.post('/recommend-budget', async (req: AuthRequest, res: Response) => {
  try {
    const { module, totalBudget, preferences } = req.body;
    if (!module || !totalBudget) return res.status(400).json({ error: 'Module and totalBudget are required' });
    if (!['wedding', 'trip', 'baby'].includes(module)) {
      return res.status(400).json({ error: 'Module must be wedding, trip, or baby' });
    }

    const allocations = await recommendBudget(module, totalBudget, preferences);
    return res.json({ allocations });
  } catch (error) {
    console.error('Budget recommendation error:', error);
    return res.status(500).json({ error: 'AI service error' });
  }
});

export default router;