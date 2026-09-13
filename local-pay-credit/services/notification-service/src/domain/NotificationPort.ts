export interface NotificationMessage {
  recipient: string;
  body: string;
}

export interface NotificationPort {
  readonly channel: string;
  send(message: NotificationMessage): Promise<void>;
}
