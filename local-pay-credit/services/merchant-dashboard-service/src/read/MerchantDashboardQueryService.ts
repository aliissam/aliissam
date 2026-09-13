import { MerchantAnalyticsProjection, MerchantSummary } from './MerchantAnalyticsProjection';

// The query side of CQRS: this is what the merchant dashboard actually
// calls, completely independent of the payment-service write path.
export class MerchantDashboardQueryService {
  constructor(private readonly projection: MerchantAnalyticsProjection) {}

  getSummary(merchantId: string): MerchantSummary {
    return (
      this.projection.get(merchantId) ?? {
        merchantId,
        totalSucceeded: 0,
        totalFailed: 0,
        transactionCount: 0,
      }
    );
  }
}
