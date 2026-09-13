export interface MerchantSummary {
  merchantId: string;
  totalSucceeded: number;
  totalFailed: number;
  transactionCount: number;
  currency?: string;
}

// The CQRS read model: denormalized and shaped purely for the dashboard's
// query needs. It is rebuilt from events, never written to directly by
// payment-service -- that's what lets merchants hammering this for
// reports never compete with the live transaction write path.
export class MerchantAnalyticsProjection {
  private readonly summaries = new Map<string, MerchantSummary>();

  recordSucceeded(merchantId: string, amount: number, currency: string): void {
    const summary = this.summaryFor(merchantId);
    summary.totalSucceeded += amount;
    summary.transactionCount += 1;
    summary.currency = currency;
  }

  recordFailed(merchantId: string): void {
    const summary = this.summaryFor(merchantId);
    summary.totalFailed += 1;
    summary.transactionCount += 1;
  }

  get(merchantId: string): MerchantSummary | undefined {
    return this.summaries.get(merchantId);
  }

  private summaryFor(merchantId: string): MerchantSummary {
    let summary = this.summaries.get(merchantId);
    if (!summary) {
      summary = { merchantId, totalSucceeded: 0, totalFailed: 0, transactionCount: 0 };
      this.summaries.set(merchantId, summary);
    }
    return summary;
  }
}
