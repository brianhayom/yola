import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { config } from '../config';

const router = Router();
router.use(authenticate);

// POST /api/payment/create — Create payment (Tripay)
router.post('/create', async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body; // PREMIUM or FAMILY

    if (!plan || !['PREMIUM', 'FAMILY'].includes(plan)) {
      return res.status(400).json({ error: 'Plan must be PREMIUM or FAMILY' });
    }

    // Pricing
    const prices: Record<string, number> = {
      PREMIUM: 49900,  // Rp 49,900/month
      FAMILY: 99900,   // Rp 99,900/month
    };

    const amount = prices[plan];

    // TODO: Integrate Tripay API
    // For now, create a mock payment record
    const subscription = await prisma.subscription.upsert({
      where: { userId: req.userId! },
      create: {
        userId: req.userId!,
        plan: 'FREE',
        status: 'active',
      },
      update: {},
    });

    // In production, call Tripay API here:
    // const tripayResponse = await fetch('https://tripay.co.id/api/transaction/create', { ... });

    return res.json({
      message: 'Payment initiated',
      amount,
      plan,
      paymentUrl: `${config.frontendUrl}/payment/process?plan=${plan}&amount=${amount}`,
      reference: `YOLA-${Date.now()}`,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/payment/callback — Tripay callback
router.post('/callback', async (req: AuthRequest, res: Response) => {
  try {
    const { reference, status, plan } = req.body;

    // Verify callback signature in production
    // Update subscription based on payment status
    if (status === 'PAID') {
      await prisma.subscription.update({
        where: { userId: req.userId! },
        data: {
          plan: plan as any,
          status: 'active',
          paymentRef: reference,
          startDate: new Date(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      await prisma.user.update({
        where: { id: req.userId! },
        data: { plan: plan as any },
      });
    }

    return res.json({ message: 'Callback processed' });
  } catch (error) {
    console.error('Payment callback error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/payment/status — Get subscription status
router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId },
    });

    return res.json({
      plan: req.user?.plan || 'FREE',
      subscription: subscription || null,
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;