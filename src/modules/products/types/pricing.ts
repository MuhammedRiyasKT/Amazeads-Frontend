export interface PricingSimulation {
  material_price: number;
  printing_price: number;
  ads_price: number;
  profit: number;
  cutting_price: number;
  packing: number;
  other: number;
  gst: number;
  sqft: number;
}

export interface PricingCalculationResult {
  baseCostPerSqft: number;
  totalBaseCost: number;
  profitAmount: number;
  beforeGstTotal: number;
  gstAmount: number;
  recommendedSellingPrice: number;
}