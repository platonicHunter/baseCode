import { NotificationService } from "../../src/Services/NotificationService"; 
import agenda from "../../src/controllers/Email/agenda"; 
import { INotificationInterface } from "../../src/types/Notification/INotificationInterface";

// Mock agenda
jest.mock("../../src/controllers/Email/agenda", () => ({
  now: jest.fn(),
}));

// Create a mock notification repository
const mockNotificationRepository: INotificationInterface = {
    sendNotification: jest.fn(),
    sendEmailVerification: jest.fn(),  
};

describe("NotificationService", () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService(mockNotificationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should schedule a verification email", async () => {
    const email = "test@example.com";
    const token = "verificationToken";

    await notificationService.scheduleVerificationEmail(email, token);

    expect(agenda.now).toHaveBeenCalledWith("send verification email", {
      email,
      token,
    });
  });

  it("should notify a user", async () => {
    const userId = "userId123";
    const message = "This is a notification message";

    await notificationService.notifyUser(userId, message);

    expect(mockNotificationRepository.sendNotification).toHaveBeenCalledWith(
      userId,
      message
    );
  });
});
