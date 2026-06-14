import express from "express";
import { z } from "zod";
import { permissions } from "../config/specRules.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { CRMActivity, Memory, Notification } from "../models/Automation.js";
import { Customer } from "../models/Customer.js";
import { Email } from "../models/Email.js";
import { Invoice, Meeting, Report, Ticket, Workflow } from "../models/Operations.js";
import { emitEvent } from "../realtime.js";
import { orchestrateAgents } from "../services/agentService.js";
import { analyzeEmail } from "../services/emailIntelligence.js";
import { calculateBusinessHealthScore } from "../services/healthScore.js";
import { generateInvoicePdf, generateReportPdf } from "../services/pdfService.js";
import { executeWorkflow } from "../services/workflowService.js";

export const businessRouter = express.Router();

businessRouter.use(requireAuth);

businessRouter.get("/dashboard", async (req, res) => {
  const [customers, emails, tickets, invoices, meetings] = await Promise.all([
    Customer.countDocuments(),
    Email.countDocuments(),
    Ticket.countDocuments(),
    Invoice.find(),
    Meeting.countDocuments()
  ]);
  const revenue = invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.amount, 0);
  res.json({ customers, emails, tickets, meetings, revenue, health: calculateBusinessHealthScore() });
});

const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  healthScore: z.number().min(0).max(100).optional()
});

businessRouter.get("/customers", async (req, res) => {
  res.json(await Customer.find().sort({ createdAt: -1 }));
});

businessRouter.get("/customers/:id", async (req, res) => {
  const [customer, activities, emails, tickets, invoices, meetings] = await Promise.all([
    Customer.findById(req.params.id),
    CRMActivity.find({ customerId: req.params.id }).sort({ createdAt: -1 }),
    Email.find({ customerId: req.params.id }).sort({ createdAt: -1 }),
    Ticket.find({ customerId: req.params.id }).sort({ createdAt: -1 }),
    Invoice.find({ customerId: req.params.id }).sort({ createdAt: -1 }),
    Meeting.find({ customerId: req.params.id }).sort({ startTime: -1 })
  ]);
  res.json({ customer, activities, emails, tickets, invoices, meetings });
});

businessRouter.post("/customers", validate(customerSchema), async (req, res) => {
  res.status(201).json(await Customer.create(req.body));
});

businessRouter.put("/customers/:id", validate(customerSchema.partial()), async (req, res) => {
  res.json(await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

businessRouter.delete("/customers/:id", requireRole(permissions.deleteCustomers), async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

businessRouter.post("/emails/process", validate(z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  sender: z.string().min(1),
  customerId: z.string().optional()
})), async (req, res, next) => {
  try {
    const intelligence = analyzeEmail(req.body);
    const email = await Email.create({ ...req.body, ...intelligence });
    emitEvent("new_email", { emailId: email.id, intent: email.intent, urgency: email.urgency });
    const orchestration = await orchestrateAgents({
      emailId: email.id,
      customerId: email.customerId,
      intent: email.intent,
      payload: email.toObject()
    });
    res.status(201).json({ email, orchestration });
  } catch (error) {
    next(error);
  }
});

businessRouter.get("/emails", async (req, res) => {
  res.json(await Email.find().sort({ createdAt: -1 }).populate("customerId"));
});

businessRouter.get("/emails/:id", async (req, res) => {
  res.json(await Email.findById(req.params.id).populate("customerId"));
});

businessRouter.get("/crm", async (req, res) => {
  res.json(await CRMActivity.find().sort({ createdAt: -1 }).populate("customerId createdBy"));
});

businessRouter.post("/crm/note", async (req, res) => {
  res.status(201).json(await CRMActivity.create({ ...req.body, type: "note", createdBy: req.user.id }));
});

businessRouter.post("/crm/activity", async (req, res) => {
  res.status(201).json(await CRMActivity.create({ ...req.body, createdBy: req.user.id }));
});

function crudRoutes(pathName, Model, eventName) {
  businessRouter.get(`/${pathName}`, async (req, res) => res.json(await Model.find().sort({ createdAt: -1 })));
  businessRouter.post(`/${pathName}`, async (req, res) => {
    const record = await Model.create(req.body);
    if (eventName) emitEvent(eventName, { id: record.id });
    res.status(201).json(record);
  });
  businessRouter.put(`/${pathName}/:id`, async (req, res) => {
    res.json(await Model.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  });
  businessRouter.delete(`/${pathName}/:id`, async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.status(204).send();
  });
}

crudRoutes("meetings", Meeting, "meeting_created");
crudRoutes("tickets", Ticket, "new_ticket");

businessRouter.get("/invoices", async (req, res) => res.json(await Invoice.find().sort({ createdAt: -1 }).populate("customerId")));
businessRouter.post("/invoices", async (req, res) => {
  const invoice = await Invoice.create(req.body);
  const customer = await Customer.findById(invoice.customerId);
  invoice.pdfUrl = generateInvoicePdf(invoice, customer);
  await invoice.save();
  emitEvent("invoice_created", { id: invoice.id, pdfUrl: invoice.pdfUrl });
  res.status(201).json(invoice);
});
businessRouter.get("/invoices/:id", async (req, res) => res.json(await Invoice.findById(req.params.id).populate("customerId")));
businessRouter.get("/invoices/:id/download", async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  res.redirect(invoice.pdfUrl);
});
businessRouter.put("/invoices/:id", async (req, res) => res.json(await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true })));
businessRouter.delete("/invoices/:id", async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

businessRouter.post("/reports/generate", async (req, res) => {
  const report = await Report.create({ ...req.body, generatedBy: req.user.id });
  report.pdfUrl = generateReportPdf(report);
  await report.save();
  res.status(201).json(report);
});
businessRouter.get("/reports", async (req, res) => res.json(await Report.find().sort({ createdAt: -1 })));
businessRouter.get("/reports/:id", async (req, res) => res.json(await Report.findById(req.params.id)));

businessRouter.get("/workflows", async (req, res) => res.json(await Workflow.find().sort({ createdAt: -1 })));
businessRouter.post("/workflows", async (req, res) => res.status(201).json(await Workflow.create(req.body)));
businessRouter.get("/workflows/:id", async (req, res) => res.json(await Workflow.findById(req.params.id)));
businessRouter.put("/workflows/:id", async (req, res) => res.json(await Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true })));
businessRouter.delete("/workflows/:id", async (req, res) => {
  await Workflow.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
businessRouter.post("/workflows/:id/execute", async (req, res, next) => {
  try {
    res.json(await executeWorkflow(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
});

businessRouter.get("/memory/search", async (req, res) => {
  const q = String(req.query.q || "");
  res.json(await Memory.find({ $or: [{ key: new RegExp(q, "i") }, { value: new RegExp(q, "i") }] }).limit(25));
});

businessRouter.get("/notifications", async (req, res) => {
  res.json(await Notification.find({ $or: [{ userId: req.user.id }, { userId: null }] }).sort({ createdAt: -1 }));
});

businessRouter.put("/notifications/:id", async (req, res) => {
  res.json(await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true }));
});
