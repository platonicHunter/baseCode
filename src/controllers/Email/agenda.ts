import Agenda, { Job } from "agenda";
import { MONGODB_URI } from "../../config";
import { notificationRepository } from "../Auth/login";

interface JobAttributes {
  email: string;
  token: string;
}

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

const agenda = new Agenda({ db: { address: MONGODB_URI, collection: "jobs" } });

agenda.define(
  "send verification email",
  { concurrency: 10 },
  async (job: Job<JobAttributes>) => {
    const { email, token } = job.attrs.data;
    await notificationRepository.sendEmailVerification(email, token);
  }
);

agenda.on("ready", async () => {
  await agenda.start();
});

export default agenda;
