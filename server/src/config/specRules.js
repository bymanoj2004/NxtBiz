export const roles = ["Admin", "Manager", "Employee", "Viewer"];

export const permissions = {
  listUsers: ["Admin", "Manager"],
  createUsers: ["Admin"],
  updateUsers: ["Admin", "Manager"],
  deleteUsers: ["Admin"],
  runAgents: ["Admin", "Manager"],
  deleteCustomers: ["Admin", "Manager"]
};

export const emailIntentCategories = [
  "general_inquiry",
  "schedule_meeting",
  "invoice_request",
  "support_request",
  "sales_opportunity"
];

export const negativeSignalWords = [
  "angry",
  "cancel",
  "broken",
  "refund",
  "late",
  "complaint",
  "urgent",
  "bad",
  "issue",
  "failed"
];

export const positiveSignalWords = [
  "thanks",
  "great",
  "love",
  "happy",
  "excellent",
  "appreciate",
  "renew"
];

export const criticalUrgencyWords = ["urgent", "asap", "immediately"];

export const agentDefinitions = [
  { agentId: "intent-agent", name: "Intent Agent", capabilities: ["intent_detection"] },
  { agentId: "task-planner-agent", name: "Task Planner Agent", capabilities: ["routing"] },
  { agentId: "email-agent", name: "Email Agent", capabilities: ["response_drafting"] },
  { agentId: "crm-agent", name: "CRM Agent", capabilities: ["activity_logging", "memory"] },
  { agentId: "meeting-agent", name: "Meeting Agent", capabilities: ["meeting_follow_up"] },
  { agentId: "invoice-agent", name: "Invoice Agent", capabilities: ["invoice_follow_up"] },
  { agentId: "customer-support-agent", name: "Customer Support Agent", capabilities: ["ticket_triage"] },
  { agentId: "chief-of-staff-agent", name: "Chief of Staff Agent", capabilities: ["summary", "coordination"] }
];

export const taskPlannerRules = {
  schedule_meeting: ["meeting-agent"],
  invoice_request: ["invoice-agent"],
  support_request: ["customer-support-agent"],
  sales_opportunity: ["email-agent"],
  general_inquiry: ["email-agent"]
};

export const healthScoreWeights = {
  customerSatisfaction: 0.28,
  responseTime: 0.16,
  invoiceCollection: 0.2,
  ticketResolution: 0.2,
  leadConversion: 0.16
};

export const socketEvents = [
  "new_email",
  "new_ticket",
  "invoice_created",
  "meeting_created",
  "agent_completed",
  "workflow_executed"
];
