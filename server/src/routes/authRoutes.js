import bcrypt from "bcryptjs";
import express from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/tokens.js";

export const authRouter = express.Router();

const authSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["Admin", "Manager", "Employee", "Viewer"]).optional()
});

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production"
  };
}

function sendSession(res, user, refreshToken) {
  const accessToken = signAccessToken(user);
  res.cookie("accessToken", accessToken, { ...cookieOptions(), maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
  return res.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

authRouter.post("/register", validate(authSchema), async (req, res, next) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      name: req.body.name || req.body.email.split("@")[0],
      email: req.body.email,
      passwordHash,
      role: req.body.role || "Employee"
    });
    const refreshToken = signRefreshToken(user);
    user.refreshTokenHash = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();
    sendSession(res, user, refreshToken);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", validate(authSchema.omit({ name: true, role: true })), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !user.active) return res.status(401).json({ message: "Invalid credentials" });

    const passwordOk = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!passwordOk) return res.status(401).json({ message: "Invalid credentials" });

    const refreshToken = signRefreshToken(user);
    user.refreshTokenHash = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();
    sendSession(res, user, refreshToken);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).json({ message: "Refresh token required" });

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.sub);
    if (!user || user.refreshTokenHash !== hashToken(token)) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const nextRefreshToken = signRefreshToken(user);
    user.refreshTokenHash = hashToken(nextRefreshToken);
    await user.save();
    sendSession(res, user, nextRefreshToken);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", requireAuth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $unset: { refreshTokenHash: "" } });
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});
