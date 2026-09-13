import { EventBus } from '@lpc/event-bus';
import { paymentFailed, paymentSucceeded } from '@lpc/shared-kernel';
import { PaymentPort, PaymentRequest, PaymentResult } from './PaymentPort';
import { TransactionWriteRepository } from '../infrastructure/TransactionWriteRepository';

// The application core of the hexagon. It only knows about the
// PaymentPort abstraction, never about any specific provider, and it only
// knows about the EventBus port, never about who (if anyone) is listening.
export class PaymentService {
  private readonly providers = new Map<string, PaymentPort>();

  constructor(
    private readonly eventBus: EventBus,
    private readonly transactions: TransactionWriteRepository,
  ) {}

  registerProvider(port: PaymentPort): void {
    this.providers.set(port.providerName, port);
  }

  async processPayment(providerName: string, request: PaymentRequest): Promise<PaymentResult> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`No payment adapter registered for provider "${providerName}"`);
    }

    const result = await provider.charge(request);

    this.transactions.record({
      transactionId: request.transactionId,
      merchantId: request.merchantId,
      customerId: request.customerId,
      amount: request.amount.amount,
      currency: request.amount.currency,
      provider: providerName,
      status: result.success ? 'succeeded' : 'failed',
    });

    if (result.success) {
      await this.eventBus.publish(
        paymentSucceeded({
          transactionId: request.transactionId,
          merchantId: request.merchantId,
          customerId: request.customerId,
          amount: request.amount.amount,
          currency: request.amount.currency,
          provider: providerName,
          providerReference: result.providerReference ?? '',
        }),
      );
    } else {
      await this.eventBus.publish(
        paymentFailed({
          transactionId: request.transactionId,
          merchantId: request.merchantId,
          customerId: request.customerId,
          amount: request.amount.amount,
          currency: request.amount.currency,
          provider: providerName,
          failureReason: result.failureReason ?? 'unknown',
        }),
      );
    }

    return result;
  }
}
