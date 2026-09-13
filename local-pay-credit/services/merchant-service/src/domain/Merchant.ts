export type KycStatus = 'pending' | 'approved' | 'rejected';

export class Merchant {
  status: KycStatus = 'pending';
  rejectionReason?: string;

  constructor(
    public readonly merchantId: string,
    public readonly legalName: string,
    public readonly taxRegistrationNumber: string,
  ) {}

  approve(): void {
    this.status = 'approved';
  }

  reject(reason: string): void {
    this.status = 'rejected';
    this.rejectionReason = reason;
  }
}
