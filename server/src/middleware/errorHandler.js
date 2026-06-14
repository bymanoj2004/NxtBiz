import { ZodError } from "zod";
import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: "Validation failed", issues: error.issues });
  }

  const status = error.status || 500;
  const payload = { message: error.message || "Internal server error" };
  if (env.nodeEnv !== "production") payload.stack = error.stack;

  res.status(status).json(payload);
}
