import { Money } from '@lpc/shared-kernel';

export type InstallmentStatus = 'pending' | 'due' | 'paid';

export class Installment {
  status: InstallmentStatus = 'pending';

  constructor(
    public readonly installmentNumber: number,
    public readonly amount: Money,
    public readonly dueDate: Date,
  ) {}

  markPaid(): void {
    this.status = 'paid';
  }
}
