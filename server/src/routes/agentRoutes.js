import express from "express";
import { permissions } from "../config/specRules.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Agent, AgentExecution } from "../models/Automation.js";
import { orchestrateAgents } from "../services/agentService.js";

export const agentRouter = express.Router();

agentRouter.use(requireAuth);

agentRouter.get("/", async (req, res) => {
  res.json(await Agent.find().sort({ agentId: 1 }));
});

agentRouter.get("/executions", async (req, res) => {
  res.json(await AgentExecution.find().sort({ createdAt: -1 }).limit(100));
});

agentRouter.post("/run", requireRole(permissions.runAgents), async (req, res, next) => {
  try {
    res.status(202).json(await orchestrateAgents(req.body));
  } catch (error) {
    next(error);
  }
});
