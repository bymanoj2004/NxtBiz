import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    agentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: { type: String, enum: ["idle", "running", "failed"], default: "idle" },
    lastExecution: { type: Date },
    logs: [{ type: String }],
    capabilities: [{ type: String }]
  },
  { timestamps: true }
);

const agentExecutionSchema = new mongoose.Schema(
  {
    agentId: { type: String, required: true },
    eventId: { type: String, required: true },
    status: { type: String, enum: ["started", "completed", "failed"], default: "started" },
    input: { type: mongoose.Schema.Types.Mixed, default: {} },
    output: { type: mongoose.Schema.Types.Mixed, default: {} },
    logs: [{ type: String }],
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
    error: { type: String }
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

const memorySchema = new mongoose.Schema(
  {
    scope: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    agentId: { type: String },
    key: { type: String, required: true },
    value: { type: String, required: true },
    tags: [{ type: String }],
    source: { type: String }
  },
  { timestamps: true }
);

const crmActivitySchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Agent = mongoose.model("Agent", agentSchema);
export const AgentExecution = mongoose.model("AgentExecution", agentExecutionSchema);
export const Notification = mongoose.model("Notification", notificationSchema);
export const Memory = mongoose.model("Memory", memorySchema);
export const CRMActivity = mongoose.model("CRMActivity", crmActivitySchema);
