import { Router, Request, Response } from 'express';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Zero Invest Multi-Vendor Marketplace API',
    timestamp: new Date().toISOString()
  });
});

// Stubs for payment gateway webhooks (bKash, Nagad, SSLCommerz)
apiRouter.post('/webhooks/payment/:provider', (req: Request, res: Response) => {
  const { provider } = req.params;
  console.log(`[API Webhook] Received payment IPN notification for provider: ${provider}`);
  res.json({ received: true, provider, status: 'processed' });
});

// Stubs for courier tracking webhook (Pathao, Steadfast)
apiRouter.post('/webhooks/courier/:provider', (req: Request, res: Response) => {
  const { provider } = req.params;
  console.log(`[API Webhook] Received courier update for provider: ${provider}`);
  res.json({ received: true, provider, status: 'processed' });
});
