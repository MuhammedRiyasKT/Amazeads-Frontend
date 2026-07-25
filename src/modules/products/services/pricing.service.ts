import { PricingSimulation, PricingCalculationResult } from "../types/pricing";

export function calculateProductPrice(config: PricingSimulation): PricingCalculationResult {
  const baseCostPerSqft = 
    config.material_price + 
    config.printing_price + 
    config.ads_price + 
    config.cutting_price + 
    config.packing + 
    config.other;

  const totalBaseCost = baseCostPerSqft * config.sqft;
  const profitAmount = (totalBaseCost * config.profit) / 100;
  const beforeGstTotal = totalBaseCost + profitAmount;
  const gstAmount = (beforeGstTotal * config.gst) / 100;
  const recommendedSellingPrice = beforeGstTotal + gstAmount;

  return {
    baseCostPerSqft,
    totalBaseCost,
    profitAmount,
    beforeGstTotal,
    gstAmount,
    recommendedSellingPrice
  };
}