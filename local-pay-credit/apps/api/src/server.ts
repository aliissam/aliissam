import { randomUUID } from 'node:crypto';
import express, { Express, NextFunction, Request, Response } from 'express';
import { Money } from '@lpc/shared-kernel';
import { Platform } from '@lpc/platform';

type Handler = (req: Request, res: Response) => Promise<void> | void;

// Express 4 doesn't forward a rejected promise to error-handling
// middleware on its own -- this closes that gap so a thrown domain error
// (e.g. "unknown merchant", "exceeds credit limit") reaches the error
// handler below instead of crashing the process.
function asyncHandler(handler: Handler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

export function createServer(platform: Platform): Express {
  const app = express();
  app.use(express.json());

  app.post(
    '/merchants',
    asyncHandler((req, res) => {
      const { merchantId, legalName, taxRegistrationNumber } = req.body ?? {};
      if (!legalName || !taxRegistrationNumber) {
        res.status(400).json({ error: 'legalName and taxRegistrationNumber are required' });
        return;
      }
      const merchant = platform.merchantOnboarding.register(
        merchantId ?? randomUUID(),
        legalName,
        taxRegistrationNumber,
      );
      res.status(201).json(merchant);
    }),
  );

  app.get(
    '/merchants/:merchantId',
    asyncHandler((req, res) => {
      res.json(platform.merchantOnboarding.get(req.params.merchantId));
    }),
  );

  app.post(
    '/merchants/:merchantId/kyc/approve',
    asyncHandler((req, res) => {
      platform.merchantOnboarding.approveKyc(req.params.merchantId);
      res.json(platform.merchantOnboarding.get(req.params.merchantId));
    }),
  );

  app.post(
    '/merchants/:merchantId/kyc/reject',
    asyncHandler((req, res) => {
      const { reason } = req.body ?? {};
      if (!reason) {
        res.status(400).json({ error: 'reason is required' });
        return;
      }
      platform.merchantOnboarding.rejectKyc(req.params.merchantId, reason);
      res.json(platform.merchantOnboarding.get(req.params.merchantId));
    }),
  );

  app.get(
    '/merchants/:merchantId/dashboard',
    asyncHandler((req, res) => {
      res.json(platform.dashboard.getSummary(req.params.merchantId));
    }),
  );

  app.post(
    '/credit/:customerId/limit',
    asyncHandler(async (req, res) => {
      const { amount, currency } = req.body ?? {};
      if (typeof amount !== 'number' || !currency) {
        res.status(400).json({ error: 'amount (number) and currency are required' });
        return;
      }
      await platform.creditService.grantCreditLimit(req.params.customerId, Money.of(amount, currency));
      res.status(201).json({
        customerId: req.params.customerId,
        creditScore: platform.creditService.creditScoreOf(req.params.customerId),
      });
    }),
  );

  app.get(
    '/credit/:customerId/score',
    asyncHandler((req, res) => {
      res.json({
        customerId: req.params.customerId,
        creditScore: platform.creditService.creditScoreOf(req.params.customerId),
      });
    }),
  );

  app.post(
    '/credit/:customerId/installment-plans',
    asyncHandler(async (req, res) => {
      const { planId, amount, currency, numberOfInstallments } = req.body ?? {};
      if (typeof amount !== 'number' || !currency || !numberOfInstallments) {
        res
          .status(400)
          .json({ error: 'amount (number), currency and numberOfInstallments are required' });
        return;
      }
      const schedule = await platform.creditService.createInstallmentPlan(
        req.params.customerId,
        planId ?? randomUUID(),
        Money.of(amount, currency),
        numberOfInstallments,
      );
      res.status(201).json(
        schedule.installments.map((installment) => ({
          installmentNumber: installment.installmentNumber,
          amount: installment.amount.amount,
          currency: installment.amount.currency,
          dueDate: installment.dueDate,
          status: installment.status,
        })),
      );
    }),
  );

  app.post(
    '/payments',
    asyncHandler(async (req, res) => {
      const { provider, transactionId, merchantId, customerId, amount, currency } = req.body ?? {};
      if (!provider || !merchantId || !customerId || typeof amount !== 'number' || !currency) {
        res.status(400).json({
          error: 'provider, merchantId, customerId, amount (number) and currency are required',
        });
        return;
      }
      const result = await platform.paymentService.processPayment(provider, {
        transactionId: transactionId ?? randomUUID(),
        merchantId,
        customerId,
        amount: Money.of(amount, currency),
      });
      res.status(result.success ? 201 : 402).json(result);
    }),
  );

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(400).json({ error: err.message });
  });

  return app;
}
