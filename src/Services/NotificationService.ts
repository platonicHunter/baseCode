import agenda from "../controllers/Email/agenda";
import { INotificationInterface } from "../types/Notification/INotificationInterface";

export class NotificationService {
  private notificationRepository: INotificationInterface;

  constructor(notificationRepository: INotificationInterface) {
    this.notificationRepository = notificationRepository;
  }

  async scheduleVerificationEmail(email: string, token: string): Promise<void> {
    await agenda.now("send verification email", {
      email,
      token,
    });
  }

  async notifyUser(userId: string, message: string): Promise<void> {
    await this.notificationRepository.sendNotification(userId, message);
  }
}
