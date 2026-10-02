import type {
  BusinessEstimate,
  CalculationResult,
  PriceScenario,
} from '@/types';
import {
  businessTemplates,
  findTemplate,
  type BusinessTemplate,
} from './businessData';
import { recalculateScenario } from './calc';
import { formatRupiah, formatNumber } from './format';

export function getMarketingTips(templateKey: string): string[] {
  const template = findTemplate(templateKey);
  return template?.marketingTips ?? [
    'Promosi melalui media sosial (Instagram & TikTok)',
    'Buat program loyalitas untuk pelanggan langganan',
    'Daftar di platform delivery (GoFood, GrabFood, ShopeeFood)',
    'Promo pembukaan untuk menarik pelanggan pertama',
  ];
}

export function getMarginTips(templateKey: string): string[] {
  const template = findTemplate(templateKey);
  return template?.marginTips ?? [
    'Cari supplier yang lebih murah untuk bahan baku utama',
    'Buat paket bundling dengan produk margin tinggi',
    'Kurangi pemborosan dengan estimasi stok yang akurat',
    'Tawarkan add-on dengan margin 60%+',
  ];
}

export function getTemplateByKey(key: string): BusinessTemplate | undefined {
  return findTemplate(key);
}

export function getAllTemplates(): BusinessTemplate[] {
  return businessTemplates;
}

export function getTemplateContext(
  estimate: BusinessEstimate,
  calc: CalculationResult,
): string {
  return `Jenis usaha: ${estimate.mainProduct}
Harga jual: ${formatRupiah(calc.sellingPrice)}
HPP per unit: ${formatRupiah(calc.costPerUnit)}
Margin per unit: ${formatRupiah(calc.marginPerUnit)}
Biaya tetap bulanan: ${formatRupiah(calc.monthlyFixedCosts)}
Target profit: ${formatRupiah(calc.targetProfit)}
Unit per bulan: ${formatNumber(calc.unitsPerMonth)}
Unit per hari: ${formatNumber(calc.unitsPerDay)}`;
}

export interface ChatResult {
  text: string;
  newPrice?: number;
  newScenario?: PriceScenario;
  isFallback?: boolean;
}

export function processChat(
  message: string,
  estimate: BusinessEstimate,
  calc: CalculationResult,
  fixedCosts: number,
  costPerUnit: number,
  targetProfit: number,
): ChatResult {
  const lower = message.toLowerCase().trim();

  const priceChangeMatch = lower.match(/(?:turun|naik|naikkan|kurang|tambah|ubah)\s*(?:harga)?\s*(\d+)\s*(%|persen|ribu|rb|juta|jt)?/);
  const setPriceMatch = lower.match(/(?:harga|jual)\s*(?:jadi|di|set)?\s*(\d[\d.]*)\s*(ribu|rb|juta|jt)?/);
  const lowerPriceMatch = lower.match(/(?:turunkan|kurangi)\s*harga\s*(\d+)\s*(%|persen)/);
  const raisePriceMatch = lower.match(/(?:naikkan|tambah)\s*harga\s*(\d+)\s*(%|persen)/);

  let newPrice: number | undefined;

  if (lowerPriceMatch) {
    const pct = parseFloat(lowerPriceMatch[1]) / 100;
    newPrice = Math.round((calc.sellingPrice * (1 - pct)) / 500) * 500;
  } else if (raisePriceMatch) {
    const pct = parseFloat(raisePriceMatch[1]) / 100;
    newPrice = Math.round((calc.sellingPrice * (1 + pct)) / 500) * 500;
  } else if (priceChangeMatch) {
    const amount = parseFloat(priceChangeMatch[1]);
    const unit = priceChangeMatch[2];
    const isPercent = unit === '%' || unit === 'persen';
    const isJuta = unit === 'juta' || unit === 'jt';
    const isRibuan = unit === 'ribu' || unit === 'rb';

    if (isPercent) {
      const direction = lower.includes('turun') || lower.includes('kurang') ? -1 : 1;
      newPrice = Math.round((calc.sellingPrice * (1 + (direction * amount) / 100)) / 500) * 500;
    } else if (isJuta) {
      const direction = lower.includes('turun') || lower.includes('kurang') ? -1 : 1;
      newPrice = Math.round((calc.sellingPrice + direction * amount * 1000000) / 500) * 500;
    } else if (isRibuan) {
      const direction = lower.includes('turun') || lower.includes('kurang') ? -1 : 1;
      newPrice = Math.round((calc.sellingPrice + direction * amount * 1000) / 500) * 500;
    } else {
      const direction = lower.includes('turun') || lower.includes('kurang') ? -1 : 1;
      newPrice = Math.round((calc.sellingPrice + direction * amount) / 500) * 500;
    }
  } else if (setPriceMatch) {
    const raw = parseFloat(setPriceMatch[1].replace(/\./g, ''));
    const unit = setPriceMatch[2];
    if (unit === 'juta' || unit === 'jt') {
      newPrice = raw * 1000000;
    } else if (unit === 'ribu' || unit === 'rb') {
      newPrice = raw * 1000;
    } else {
      newPrice = raw;
    }
    newPrice = Math.round(newPrice / 500) * 500;
  }

  if (newPrice && newPrice > 0) {
    const scenario = recalculateScenario(
      costPerUnit,
      fixedCosts,
      targetProfit,
      newPrice,
    );
    const direction =
      newPrice > calc.sellingPrice ? 'menaikkan' : 'menurunkan';
    const diff = Math.abs(newPrice - calc.sellingPrice);
    const pctChange = Math.round((diff / calc.sellingPrice) * 100);

    const realisticNote =
      scenario.unitsPerDay > 200
        ? '\n\n⚠️ Jumlah unit per hari terasa sangat tinggi. Pertimbangkan untuk menaikkan harga atau menurunkan biaya agar target lebih realistis.'
        : scenario.unitsPerDay < 1
          ? '\n\n⚠️ Margin tidak cukup untuk mencapai target profit dengan harga ini.'
          : '';

    return {
      text: `Jika Anda ${direction} harga menjadi ${formatRupiah(newPrice)} (${pctChange}% dari harga saat ini):\n\n• Margin per unit: ${formatRupiah(scenario.margin)}\n• Unit per bulan: ${formatNumber(scenario.unitsPerMonth)}\n• Unit per minggu: ${formatNumber(scenario.unitsPerWeek)}\n• Unit per hari: ${formatNumber(scenario.unitsPerDay)}\n• Pendapatan bulanan: ${formatRupiah(scenario.revenue)}${realisticNote}`,
      newPrice,
      newScenario: scenario,
    };
  }

  if (lower.includes('break even') || lower.includes('titik impas') || lower.includes('impas')) {
    return {
      text: `Titik impas (break-even point) Anda:\n\n• Unit per bulan untuk impas: ${formatNumber(calc.breakEvenUnits)}\n• Pendapatan impas: ${formatRupiah(calc.breakEvenRevenue)}\n\nArtinya, Anda perlu menjual ${formatNumber(calc.breakEvenUnits)} unit hanya untuk menutup biaya tetap. Setiap unit terjual setelah itu akan langsung menjadi profit.`,
    };
  }

  if (lower.includes('margin') && (lower.includes('tingkatkan') || lower.includes('naik') || lower.includes('cara'))) {
    const tips = getMarginTips(estimate.mainProduct.toLowerCase());
    return {
      text: `Berikut cara meningkatkan margin untuk usaha ${estimate.mainProduct}:\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
    };
  }

  if (lower.includes('pasar') || lower.includes('promosi') || lower.includes('pemasaran') || lower.includes('marketing') || lower.includes('jual')) {
    const tips = getMarketingTips(estimate.mainProduct.toLowerCase());
    return {
      text: `Strategi pemasaran untuk usaha ${estimate.mainProduct}:\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
    };
  }

  if (lower.includes('realistis') || lower.includes('realistic') || lower.includes('terlalu banyak') || lower.includes('terlalu tinggi')) {
    if (calc.unitsPerDay > 100) {
      return {
        text: `Target ${formatNumber(calc.unitsPerDay)} unit per hari memang cukup tinggi. Beberapa saran:\n\n1. Naikkan harga jual untuk menurunkan jumlah unit yang dibutuhkan\n2. Cari supplier lebih murah untuk menurunkan HPP\n3. Tambah produk pelengkap dengan margin tinggi\n4. Turunkan target profit untuk fase awal, naikkan bertahap\n\nCoba gunakan skenario "Agresif" (harga lebih tinggi) untuk melihat apakah jumlah unit menjadi lebih wajar.`,
      };
    }
    return {
      text: `Target ${formatNumber(calc.unitsPerDay)} unit per hari terlihat realistis untuk usaha ${estimate.mainProduct}. Pastikan kapasitas produksi dan pasar Anda dapat menampung volume tersebut.`,
    };
  }

  if (lower.includes('biaya') || lower.includes('pengeluaran') || lower.includes('fixed') || lower.includes('operasional')) {
    return {
      text: `Rincian biaya Anda:\n\n• Biaya tetap bulanan: ${formatRupiah(calc.monthlyFixedCosts)}\n• HPP per unit: ${formatRupiah(calc.costPerUnit)}\n• Biaya startup total: ${formatRupiah(calc.totalStartupCosts)}\n\nAnda bisa mengedit setiap item biaya di halaman sebelumnya. Menurunkan biaya tetap akan langsung menurunkan jumlah unit yang perlu dijual.`,
    };
  }

  return {
    text: `Pertanyaan Anda: "${message}"\n\nSaya bisa membantu dengan:\n• Simulasi harga: "Bagaimana jika harga turun 10%?" atau "Jika harga jadi 30.000"\n• Strategi margin: "Cara meningkatkan margin"\n• Strategi pemasaran: "Saran marketing"\n• Analisis break-even: "Berapa break even point?"\n• Penilaian realistis: "Apakah target ini realistis?"\n\nCoba tanyakan salah satu di atas!`,
    isFallback: true,
  };
}

// ---------------------------------------------------------------------------
// LLM (Gemini lewat /api/chat di Vercel)
// ---------------------------------------------------------------------------

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

async function askLLM(
  message: string,
  context: string,
  history: ChatTurn[],
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context, history }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error('LLM request failed');
  const data = await res.json();
  if (!data.text) throw new Error('Empty response');
  return data.text as string;
}

export async function processChatAI(
  message: string,
  estimate: BusinessEstimate,
  calc: CalculationResult,
  fixedCosts: number,
  costPerUnit: number,
  targetProfit: number,
  history: ChatTurn[] = [],
): Promise<ChatResult> {
  const ruleResult = processChat(
    message,
    estimate,
    calc,
    fixedCosts,
    costPerUnit,
    targetProfit,
  );

  // Simulasi harga, break-even, dll. tetap dijawab aturan (angkanya akurat)
  if (!ruleResult.isFallback) return ruleResult;

  try {
    const text = await askLLM(message, getTemplateContext(estimate, calc), history);
    return { text };
  } catch {
    // API gagal / limit habis / dijalankan lewat npm run dev: pakai jawaban bawaan
    return ruleResult;
  }
}