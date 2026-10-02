import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Send,
  TrendingUp,
  Lightbulb,
  Megaphone,
  FileSpreadsheet,
  Check,
  Calculator,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  BusinessEstimate,
  CalculationResult,
  PriceScenario,
  ChatMessage,
} from '@/types';
import { formatRupiah, formatNumber, formatRupiahShort } from '@/lib/format';
import {
  generateScenarios,
  recalculateScenario,
  sumCostItems,
  sumIngredients,
} from '@/lib/calc';
import { getMarketingTips, getMarginTips, processChatAI } from '@/lib/ai';
import { exportToExcel } from '@/lib/excel';

const MAX_USER_MESSAGES = 20;

interface ScenarioViewProps {
  businessType: string;
  estimate: BusinessEstimate;
  calc: CalculationResult;
  onBack: () => void;
  onSellingPriceChange: (price: number) => void;
}

export function ScenarioView({
  businessType,
  estimate,
  calc,
  onBack,
  onSellingPriceChange,
}: ScenarioViewProps) {
  const [scenarios, setScenarios] = useState<PriceScenario[]>(() =>
    generateScenarios(
      calc.costPerUnit,
      calc.monthlyFixedCosts,
      calc.targetProfit,
      estimate.suggestedPriceRange,
    ),
  );
  const [selectedLabel, setSelectedLabel] = useState<string>(
    scenarios.find((s) => Math.abs(s.price - calc.sellingPrice) ===
      Math.min(...scenarios.map((s) => Math.abs(s.price - calc.sellingPrice)))
    )?.label ?? 'Seimbang',
  );
  const [customPrice, setCustomPrice] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Halo! Saya asisten AI untuk usaha ${estimate.mainProduct} Anda.\n\nAnda bisa tanya saya hal-hal seperti:\n• "Bagaimana jika harga turun 10%?"\n• "Cara meningkatkan margin?"\n• "Saran marketing untuk usaha ini?"\n• "Berapa break even point?"\n\nSilakan tanya apa saja!`,
      timestamp: Date.now(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTips, setShowTips] = useState<'margin' | 'marketing' | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fixedCosts = sumCostItems(estimate.monthlyFixedCosts);
  const costPerUnit = sumIngredients(estimate.ingredients);

  useEffect(() => {
    setScenarios(
      generateScenarios(
        costPerUnit,
        fixedCosts,
        calc.targetProfit,
        estimate.suggestedPriceRange,
      ),
    );
  }, [costPerUnit, fixedCosts, calc.targetProfit, estimate.suggestedPriceRange]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  const selectedScenario =
    scenarios.find((s) => s.label === selectedLabel) ?? scenarios[0];

  const handleSelectScenario = (label: string) => {
    setSelectedLabel(label);
    const scenario = scenarios.find((s) => s.label === label);
    if (scenario) {
      onSellingPriceChange(scenario.price);
    }
  };

  const handleApplyCustomPrice = () => {
    const price = parseInt(customPrice.replace(/\D/g, ''), 10);
    if (price > 0) {
      const customScenario = recalculateScenario(
        costPerUnit,
        fixedCosts,
        calc.targetProfit,
        price,
      );
      const newScenarios = [
        ...scenarios.filter((s) => s.label !== 'Kustom'),
        { ...customScenario, label: 'Kustom' },
      ];
      setScenarios(newScenarios);
      setSelectedLabel('Kustom');
      onSellingPriceChange(price);
      setCustomPrice('');
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userCount = chatMessages.filter((m) => m.role === 'user').length;
    if (userCount >= MAX_USER_MESSAGES) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Batas pesan untuk sesi ini sudah tercapai. Muat ulang halaman untuk memulai sesi baru.',
          timestamp: Date.now(),
        },
      ]);
      setChatInput('');
      return;
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };
    const history = chatMessages.slice(1).map((m) => ({
      role: m.role,
      text: m.content,
    }));

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);

    try {
      const result = await processChatAI(
        trimmed,
        estimate,
        calc,
        fixedCosts,
        costPerUnit,
        calc.targetProfit,
        history,
      );

      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.text, timestamp: Date.now() },
      ]);

      if (result.newPrice && result.newScenario) {
        const customScenario = { ...result.newScenario, label: 'Kustom' };
        setScenarios((prev) => [
          ...prev.filter((s) => s.label !== 'Kustom'),
          customScenario,
        ]);
        setSelectedLabel('Kustom');
        onSellingPriceChange(result.newPrice);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    exportToExcel(businessType, estimate, calc, scenarios, selectedScenario);
  };

  const marginTips = getMarginTips(businessType.toLowerCase());
  const marketingTips = getMarketingTips(businessType.toLowerCase());

  const quickQuestions = [
    'Bagaimana jika harga turun 10%?',
    'Cara meningkatkan margin?',
    'Saran marketing?',
    'Berapa break even point?',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Hasil
        </button>

        <div className="mb-8">
          <div className="text-sm font-medium text-emerald-600 mb-2">
            Langkah 4 dari 4
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Rekomendasi & Skenario AI
          </h1>
          <p className="text-slate-600">
            Bandingkan skenario harga, tanya jawab dengan AI, lalu pilih dan
            export skenario terbaik Anda.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Skenario Harga
              </h2>
              <div className="space-y-3">
                {scenarios
                  .filter((s) => s.label !== 'Kustom')
                  .map((scenario) => (
                    <ScenarioCard
                      key={scenario.label}
                      scenario={scenario}
                      isSelected={selectedLabel === scenario.label}
                      unitLabel={estimate.unitLabel}
                      costPerUnit={costPerUnit}
                      fixedCosts={fixedCosts}
                      targetProfit={calc.targetProfit}
                      isExpanded={expandedScenario === scenario.label}
                      onToggleDetails={() => setExpandedScenario(expandedScenario === scenario.label ? null : scenario.label)}
                      onSelect={() => handleSelectScenario(scenario.label)}
                    />
                  ))}
                {scenarios.find((s) => s.label === 'Kustom') && (
                  <ScenarioCard
                    scenario={scenarios.find((s) => s.label === 'Kustom')!}
                    isSelected={selectedLabel === 'Kustom'}
                    unitLabel={estimate.unitLabel}
                    costPerUnit={costPerUnit}
                    fixedCosts={fixedCosts}
                    targetProfit={calc.targetProfit}
                    isExpanded={expandedScenario === 'Kustom'}
                    onToggleDetails={() => setExpandedScenario(expandedScenario === 'Kustom' ? null : 'Kustom')}
                    onSelect={() => handleSelectScenario('Kustom')}
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">
                Coba Harga Sendiri
              </h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customPrice}
                    onChange={(e) =>
                      setCustomPrice(
                        e.target.value.replace(/\D/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'),
                      )
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomPrice()}
                    placeholder="Contoh: 28.000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleApplyCustomPrice}
                  disabled={!customPrice}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Hitung
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => setShowTips(showTips === 'margin' ? null : 'margin')}
                className="text-left bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Lightbulb className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Tips Tingkatkan Margin
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  {showTips === 'margin' ? 'Sembunyikan' : 'Lihat saran AI'}
                </p>
              </button>
              <button
                onClick={() => setShowTips(showTips === 'marketing' ? null : 'marketing')}
                className="text-left bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Megaphone className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Strategi Pemasaran
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  {showTips === 'marketing' ? 'Sembunyikan' : 'Lihat saran AI'}
                </p>
              </button>
            </div>

            {showTips === 'margin' && (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-3 text-sm">
                  Tips Meningkatkan Margin
                </h3>
                <ul className="space-y-2">
                  {marginTips.map((tip, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-amber-800">
                      <span className="font-bold text-amber-600 flex-shrink-0">
                        {i + 1}.
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showTips === 'marketing' && (
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3 text-sm">
                  Strategi Pemasaran untuk {estimate.mainProduct}
                </h3>
                <ul className="space-y-2">
                  {marketingTips.map((tip, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-blue-800">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        {i + 1}.
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-600/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Export Skenario Terpilih
                  </h3>
                  <p className="text-emerald-100 text-sm">
                    Unduh laporan lengkap dalam format Excel (.xlsx) — siap buka
                    di Excel atau Google Sheets.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-emerald-100">
                    <Calculator className="w-4 h-4" />
                    Skenario: <strong className="text-white">{selectedScenario.label}</strong>
                    {' — '}
                    {formatRupiah(selectedScenario.price)} / {estimate.unitLabel}
                  </div>
                </div>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all shadow-md flex-shrink-0"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Export ke Excel
                </button>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Mulai dari awal
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px] sticky top-6">
              {/* Chat header */}
              <div className="flex items-center gap-2 p-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Asisten AI
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tanya seputar harga, margin, strategi
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-md'
                          : 'bg-slate-100 text-slate-800 rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-slate-100 text-slate-500 text-sm">
                      Mengetik...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {chatMessages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors disabled:opacity-40"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(chatInput)}
                    placeholder="Ketik pertanyaan..."
                    maxLength={500}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => sendMessage(chatInput)}
                    disabled={!chatInput.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ScenarioCardProps {
  scenario: PriceScenario;
  isSelected: boolean;
  unitLabel: string;
  costPerUnit: number;
  fixedCosts: number;
  targetProfit: number;
  isExpanded: boolean;
  onToggleDetails: () => void;
  onSelect: () => void;
}

function ScenarioCard({
  scenario,
  isSelected,
  unitLabel,
  costPerUnit,
  fixedCosts,
  targetProfit,
  isExpanded,
  onToggleDetails,
  onSelect,
}: ScenarioCardProps) {
  const isAggressive = scenario.label === 'Agresif';
  const isConservative = scenario.label === 'Konservatif';
  const isBalanced = scenario.label === 'Seimbang';
  const isCustom = scenario.label === 'Kustom';
  const monthlyHpp = Math.ceil(scenario.unitsPerMonth) * costPerUnit;
  const totalMonthlyCosts = monthlyHpp + fixedCosts;
  const netProfit = scenario.revenue - totalMonthlyCosts;
  const marginPercentage = scenario.price > 0 ? (scenario.margin / scenario.price) * 100 : 0;
  const breakEvenUnits = scenario.margin > 0 ? fixedCosts / scenario.margin : 0;

  const accentColor = isAggressive
    ? 'border-red-300 bg-red-50/50'
    : isConservative
      ? 'border-blue-300 bg-blue-50/50'
      : isBalanced
        ? 'border-emerald-300 bg-emerald-50/50'
        : 'border-slate-300 bg-slate-50/50';

  return (
    <div
      className={`w-full text-left rounded-2xl border-2 transition-all ${
        isSelected
          ? `${accentColor} shadow-md ring-2 ring-emerald-500/20`
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <button onClick={onSelect} className="w-full text-left p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900">{scenario.label}</h3>
          {isSelected && (
            <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900">
            {formatRupiah(scenario.price)}
          </div>
          <div className="text-xs text-slate-500">per {unitLabel}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center bg-white/60 rounded-lg py-2 px-1">
          <div className="text-xs text-slate-500">Per Bulan</div>
          <div className="text-sm font-bold text-slate-900">
            {formatNumber(scenario.unitsPerMonth)}
          </div>
        </div>
        <div className="text-center bg-white/60 rounded-lg py-2 px-1">
          <div className="text-xs text-slate-500">Per Minggu</div>
          <div className="text-sm font-bold text-slate-900">
            {formatNumber(scenario.unitsPerWeek)}
          </div>
        </div>
        <div className="text-center bg-white/60 rounded-lg py-2 px-1">
          <div className="text-xs text-slate-500">Per Hari</div>
          <div className="text-sm font-bold text-slate-900">
            {formatNumber(scenario.unitsPerDay)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-500">Margin: {formatRupiah(scenario.margin)}</span>
        <span className="text-slate-500">
          Omzet min.: {formatRupiahShort(scenario.revenue)}
        </span>
      </div>

      {!isCustom && (
        <p className="text-xs text-slate-500 leading-relaxed">
          {scenario.reasoning}
        </p>
      )}
      </button>

      <div className="px-5 pb-4">
        <button
          type="button"
          onClick={onToggleDetails}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {isExpanded ? 'Sembunyikan rincian' : 'Lihat rincian perhitungan'}
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <DetailRow label={`HPP ${formatNumber(scenario.unitsPerMonth)} ${unitLabel}/bulan`} value={formatRupiah(monthlyHpp)} />
              <DetailRow label="Biaya tetap bulanan" value={formatRupiah(fixedCosts)} />
              <DetailRow label="Total biaya bulanan" value={formatRupiah(totalMonthlyCosts)} />
              <DetailRow label="Omzet minimum bulanan" value={formatRupiah(scenario.revenue)} />
              <DetailRow label="Profit bersih" value={formatRupiah(netProfit)} valueClass="text-emerald-700" />
              <DetailRow label="Margin efektif" value={`${marginPercentage.toFixed(1)}%`} />
            </div>
            <div className="rounded-xl bg-white/70 border border-slate-200 p-3 text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Cara baca:</strong> {formatNumber(scenario.unitsPerMonth)} unit × {formatRupiah(costPerUnit)} HPP = {formatRupiah(monthlyHpp)} HPP bulanan. Ditambah biaya tetap {formatRupiah(fixedCosts)}, lalu dikurangi dari omzet {formatRupiah(scenario.revenue)} untuk menghasilkan profit bersih sekitar {formatRupiah(netProfit)}.
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              <span>Break-even: <strong className="text-slate-700">{formatNumber(breakEvenUnits)} {unitLabel}</strong></span>
              <span>Target profit: <strong className="text-slate-700">{formatRupiah(targetProfit)}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  valueClass?: string;
}

function DetailRow({ label, value, valueClass = 'text-slate-800' }: DetailRowProps) {
  return (
    <div className="rounded-lg bg-white/60 border border-slate-200/70 p-2.5">
      <div className="text-slate-500 mb-1">{label}</div>
      <div className={`font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}