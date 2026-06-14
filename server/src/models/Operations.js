import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    attendees: [{ type: String }],
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    notes: { type: String },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }
  },
  { timestamps: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["draft", "sent", "paid", "overdue"], default: "draft" },
    pdfUrl: { type: String },
    lineItems: [
      {
        description: String,
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

const reportSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    recommendations: [{ type: String }],
    summary: { type: String },
    pdfUrl: { type: String },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    issue: { type: String, required: true },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolution: { type: String }
  },
  { timestamps: true }
);

const workflowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    trigger: { type: String, required: true },
    condition: { type: String, default: "" },
    action: { type: String, required: true },
    steps: [
      {
        type: { type: String, enum: ["trigger", "condition", "action"], required: true },
        label: String,
        config: { type: mongoose.Schema.Types.Mixed, default: {} }
      }
    ],
    enabled: { type: Boolean, default: true },
    logs: [
      {
        status: String,
        message: String,
        payload: mongoose.Schema.Types.Mixed,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Meeting = mongoose.model("Meeting", meetingSchema);
export const Invoice = mongoose.model("Invoice", invoiceSchema);
export const Report = mongoose.model("Report", reportSchema);
export const Ticket = mongoose.model("Ticket", ticketSchema);
export const Workflow = mongoose.model("Workflow", workflowSchema);
