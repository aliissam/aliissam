import { PaymentPort, PaymentRequest, PaymentResult } from '../domain/PaymentPort';

// Talks to the Zain Cash mobile wallet API. Mocked to always succeed.
export class ZainCashAdapter implements PaymentPort {
  readonly providerName = 'zain-cash';

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    return {
      success: true,
      providerReference: `ZC-${request.transactionId}`,
    };
  }
}
