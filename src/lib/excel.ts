import * as XLSX from 'xlsx';
import type {
  BusinessEstimate,
  CalculationResult,
  PriceScenario,
  CostItem,
  IngredientItem,
} from '@/types';
import { formatRupiah, formatNumber } from './format';

export function exportToExcel(
  businessType: string,
  estimate: BusinessEstimate,
  calc: CalculationResult,
  scenarios: PriceScenario[],
  selectedScenario: PriceScenario,
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Business Summary
  const summaryData: (string | number)[][] = [
    ['RINGKASAN BISNIS'],
    [''],
    ['Jenis Usaha', businessType],
    ['Produk Utama', estimate.mainProduct],
    ['Satuan', estimate.unitLabel],
    [''],
    ['Target Profit Bulanan', formatRupiah(calc.targetProfit)],
    ['Harga Jual per Unit', formatRupiah(selectedScenario.price)],
    ['HPP per Unit', formatRupiah(calc.costPerUnit)],
    ['Margin per Unit', formatRupiah(selectedScenario.margin)],
    [''],
    ['Unit per Bulan', formatNumber(selectedScenario.unitsPerMonth)],
    ['Unit per Minggu', formatNumber(selectedScenario.unitsPerWeek)],
    ['Unit per Hari', formatNumber(selectedScenario.unitsPerDay)],
    [''],
    ['Total Omzet Minimum Bulanan', formatRupiah(selectedScenario.revenue)],
    ['Biaya Tetap Bulanan', formatRupiah(calc.monthlyFixedCosts)],
    ['Titik Impas (unit)', formatNumber(calc.breakEvenUnits)],
    ['Titik Impas (pendapatan)', formatRupiah(calc.breakEvenRevenue)],
    [''],
    ['Total Biaya Startup', formatRupiah(calc.totalStartupCosts)],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1['!cols'] = [{ wch: 28 }, { wch: 25 }];
  ws1['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan Bisnis');

  // Sheet 2: Full Cost Breakdown
  const costData: (string | number)[][] = [
    ['RINCIAN BIAYA'],
    [''],
    ['BIAYA STARTUP / PERSIAPAN'],
    ['Item', 'Estimasi Biaya (Rp)'],
    ...estimate.startupCosts.map((c: CostItem) => [c.item, c.estimatedCost]),
    ['TOTAL STARTUP', calc.totalStartupCosts],
    [''],
    ['BIAYA TETAP BULANAN'],
    ['Item', 'Estimasi Biaya (Rp)'],
    ...estimate.monthlyFixedCosts.map((c: CostItem) => [c.item, c.estimatedCost]),
    ['TOTAL BULANAN', calc.monthlyFixedCosts],
    [''],
    ['BIAYA BAHAN / INGREDIENT PER UNIT'],
    ['Item', 'Estimasi Biaya (Rp)'],
    ...estimate.ingredients.map((c: IngredientItem) => [c.item, c.estimatedCost]),
    ['TOTAL HPP PER UNIT', calc.costPerUnit],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(costData);
  ws2['!cols'] = [{ wch: 35 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Rincian Biaya');

  // Sheet 3: Scenario Comparison
  const scenarioData: (string | number)[][] = [
    ['PERBANDINGAN SKENARIO HARGA'],
    [''],
    ['Skenario', 'Harga Jual (Rp)', 'Margin (Rp)', 'Unit/Bulan', 'Unit/Minggu', 'Unit/Hari', 'Pendapatan (Rp)', 'Alasan'],
  ];
  scenarios.forEach((s: PriceScenario) => {
    scenarioData.push([
      s.label,
      s.price,
      s.margin,
      formatNumber(s.unitsPerMonth),
      formatNumber(s.unitsPerWeek),
      formatNumber(s.unitsPerDay),
      s.revenue,
      s.reasoning,
    ]);
  });
  scenarioData.push(['']);
  scenarioData.push(['SKENARIO DIPILIH']);
  scenarioData.push([
    selectedScenario.label,
    selectedScenario.price,
    selectedScenario.margin,
    formatNumber(selectedScenario.unitsPerMonth),
    formatNumber(selectedScenario.unitsPerWeek),
    formatNumber(selectedScenario.unitsPerDay),
    selectedScenario.revenue,
    selectedScenario.reasoning,
  ]);
  const ws3 = XLSX.utils.aoa_to_sheet(scenarioData);
  ws3['!cols'] = [
    { wch: 15 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 20 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Perbandingan Skenario');

  const fileName = `ProfitRiddle_${businessType.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
