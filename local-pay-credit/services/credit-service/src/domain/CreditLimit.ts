import { Money } from '@lpc/shared-kernel';

// A credit limit is an entity in its own right, not just a number on the
// customer record: it enforces the invariant that a customer can never
// spend more BNPL credit than they've been granted.
export class CreditLimit {
  private constructor(
    private readonly total: Money,
    private used: Money,
  ) {}

  static grant(total: Money): CreditLimit {
    return new CreditLimit(total, Money.of(0, total.currency));
  }

  available(): Money {
    return this.total.subtract(this.used);
  }

  reserve(amount: Money): void {
    if (amount.isGreaterThan(this.available())) {
      throw new Error('Requested amount exceeds available credit limit');
    }
    this.used = this.used.add(amount);
  }

  release(amount: Money): void {
    this.used = this.used.subtract(amount);
  }
}
