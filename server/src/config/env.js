import dotenv from "dotenv";

dotenv.config();

const requiredInProduction = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nxtbiz",
  redisUrl: process.env.REDIS_URL || "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "development-access-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "development-refresh-secret-change-me",
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  pdfBaseUrl: process.env.PDF_BASE_URL || "http://localhost:5000/pdfs",
  emailFrom: process.env.EMAIL_FROM || "ops@nxtbiz.local"
};

export function validateEnv() {
  if (env.nodeEnv !== "production") return;

  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }
}
