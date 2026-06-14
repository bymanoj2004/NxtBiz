import bcrypt from "bcryptjs";
import "../src/config/env.js";
import { connectDb } from "../src/config/db.js";
import { agentDefinitions } from "../src/config/specRules.js";
import { Agent } from "../src/models/Automation.js";
import { Customer } from "../src/models/Customer.js";
import { User } from "../src/models/User.js";
import { Workflow } from "../src/models/Operations.js";

await connectDb();

const passwordHash = await bcrypt.hash("Admin12345", 12);

await User.findOneAndUpdate(
  { email: "admin@nxtbiz.local" },
  {
    name: "NxtBiz Admin",
    email: "admin@nxtbiz.local",
    passwordHash,
    role: "Admin",
    active: true
  },
  { upsert: true, new: true }
);

const customer = await Customer.findOneAndUpdate(
  { email: "casey@northstar.example" },
  {
    name: "Casey Morgan",
    email: "casey@northstar.example",
    phone: "+1 555 0100",
    company: "Northstar Services",
    tags: ["demo", "priority"],
    notes: "Sample NxtBiz customer profile.",
    healthScore: 78
  },
  { upsert: true, new: true }
);

await Workflow.findOneAndUpdate(
  { name: "Negative Email Escalation" },
  {
    name: "Negative Email Escalation",
    trigger: "email_processed",
    condition: "negative",
    action: "create ticket and notify manager",
    steps: [
      { type: "trigger", label: "Email processed" },
      { type: "condition", label: "Sentiment is negative" },
      { type: "action", label: "Create ticket and notify" }
    ],
    enabled: true
  },
  { upsert: true, new: true }
);

await Promise.all(
  agentDefinitions.map((definition) =>
    Agent.findOneAndUpdate({ agentId: definition.agentId }, definition, { upsert: true, new: true })
  )
);

console.log("NxtBiz seed complete");
console.log("Admin email: admin@nxtbiz.local");
console.log("Admin password: Admin12345");
console.log(`Sample customer: ${customer.name}`);
process.exit(0);
