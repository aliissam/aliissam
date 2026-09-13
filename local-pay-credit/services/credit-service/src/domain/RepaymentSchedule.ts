import { Money } from '@lpc/shared-kernel';
import { Installment } from './Installment';

// An aggregate that owns the invariant "installments must sum to the
// total owed" -- callers only ever get a schedule back from `split`,
// never construct installments by hand.
export class RepaymentSchedule {
  private constructor(public readonly installments: Installment[]) {}

  static split(
    total: Money,
    numberOfInstallments: number,
    firstDueDate: Date,
    intervalDays = 30,
  ): RepaymentSchedule {
    if (numberOfInstallments < 1) {
      throw new Error('An installment plan needs at least one installment');
    }

    const perInstallmentAmount = Money.of(
      Math.round((total.amount / numberOfInstallments) * 100) / 100,
      total.currency,
    );

    const installments = Array.from({ length: numberOfInstallments }, (_, index) => {
      const dueDate = new Date(firstDueDate);
      dueDate.setDate(dueDate.getDate() + index * intervalDays);
      return new Installment(index + 1, perInstallmentAmount, dueDate);
    });

    return new RepaymentSchedule(installments);
  }
}
