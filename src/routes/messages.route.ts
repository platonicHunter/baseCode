import express from "express";
import { getMessages, sendMessage } from "../controllers/Message/message";
import { authenticateToken } from "../middlewares/auth";

const router = express.Router();

router.get("/:id", authenticateToken, getMessages());
router.post("/send/:id", authenticateToken, sendMessage());

export default router;
