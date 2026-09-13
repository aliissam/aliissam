import { Money } from '@lpc/shared-kernel';

export interface PaymentRequest {
  transactionId: string;
  merchantId: string;
  customerId: string;
  amount: Money;
}

export interface PaymentResult {
  success: boolean;
  providerReference?: string;
  failureReason?: string;
}

// The hexagon's boundary. The application core (PaymentService) only ever
// talks to this interface -- never to QiCard, Zain Cash, a card network or
// a cash agent directly. Iraq's payment rails are fragmented and change
// often; adding or dropping a rail means adding or removing an adapter,
// with zero changes to the core.
export interface PaymentPort {
  readonly providerName: string;
  charge(request: PaymentRequest): Promise<PaymentResult>;
}
