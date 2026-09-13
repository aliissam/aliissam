export class Customer {
  constructor(
    public readonly customerId: string,
    public creditScore: number,
  ) {}

  improveScore(points: number): void {
    this.creditScore = Math.min(this.creditScore + points, 850);
  }
}
