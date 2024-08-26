import express, { Request, Response } from "express";
import helmet from "helmet";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { PORT } from "./config";
import { server, app } from "./Socket/socket";
import logginMiddleware from "./utils/logger";
import { makeDb } from "./data-access";
import userRoute from "./routes/auth.route";
import messageRoute from "./routes/messages.route";

app.use(helmet());
makeDb();
const window = new JSDOM("").window;
export const purify = DOMPurify(window);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logginMiddleware);

app.use("/api/user", userRoute);
app.use("/api/messages", messageRoute);



server.listen(PORT, () => {
  console.log(`Server running on the port ${PORT}`);
});

export {app};