import express from "express";
import { body, validationResult } from "express-validator";
import { verifyEmail } from "../controllers/Email/verifyMail";
import makeLogin from "../controllers/Auth/login";
import { renewAccessToken } from "../config/token/renewToken";
import { authenticateToken } from "../middlewares/auth";
import makeSignup from "../controllers/Auth/sign-up";
import { logoutUser } from "../controllers/Auth/logout";

const router = express.Router();
const signup = makeSignup();
const login = makeLogin();

router.post(
  "/register",
  body("name").trim().escape(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 5, max: 20 }).trim().escape(),
  body("confirmPassword").isLength({ min: 5, max: 20 }).trim().escape(),
  signup,
 );
router.get("/verify/:token", verifyEmail);
router.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 5, max: 20 }).trim().escape(),
  login
);
router.post("/renew-token", renewAccessToken);

router.post("/logout", authenticateToken, logoutUser);

export default router;
