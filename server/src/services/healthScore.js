import { healthScoreWeights } from "../config/specRules.js";

export function calculateBusinessHealthScore(metrics = {}) {
  const factors = {
    customerSatisfaction: metrics.customerSatisfaction ?? 75,
    responseTime: metrics.responseTime ?? 70,
    invoiceCollection: metrics.invoiceCollection ?? 75,
    ticketResolution: metrics.ticketResolution ?? 70,
    leadConversion: metrics.leadConversion ?? 65,
    meetingMomentum: metrics.meetingMomentum ?? 60
  };

  const score = Math.round(
    factors.customerSatisfaction * healthScoreWeights.customerSatisfaction +
      factors.responseTime * healthScoreWeights.responseTime +
      factors.invoiceCollection * healthScoreWeights.invoiceCollection +
      factors.ticketResolution * healthScoreWeights.ticketResolution +
      factors.leadConversion * healthScoreWeights.leadConversion
  );

  return { score, factors };
}
