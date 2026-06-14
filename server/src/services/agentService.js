import crypto from "crypto";
import { agentDefinitions, taskPlannerRules } from "../config/specRules.js";
import { Email } from "../models/Email.js";
import { Agent, AgentExecution, Notification } from "../models/Automation.js";
import { emitEvent } from "../realtime.js";

export async function syncAgentDefinitions() {
  await Promise.all(
    agentDefinitions.map((definition) =>
      Agent.findOneAndUpdate(
        { agentId: definition.agentId },
        { $set: definition },
        { upsert: true, new: true }
      )
    )
  );
}

function planAgents(intent) {
  const domainAgents = taskPlannerRules[intent] || taskPlannerRules.general_inquiry;
  return ["intent-agent", "task-planner-agent", ...domainAgents, "crm-agent", "chief-of-staff-agent"];
}

async function runSingleAgent(agentId, eventId, input) {
  const execution = await AgentExecution.create({
    agentId,
    eventId,
    status: "started",
    input,
    logs: [`${agentId} started`]
  });

  await Agent.findOneAndUpdate(
    { agentId },
    { status: "running", lastExecution: new Date(), $push: { logs: `${agentId} started ${eventId}` } }
  );

  const output = {
    summary: `${agentId} completed for ${input.intent || "general operation"}`,
    nextAction: agentId === "chief-of-staff-agent" ? "Review execution history and CRM context." : "Continue plan."
  };

  execution.status = "completed";
  execution.output = output;
  execution.logs.push(`${agentId} completed`);
  execution.finishedAt = new Date();
  await execution.save();

  await Agent.findOneAndUpdate(
    { agentId },
    { status: "idle", lastExecution: new Date(), $push: { logs: `${agentId} completed ${eventId}` } }
  );

  return execution;
}

export async function orchestrateAgents(input) {
  const eventId = input.eventId || crypto.randomUUID();
  const context = {
    eventId,
    emailId: input.emailId,
    customerId: input.customerId,
    intent: input.intent || "general_inquiry",
    payload: input.payload || {}
  };

  const plannedAgents = planAgents(context.intent);
  const executions = [];

  for (const agentId of plannedAgents) {
    executions.push(await runSingleAgent(agentId, eventId, context));
  }

  if (context.emailId) {
    await Email.findByIdAndUpdate(context.emailId, { processed: true });
  }

  const notification = await Notification.create({
    type: "agent_completed",
    title: "Agent orchestration completed",
    message: `NxtBiz completed ${plannedAgents.length} agent steps.`,
    metadata: { eventId, emailId: context.emailId, plannedAgents }
  });

  emitEvent("agent_completed", { eventId, plannedAgents, notificationId: notification.id });

  return { eventId, plannedAgents, executions };
}
