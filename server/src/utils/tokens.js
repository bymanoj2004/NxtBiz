import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name }, env.jwtAccessSecret, {
    expiresIn: env.accessTokenExpiresIn
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, tokenVersion: crypto.randomUUID() }, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpiresIn
  });
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}
