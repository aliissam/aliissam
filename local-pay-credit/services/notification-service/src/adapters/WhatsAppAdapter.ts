import { NotificationMessage, NotificationPort } from '../domain/NotificationPort';

export class WhatsAppAdapter implements NotificationPort {
  readonly channel = 'whatsapp';

  async send(message: NotificationMessage): Promise<void> {
    console.log(`[WhatsApp -> ${message.recipient}] ${message.body}`);
  }
}
