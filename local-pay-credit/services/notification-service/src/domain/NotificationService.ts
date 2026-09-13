import { NotificationPort } from './NotificationPort';

export class NotificationService {
  constructor(private readonly channels: NotificationPort[]) {}

  async notify(recipient: string, body: string): Promise<void> {
    for (const channel of this.channels) {
      await channel.send({ recipient, body });
    }
  }
}
