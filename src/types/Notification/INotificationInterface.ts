export interface INotificationInterface {
  sendNotification(userId: string, message: string): Promise<void>;
  sendEmailVerification(email: string, token: string): Promise<void>;
}
