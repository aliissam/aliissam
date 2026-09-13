import { PaymentPort, PaymentRequest, PaymentResult } from '../domain/PaymentPort';

// Cash-on-delivery isn't a real-time gateway: a delivery/collection agent
// confirms cash was collected (e.g. via a field agent app), and that
// confirmation is what "charges" this adapter. Modeling it behind the
// same PaymentPort lets the core treat COD reconciliation exactly like
// any other payment rail.
export class CashAgentAdapter implements PaymentPort {
  readonly providerName = 'cash-agent';

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    return {
      success: true,
      providerReference: `CASH-${request.transactionId}`,
    };
  }
}
