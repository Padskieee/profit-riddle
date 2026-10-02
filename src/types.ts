export interface CostItem {
  id: string;
  item: string;
  estimatedCost: number;
}

export interface IngredientItem {
  id: string;
  item: string;
  estimatedCost: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface BusinessEstimate {
  startupCosts: CostItem[];
  monthlyFixedCosts: CostItem[];
  ingredients: IngredientItem[];
  suggestedPriceRange: PriceRange;
  mainProduct: string;
  unitLabel: string;
}

export interface PriceScenario {
  label: string;
  price: number;
  margin: number;
  unitsPerMonth: number;
  unitsPerWeek: number;
  unitsPerDay: number;
  revenue: number;
  reasoning: string;
}

export interface CalculationResult {
  costPerUnit: number;
  sellingPrice: number;
  marginPerUnit: number;
  targetProfit: number;
  monthlyFixedCosts: number;
  totalStartupCosts: number;
  unitsPerMonth: number;
  unitsPerWeek: number;
  unitsPerDay: number;
  totalRevenue: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  isRealistic: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type AppStep = 'landing' | 'business-type' | 'cost-estimate' | 'results' | 'scenarios';
