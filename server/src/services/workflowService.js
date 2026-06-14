import { Notification } from "../models/Automation.js";
import { Ticket, Workflow } from "../models/Operations.js";
import { emitEvent } from "../realtime.js";

export async function executeWorkflow(workflowId, payload = {}) {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) {
    const error = new Error("Workflow not found");
    error.status = 404;
    throw error;
  }

  const serializedPayload = JSON.stringify(payload).toLowerCase();
  const condition = workflow.condition?.trim().toLowerCase();
  if (condition && !serializedPayload.includes(condition)) {
    workflow.logs.push({ status: "skipped", message: "Condition did not match", payload });
    await workflow.save();
    return workflow;
  }

  const action = workflow.action.toLowerCase();
  if (action.includes("ticket") && payload.customerId) {
    await Ticket.create({
      customerId: payload.customerId,
      priority: payload.priority || "medium",
      issue: payload.issue || `Workflow ticket from ${workflow.name}`
    });
  }

  if (action.includes("notify")) {
    await Notification.create({
      type: "workflow",
      title: "Workflow executed",
      message: `${workflow.name} completed.`,
      metadata: { workflowId: workflow.id }
    });
  }

  workflow.logs.push({ status: "completed", message: "Workflow completed", payload });
  await workflow.save();
  emitEvent("workflow_executed", { workflowId: workflow.id, status: "completed" });
  return workflow;
}
