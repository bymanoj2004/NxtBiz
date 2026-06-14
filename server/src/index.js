import http from "http";
import { Server } from "socket.io";
import { connectDb } from "./config/db.js";
import { env, validateEnv } from "./config/env.js";
import { createApp } from "./app.js";
import { registerRealtime } from "./realtime.js";
import { syncAgentDefinitions } from "./services/agentService.js";

validateEnv();

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.clientOrigin, credentials: true }
});

registerRealtime(io);

try {
  await connectDb();
  await syncAgentDefinitions();
  if (!env.redisUrl) {
    console.warn("NxtBiz Redis unavailable or not configured; agent orchestration runs synchronously.");
  }
  server.listen(env.port, () => {
    console.log(`NxtBiz API listening on port ${env.port}`);
  });
} catch (error) {
  console.error("NxtBiz API failed to start", error);
  process.exit(1);
}
