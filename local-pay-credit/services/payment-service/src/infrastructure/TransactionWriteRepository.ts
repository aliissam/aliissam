export type TransactionStatus = 'succeeded' | 'failed';

export interface TransactionRecord {
  transactionId: string;
  merchantId: string;
  customerId: string;
  amount: number;
  currency: string;
  provider: string;
  status: TransactionStatus;
  recordedAt: Date;
}

// CQRS write side: an append-only store optimized for the hot payment
// path. The merchant dashboard (merchant-dashboard-service) never reads
// from here -- it builds its own read model asynchronously from the
// PaymentSucceeded/PaymentFailed events this service publishes, so
// reporting load never competes with live transaction writes.
export class TransactionWriteRepository {
  private readonly records: TransactionRecord[] = [];

  record(record: Omit<TransactionRecord, 'recordedAt'>): void {
    this.records.push({ ...record, recordedAt: new Date() });
  }

  all(): readonly TransactionRecord[] {
    return this.records;
  }
}
