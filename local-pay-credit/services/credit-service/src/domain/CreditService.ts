import { EventBus } from '@lpc/event-bus';
import { Money, creditApproved, installmentScheduled } from '@lpc/shared-kernel';
import { CreditLimit } from './CreditLimit';
import { RepaymentSchedule } from './RepaymentSchedule';
import { Customer } from './Customer';

const BASELINE_CREDIT_SCORE = 600;

// The credit/BNPL bounded context. It has its own domain language
// (CreditLimit, Installment, RepaymentSchedule) and its own compliance
// boundary, kept separate from payment-processing technology -- this
// service never talks to a card network or a wallet API.
export class CreditService {
  private readonly customers = new Map<string, Customer>();
  private readonly limits = new Map<string, CreditLimit>();

  constructor(private readonly eventBus: EventBus) {}

  async grantCreditLimit(customerId: string, amount: Money): Promise<void> {
    this.limits.set(customerId, CreditLimit.grant(amount));
    await this.eventBus.publish(
      creditApproved({ customerId, limitAmount: amount.amount, currency: amount.currency }),
    );
  }

  async createInstallmentPlan(
    customerId: string,
    planId: string,
    total: Money,
    numberOfInstallments: number,
  ): Promise<RepaymentSchedule> {
    const limit = this.limits.get(customerId);
    if (!limit) {
      throw new Error(`Customer ${customerId} has no active credit limit`);
    }
    limit.reserve(total);

    const schedule = RepaymentSchedule.split(total, numberOfInstallments, new Date());

    for (const installment of schedule.installments) {
      await this.eventBus.publish(
        installmentScheduled({
          customerId,
          planId,
          installmentNumber: installment.installmentNumber,
          totalInstallments: numberOfInstallments,
          amount: installment.amount.amount,
          currency: installment.amount.currency,
          dueDate: installment.dueDate.toISOString(),
        }),
      );
    }

    return schedule;
  }

  // Reacts to a successful payment elsewhere in the platform. Note this
  // service never calls into payment-service directly -- it only reacts
  // to the PaymentSucceeded event, which is the event-driven glue that
  // keeps these bounded contexts from knowing about each other.
  onPaymentSucceeded(customerId: string): void {
    this.customerOrDefault(customerId).improveScore(5);
  }

  creditScoreOf(customerId: string): number {
    return this.customerOrDefault(customerId).creditScore;
  }

  private customerOrDefault(customerId: string): Customer {
    let customer = this.customers.get(customerId);
    if (!customer) {
      customer = new Customer(customerId, BASELINE_CREDIT_SCORE);
      this.customers.set(customerId, customer);
    }
    return customer;
  }
}
