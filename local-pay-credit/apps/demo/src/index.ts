import { Money } from '@lpc/shared-kernel';
import { wirePlatform } from '@lpc/platform';

async function main(): Promise<void> {
  const platform = wirePlatform();

  const merchant = platform.merchantOnboarding.register(
    'merchant-1',
    'Baghdad Electronics Co.',
    'IQ-TAX-00123',
  );
  platform.merchantOnboarding.approveKyc(merchant.merchantId);
  console.log(`Merchant "${merchant.legalName}" KYC status: ${merchant.status}`);

  await platform.creditService.grantCreditLimit('customer-1', Money.of(500_000, 'IQD'));
  console.log('Granted customer-1 a 500,000 IQD BNPL credit limit.');

  console.log('\n--- Processing a Zain Cash payment ---');
  await platform.paymentService.processPayment('zain-cash', {
    transactionId: 'txn-1001',
    merchantId: merchant.merchantId,
    customerId: 'customer-1',
    amount: Money.of(150_000, 'IQD'),
  });
  console.log(`customer-1 credit score is now ${platform.creditService.creditScoreOf('customer-1')}.`);

  console.log('\n--- Customer opts into a 3-installment BNPL plan ---');
  await platform.creditService.createInstallmentPlan('customer-1', 'plan-1', Money.of(300_000, 'IQD'), 3);

  console.log('\n--- A cash-on-delivery order is reconciled by a field agent ---');
  await platform.paymentService.processPayment('cash-agent', {
    transactionId: 'txn-1002',
    merchantId: merchant.merchantId,
    customerId: 'customer-2',
    amount: Money.of(75_000, 'IQD'),
  });

  console.log('\n--- Merchant dashboard (CQRS read side) ---');
  console.log(platform.dashboard.getSummary(merchant.merchantId));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
