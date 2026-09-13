import { Merchant } from './Merchant';

// Onboarding/KYC is kept in its own bounded context: payment-service and
// credit-service only ever need a merchantId string, never this service's
// internal onboarding state machine or the documents behind it.
export class MerchantOnboardingService {
  private readonly merchants = new Map<string, Merchant>();

  register(merchantId: string, legalName: string, taxRegistrationNumber: string): Merchant {
    const merchant = new Merchant(merchantId, legalName, taxRegistrationNumber);
    this.merchants.set(merchantId, merchant);
    return merchant;
  }

  approveKyc(merchantId: string): void {
    this.requireMerchant(merchantId).approve();
  }

  rejectKyc(merchantId: string, reason: string): void {
    this.requireMerchant(merchantId).reject(reason);
  }

  get(merchantId: string): Merchant {
    return this.requireMerchant(merchantId);
  }

  private requireMerchant(merchantId: string): Merchant {
    const merchant = this.merchants.get(merchantId);
    if (!merchant) {
      throw new Error(`Unknown merchant: ${merchantId}`);
    }
    return merchant;
  }
}
