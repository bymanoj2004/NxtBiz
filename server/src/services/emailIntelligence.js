import {
  criticalUrgencyWords,
  negativeSignalWords,
  positiveSignalWords
} from "../config/specRules.js";

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

export function analyzeEmail({ subject = "", body = "" }) {
  const text = `${subject} ${body}`.toLowerCase();
  const negative = includesAny(text, negativeSignalWords);
  const positive = includesAny(text, positiveSignalWords);

  let sentiment = "neutral";
  if (negative && !positive) sentiment = "negative";
  if (positive && !negative) sentiment = "positive";

  let urgency = "low";
  if (text.includes("urgent") || text.includes("escalate")) urgency = "high";
  if (includesAny(text, criticalUrgencyWords)) urgency = "critical";

  let intent = "general_inquiry";
  if (text.includes("meeting") || text.includes("schedule") || text.includes("call")) {
    intent = "schedule_meeting";
  } else if (text.includes("invoice") || text.includes("bill") || text.includes("payment")) {
    intent = "invoice_request";
  } else if (text.includes("support") || text.includes("broken") || text.includes("issue") || text.includes("failed")) {
    intent = "support_request";
  } else if (text.includes("pricing") || text.includes("demo") || text.includes("renew") || text.includes("buy")) {
    intent = "sales_opportunity";
  }

  const recommendations = [];
  if (urgency === "critical") recommendations.push("Escalate to a manager immediately.");
  if (intent === "schedule_meeting") recommendations.push("Create or confirm a customer meeting.");
  if (intent === "invoice_request") recommendations.push("Review invoice status and prepare a PDF if needed.");
  if (intent === "support_request") recommendations.push("Create a support ticket and assign an owner.");
  if (intent === "sales_opportunity") recommendations.push("Log opportunity context in CRM and draft a follow-up.");

  return {
    sentiment,
    intent,
    urgency,
    confidence: recommendations.length > 0 ? 0.82 : 0.62,
    autoResponse: "Thanks for contacting NxtBiz. Our operations team is reviewing this and will follow up shortly.",
    recommendations
  };
}
