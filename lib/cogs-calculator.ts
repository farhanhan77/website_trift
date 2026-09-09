/**
 * Business Logic & COGS (HPP) Calculation Engine
 * According to DESIGN.md Section 4
 */

export interface BalCostInput {
  purchase_price: number;
  shipping_cost: number;
  laundry_cost: number;
  packing_cost: number;
  total_grade_a_qty: number;
  total_grade_b_qty: number;
  total_defective_qty: number;
}

export interface BalCalculationResult {
  total_capital: number;
  sellable_qty: number;
  total_qty: number;
  hpp_per_pcs: number;
  defect_cost_burden: number;
}

/**
 * 4.1 & 4.2: Computes Total Capital, Sellable Qty, and Defect-Adjusted HPP per Usable Pcs
 */
export function calculateBalHpp(input: BalCostInput): BalCalculationResult {
  const purchase = Math.max(0, Number(input.purchase_price) || 0);
  const shipping = Math.max(0, Number(input.shipping_cost) || 0);
  const laundry = Math.max(0, Number(input.laundry_cost) || 0);
  const packing = Math.max(0, Number(input.packing_cost) || 0);

  const total_capital = purchase + shipping + laundry + packing;

  const gradeA = Math.max(0, Math.floor(Number(input.total_grade_a_qty) || 0));
  const gradeB = Math.max(0, Math.floor(Number(input.total_grade_b_qty) || 0));
  const defect = Math.max(0, Math.floor(Number(input.total_defective_qty) || 0));

  const sellable_qty = gradeA + gradeB;
  const total_qty = sellable_qty + defect;

  // Defective items are excluded from usable quantity denominator
  const hpp_per_pcs = sellable_qty > 0 ? Math.round(total_capital / sellable_qty) : 0;

  // Cost absorbed due to defects
  const unadjustedHpp = total_qty > 0 ? Math.round(total_capital / total_qty) : 0;
  const defect_cost_burden = defect > 0 ? (hpp_per_pcs - unadjustedHpp) : 0;

  return {
    total_capital,
    sellable_qty,
    total_qty,
    hpp_per_pcs,
    defect_cost_burden,
  };
}

/**
 * 4.3: Computes Net Profit per Sale
 */
export function calculateSaleProfit(actualSellingPrice: number, allocatedHpp: number): {
  net_profit: number;
  margin_percent: number;
  is_profitable: boolean;
} {
  const price = Number(actualSellingPrice) || 0;
  const hpp = Number(allocatedHpp) || 0;
  const net_profit = price - hpp;
  const margin_percent = price > 0 ? Number(((net_profit / price) * 100).toFixed(1)) : 0;
  const is_profitable = net_profit >= 0;

  return {
    net_profit,
    margin_percent,
    is_profitable,
  };
}

/**
 * Computes ROI percentage for a Bal: (Total Revenue / Total Capital) * 100
 */
export function calculateBalRoi(totalRevenue: number, totalCapital: number): number {
  if (!totalCapital || totalCapital <= 0) return 0;
  return Number(((totalRevenue / totalCapital) * 100).toFixed(1));
}
