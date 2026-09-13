import { PaymentPort, PaymentRequest, PaymentResult } from '../domain/PaymentPort';

// Talks to Qi Card's settlement network. This is a mock that always
// succeeds; a real implementation would call Qi Card's API and translate
// its response into a PaymentResult -- the core never needs to know.
export class QiCardAdapter implements PaymentPort {
  readonly providerName = 'qi-card';

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    return {
      success: true,
      providerReference: `QIC-${request.transactionId}`,
    };
  }
}
