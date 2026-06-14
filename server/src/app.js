import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { agentRouter } from "./routes/agentRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { businessRouter } from "./routes/businessRoutes.js";
import { userRouter } from "./routes/userRoutes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  app.use("/pdfs", express.static(path.resolve("storage", "pdfs")));

  app.get("/health", (req, res) => {
    res.json({ ok: true, service: "NxtBiz API" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/agents", agentRouter);
  app.use("/api", businessRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
