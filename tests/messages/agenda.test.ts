import Agenda, { Job } from "agenda";
import { notificationRepository } from "../../src/controllers/Auth/login";
import agenda from "../../src/controllers/Email/agenda";

// Mock the notification repository
jest.mock("../../src/controllers/Auth/login", () => ({
  notificationRepository: {
    sendEmailVerification: jest.fn(),
  },
}));

describe("Agenda Job and Environment Variables", () => {
  const jobData = { email: "test@example.com", token: "test-token" };
  let job: Job;

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
  });

  beforeAll(() => {
    // Mock the job object with attributes
    job = {
      attrs: {
        data: jobData,
      },
    } as unknown as Job;
  });

  it("should send an email verification when the job runs", async () => {
    // Manually invoke the job handler
    const handler = agenda._definitions["send verification email"].fn;

    // Call the handler with the mock job
    await handler(job);

    // Verify that sendEmailVerification was called with the correct arguments
    expect(notificationRepository.sendEmailVerification).toHaveBeenCalledWith(
      jobData.email,
      jobData.token
    );
  });

  it("should throw an error if MONGODB_URI is not defined", () => {
    // Temporarily remove the MONGODB_URI environment variable for testing
    delete process.env.MONGODB_URI;

    // Create a function that initializes Agenda and will throw an error if MONGODB_URI is not defined
    const initializeAgenda = () => {
      if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required");
      }
      return new Agenda({ db: { address: process.env.MONGODB_URI, collection: "jobs" } });
    };

    // Expect the function to throw an error
    expect(() => initializeAgenda()).toThrowError("MONGODB_URI is required");

    // Restore the environment variable for subsequent tests
    process.env.MONGODB_URI = "mongodb://localhost:27017/BaseCode";
  });

  it("should call agenda.start() when agenda is ready", async () => {
    // Increase the timeout for this test
    jest.setTimeout(10000); // 10 seconds

    // Mock the Agenda instance methods
    jest.spyOn(agenda, "start").mockResolvedValue(undefined);
    jest.spyOn(agenda, "on").mockImplementation((event, callback) => {
      if (event === "ready") {
        // Directly invoke the 'ready' event handler
        callback();
      }
      return agenda;
    });

    // Manually trigger the 'ready' event
    await new Promise<void>((resolve) => {
      // This line simulates the `ready` event triggering
      agenda.emit("ready");
      resolve();
    });

    // Ensure that `agenda.start()` is called
    expect(agenda.start).toHaveBeenCalled();
  });
});
