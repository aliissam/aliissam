import { NotificationMessage, NotificationPort } from '../domain/NotificationPort';

// In Iraq, SMS delivery is far more reliable than email, so it's a
// primary channel here rather than a fallback.
export class SmsAdapter implements NotificationPort {
  readonly channel = 'sms';

  async send(message: NotificationMessage): Promise<void> {
    console.log(`[SMS -> ${message.recipient}] ${message.body}`);
  }
}
