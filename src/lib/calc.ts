import type {
  CostItem,
  IngredientItem,
  CalculationResult,
  PriceScenario,
} from '@/types';

export function sumCostItems(items: CostItem[]): number {
  return items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
}

export function sumIngredients(items: IngredientItem[]): number {
  return items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
}

export function calculate(
  ingredients: IngredientItem[],
  monthlyFixedCosts: CostItem[],
  startupCosts: CostItem[],
  sellingPrice: number,
  targetProfit: number,
): CalculationResult {
  const costPerUnit = sumIngredients(ingredients);
  const fixedCosts = sumCostItems(monthlyFixedCosts);
  const startupTotal = sumCostItems(startupCosts);
  const marginPerUnit = sellingPrice - costPerUnit;

  let unitsPerMonth = 0;
  let breakEvenUnits = 0;
  let totalRevenue = 0;
  let breakEvenRevenue = 0;

  if (marginPerUnit > 0) {
    unitsPerMonth = (targetProfit + fixedCosts) / marginPerUnit;
    breakEvenUnits = fixedCosts / marginPerUnit;
    totalRevenue = unitsPerMonth * sellingPrice;
    breakEvenRevenue = breakEvenUnits * sellingPrice;
  }

  const unitsPerWeek = unitsPerMonth / 4.33;
  const unitsPerDay = unitsPerMonth / 30;

  const isRealistic = unitsPerDay > 0 && unitsPerDay <= 200;

  return {
    costPerUnit,
    sellingPrice,
    marginPerUnit,
    targetProfit,
    monthlyFixedCosts: fixedCosts,
    totalStartupCosts: startupTotal,
    unitsPerMonth,
    unitsPerWeek,
    unitsPerDay,
    totalRevenue,
    breakEvenUnits,
    breakEvenRevenue,
    isRealistic,
  };
}

export function generateScenarios(
  costPerUnit: number,
  fixedCosts: number,
  targetProfit: number,
  priceRange: { min: number; max: number },
): PriceScenario[] {
  const scenarios: { label: string; price: number; reasoning: string }[] = [
    {
      label: 'Konservatif',
      price: priceRange.min,
      reasoning:
        'Harga terendah dengan margin paling kecil. Lebih mudah menarik pelanggan, tapi Anda perlu menjual lebih banyak unit untuk mencapai target profit.',
    },
    {
      label: 'Seimbang',
      price: Math.round((priceRange.min + priceRange.max) / 2 / 500) * 500,
      reasoning:
        'Harga tengah antara minimal dan maksimal. Keseimbangan antara daya tarik harga dan jumlah unit yang wajar untuk dijual.',
    },
    {
      label: 'Agresif',
      price: priceRange.max,
      reasoning:
        'Harga tertinggi dengan margin terbesar. Anda hanya perlu menjual sedikit unit, tapi permintaan mungkin berkurang karena harga lebih mahal dari kompetitor.',
    },
  ];

  return scenarios.map((s) => {
    const margin = s.price - costPerUnit;
    const unitsPerMonth = margin > 0 ? (targetProfit + fixedCosts) / margin : 0;
    return {
      label: s.label,
      price: s.price,
      margin,
      unitsPerMonth,
      unitsPerWeek: unitsPerMonth / 4.33,
      unitsPerDay: unitsPerMonth / 30,
      revenue: unitsPerMonth * s.price,
      reasoning: s.reasoning,
    };
  });
}

export function recalculateScenario(
  costPerUnit: number,
  fixedCosts: number,
  targetProfit: number,
  price: number,
): PriceScenario {
  const margin = price - costPerUnit;
  const unitsPerMonth = margin > 0 ? (targetProfit + fixedCosts) / margin : 0;
  return {
    label: 'Kustom',
    price,
    margin,
    unitsPerMonth,
    unitsPerWeek: unitsPerMonth / 4.33,
    unitsPerDay: unitsPerMonth / 30,
    revenue: unitsPerMonth * price,
    reasoning: 'Skenario kustom berdasarkan harga yang Anda masukkan.',
  };
}

export function calculateRecommendedPrice(
  costPerUnit: number,
  fixedCosts: number,
  targetProfit: number,
  suggestedPriceRange: { min: number; max: number },
): number {
  if (costPerUnit <= 0) {
    return Math.round((suggestedPriceRange.min + suggestedPriceRange.max) / 2 / 500) * 500;
  }

  const suggestedMid = (suggestedPriceRange.min + suggestedPriceRange.max) / 2;
  const targetMarginPct = suggestedMid > costPerUnit ? 1 - costPerUnit / suggestedMid : 0.6;

  let price = costPerUnit / (1 - targetMarginPct);
  price = Math.max(price, suggestedPriceRange.min);

  const maxMonthlyUnits = 50 * 30;
  const minMarginForVolume = (targetProfit + fixedCosts) / maxMonthlyUnits;
  price = Math.max(price, costPerUnit + minMarginForVolume);
  price = Math.min(price, suggestedPriceRange.max * 2.5);
  price = Math.max(price, costPerUnit + 500);

  return Math.round(price / 500) * 500;
}

export function calculateRecommendedPriceRange(
  costPerUnit: number,
  fixedCosts: number,
  targetProfit: number,
  baseRange: { min: number; max: number },
): { min: number; max: number } {
  const recommended = calculateRecommendedPrice(
    costPerUnit,
    fixedCosts,
    targetProfit,
    baseRange,
  );

  if (costPerUnit <= 0) return baseRange;

  const spread = Math.max(5000, Math.round(recommended * 0.1 / 500) * 500);
  return {
    min: Math.max(costPerUnit + 500, recommended - spread),
    max: recommended + spread,
  };
}
