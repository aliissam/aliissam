import { PaymentPort, PaymentRequest, PaymentResult } from '../domain/PaymentPort';

// Talks to a card network acquirer for Visa/Mastercard transactions.
// Mocked to always succeed.
export class VisaMastercardAdapter implements PaymentPort {
  readonly providerName = 'visa-mastercard';

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    return {
      success: true,
      providerReference: `VMC-${request.transactionId}`,
    };
  }
}
