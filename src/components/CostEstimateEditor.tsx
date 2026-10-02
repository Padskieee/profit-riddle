import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  TrendingDown,
  Wallet,
  Package,
  Target,
} from 'lucide-react';
import type {
  BusinessEstimate,
  CostItem,
  IngredientItem,
} from '@/types';
import { formatRupiah, formatInputRupiah, parseRupiahInput } from '@/lib/format';
import { sumCostItems, sumIngredients, calculateRecommendedPrice, calculateRecommendedPriceRange } from '@/lib/calc';

interface CostEstimateEditorProps {
  businessType: string;
  estimate: BusinessEstimate;
  onUpdate: (estimate: BusinessEstimate) => void;
  targetProfit: number;
  onTargetProfitChange: (value: number) => void;
  sellingPrice: number;
  onSellingPriceChange: (value: number) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function CostEstimateEditor({
  businessType,
  estimate,
  onUpdate,
  targetProfit,
  onTargetProfitChange,
  sellingPrice,
  onSellingPriceChange,
  onContinue,
  onBack,
}: CostEstimateEditorProps) {
  const [activeTab, setActiveTab] = useState<
    'startup' | 'monthly' | 'ingredients'
  >('startup');
  const prevCostsKey = useRef('');

  const totalIngredient = sumIngredients(estimate.ingredients);
  const totalMonthly = sumCostItems(estimate.monthlyFixedCosts);
  const totalStartup = sumCostItems(estimate.startupCosts);

  const dynamicRange = calculateRecommendedPriceRange(
    totalIngredient,
    totalMonthly,
    targetProfit,
    estimate.suggestedPriceRange,
  );

  const costsKey = `${totalIngredient}|${totalMonthly}|${targetProfit}`;

  useEffect(() => {
    if (prevCostsKey.current === costsKey) return;
    prevCostsKey.current = costsKey;

    const recommended = calculateRecommendedPrice(
      totalIngredient,
      totalMonthly,
      targetProfit,
      estimate.suggestedPriceRange,
    );
    onSellingPriceChange(recommended);
  }, [costsKey, totalIngredient, totalMonthly, targetProfit, estimate.suggestedPriceRange, onSellingPriceChange]);

  const genId = () => Math.random().toString(36).substring(2, 11);

  const updateStartupCost = (id: string, field: 'item' | 'estimatedCost', value: string) => {
    onUpdate({
      ...estimate,
      startupCosts: estimate.startupCosts.map((c) =>
        c.id === id
          ? { ...c, [field]: field === 'estimatedCost' ? parseRupiahInput(value) : value }
          : c,
      ),
    });
  };

  const updateMonthlyCost = (id: string, field: 'item' | 'estimatedCost', value: string) => {
    onUpdate({
      ...estimate,
      monthlyFixedCosts: estimate.monthlyFixedCosts.map((c) =>
        c.id === id
          ? { ...c, [field]: field === 'estimatedCost' ? parseRupiahInput(value) : value }
          : c,
      ),
    });
  };

  const updateIngredient = (id: string, field: 'item' | 'estimatedCost', value: string) => {
    onUpdate({
      ...estimate,
      ingredients: estimate.ingredients.map((c) =>
        c.id === id
          ? { ...c, [field]: field === 'estimatedCost' ? parseRupiahInput(value) : value }
          : c,
      ),
    });
  };

  const addStartupCost = () => {
    onUpdate({
      ...estimate,
      startupCosts: [...estimate.startupCosts, { id: genId(), item: '', estimatedCost: 0 }],
    });
  };

  const addMonthlyCost = () => {
    onUpdate({
      ...estimate,
      monthlyFixedCosts: [...estimate.monthlyFixedCosts, { id: genId(), item: '', estimatedCost: 0 }],
    });
  };

  const addIngredient = () => {
    onUpdate({
      ...estimate,
      ingredients: [...estimate.ingredients, { id: genId(), item: '', estimatedCost: 0 }],
    });
  };

  const removeStartupCost = (id: string) => {
    onUpdate({
      ...estimate,
      startupCosts: estimate.startupCosts.filter((c) => c.id !== id),
    });
  };

  const removeMonthlyCost = (id: string) => {
    onUpdate({
      ...estimate,
      monthlyFixedCosts: estimate.monthlyFixedCosts.filter((c) => c.id !== id),
    });
  };

  const removeIngredient = (id: string) => {
    onUpdate({
      ...estimate,
      ingredients: estimate.ingredients.filter((c) => c.id !== id),
    });
  };

  const margin = sellingPrice - totalIngredient;

  const tabs = [
    { key: 'startup' as const, label: 'Biaya Startup', icon: Wallet, total: totalStartup },
    { key: 'monthly' as const, label: 'Biaya Bulanan', icon: TrendingDown, total: totalMonthly },
    { key: 'ingredients' as const, label: 'Bahan per Unit', icon: Package, total: totalIngredient },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="mb-8">
          <div className="text-sm font-medium text-emerald-600 mb-2">
            Langkah 2 dari 4
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Estimasi Biaya Usaha
          </h1>
          <div className="flex items-center gap-2 text-slate-600">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <p className="text-sm">
              AI menghasilkan estimasi untuk usaha <strong>{businessType}</strong>.
              Edit, tambah, atau hapus item sesuai kondisi Anda.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span
                className={`ml-1 px-2 py-0.5 rounded-md text-xs ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {formatRupiah(tab.total)}
              </span>
            </button>
          ))}
        </div>

        {/* Startup costs tab */}
        {activeTab === 'startup' && (
          <CostTable
            title="Biaya Startup / Persiapan"
            items={estimate.startupCosts}
            onUpdate={updateStartupCost}
            onAdd={addStartupCost}
            onRemove={removeStartupCost}
            total={totalStartup}
          />
        )}

        {/* Monthly fixed costs tab */}
        {activeTab === 'monthly' && (
          <CostTable
            title="Biaya Tetap Bulanan"
            items={estimate.monthlyFixedCosts}
            onUpdate={updateMonthlyCost}
            onAdd={addMonthlyCost}
            onRemove={removeMonthlyCost}
            total={totalMonthly}
          />
        )}

        {/* Ingredients tab */}
        {activeTab === 'ingredients' && (
          <CostTable
            title="Biaya Bahan / Material per Unit"
            items={estimate.ingredients}
            onUpdate={updateIngredient}
            onAdd={addIngredient}
            onRemove={removeIngredient}
            total={totalIngredient}
            isIngredient
          />
        )}

        {/* Price & target section */}
        <div className="grid md:grid-cols-2 gap-5 mt-8">
          <div className="p-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Target Profit Bulanan</h3>
                <p className="text-xs text-slate-500">Berapa profit yang Anda inginkan per bulan</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formatInputRupiah(targetProfit)}
                onChange={(e) => onTargetProfitChange(parseRupiahInput(e.target.value))}
                placeholder="5.000.000"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Harga Jual per Unit</h3>
                <p className="text-xs text-slate-500">
                  Rekomendasi AI: {formatRupiah(dynamicRange.min)} –{' '}
                  {formatRupiah(dynamicRange.max)}
                </p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formatInputRupiah(sellingPrice)}
                onChange={(e) => onSellingPriceChange(parseRupiahInput(e.target.value))}
                placeholder="25.000"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Quick summary */}
        <div className="mt-6 bg-slate-900 rounded-2xl p-6 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">HPP per Unit</div>
              <div className="text-lg font-bold">{formatRupiah(totalIngredient)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Margin per Unit</div>
              <div className={`text-lg font-bold ${margin > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatRupiah(margin)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Biaya Tetap/Bulan</div>
              <div className="text-lg font-bold">{formatRupiah(totalMonthly)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Total Startup</div>
              <div className="text-lg font-bold">{formatRupiah(totalStartup)}</div>
            </div>
          </div>
        </div>

        {/* Continue */}
        <button
          onClick={onContinue}
          disabled={margin <= 0 || targetProfit <= 0}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Lihat Hasil Perhitungan
          <ArrowRight className="w-5 h-5" />
        </button>
        {margin <= 0 && (
          <p className="mt-3 text-sm text-red-500">
            Harga jual harus lebih besar dari biaya bahan per unit agar ada margin.
          </p>
        )}
      </div>
    </div>
  );
}

interface CostTableProps {
  title: string;
  items: CostItem[] | IngredientItem[];
  onUpdate: (id: string, field: 'item' | 'estimatedCost', value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  total: number;
  isIngredient?: boolean;
}

function CostTable({
  title,
  items,
  onUpdate,
  onAdd,
  onRemove,
  total,
  isIngredient,
}: CostTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>
      <div className="divide-y divide-slate-50">
        {items.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            Belum ada item. Klik "Tambah" untuk menambahkan.
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-slate-50/50 transition-colors">
            <input
              type="text"
              value={item.item}
              onChange={(e) => onUpdate(item.id, 'item', e.target.value)}
              placeholder="Nama item..."
              className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <div className="relative w-40 sm:w-48 flex-shrink-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formatInputRupiah(item.estimatedCost)}
                onChange={(e) => onUpdate(item.id, 'estimatedCost', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm font-medium text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between p-5 bg-slate-50 border-t border-slate-100">
        <span className="text-sm font-medium text-slate-600">
          {isIngredient ? 'Total HPP per Unit' : 'Total'}
        </span>
        <span className="text-lg font-bold text-slate-900">{formatRupiah(total)}</span>
      </div>
    </div>
  );
}
