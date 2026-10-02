import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  TrendingUp,
  DollarSign,
  Scale,
  Package,
  Percent,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import type { CalculationResult, BusinessEstimate } from '@/types';
import { formatRupiah, formatNumber, formatRupiahShort } from '@/lib/format';

interface ResultsViewProps {
  calc: CalculationResult;
  estimate: BusinessEstimate;
  onContinue: () => void;
  onBack: () => void;
}

export function ResultsView({
  calc,
  estimate,
  onContinue,
  onBack,
}: ResultsViewProps) {
  const maxDay = Math.max(calc.unitsPerDay, 50);
  const dayPct = Math.min((calc.unitsPerDay / maxDay) * 100, 100);
  const weekPct = Math.min((calc.unitsPerWeek / (maxDay * 7)) * 100, 100);
  const monthPct = Math.min((calc.unitsPerMonth / (maxDay * 30)) * 100, 100);

  const stats = [
    {
      icon: Package,
      label: 'HPP per Unit',
      value: formatRupiah(calc.costPerUnit),
      color: 'text-slate-700',
      bg: 'bg-slate-100',
    },
    {
      icon: Percent,
      label: 'Margin per Unit',
      value: formatRupiah(calc.marginPerUnit),
      color: calc.marginPerUnit > 0 ? 'text-emerald-600' : 'text-red-500',
      bg: 'bg-emerald-50',
    },
    {
      icon: DollarSign,
      label: 'Omzet Min. Bulanan',
      value: formatRupiahShort(calc.totalRevenue),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Scale,
      label: 'Titik Impas',
      value: `${formatNumber(calc.breakEvenUnits)} unit`,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Edit Biaya
        </button>

        <div className="mb-8">
          <div className="text-sm font-medium text-emerald-600 mb-2">
            Langkah 3 dari 4
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Hasil Perhitungan
          </h1>
          <p className="text-slate-600">
            Untuk mencapai profit <strong>{formatRupiah(calc.targetProfit)}</strong> per
            bulan dari usaha <strong>{estimate.mainProduct}</strong>:
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white mb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Unit yang Harus Dijual</h2>
              <p className="text-sm text-slate-400">
                Untuk mencapai target profit bulanan
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <Calendar className="w-3.5 h-3.5" />
                PER BULAN
              </div>
              <div className="text-3xl font-bold text-white">
                {formatNumber(calc.unitsPerMonth)}
              </div>
              <div className="text-sm text-slate-400 mt-1">{estimate.unitLabel}</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <Calendar className="w-3.5 h-3.5" />
                PER MINGGU
              </div>
              <div className="text-3xl font-bold text-white">
                {formatNumber(calc.unitsPerWeek)}
              </div>
              <div className="text-sm text-slate-400 mt-1">{estimate.unitLabel}</div>
            </div>
            <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 text-xs mb-2">
                <Calendar className="w-3.5 h-3.5" />
                PER HARI
              </div>
              <div className="text-3xl font-bold text-emerald-400">
                {formatNumber(calc.unitsPerDay)}
              </div>
              <div className="text-sm text-emerald-400/60 mt-1">{estimate.unitLabel}</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Per Hari</span>
                <span>{formatNumber(calc.unitsPerDay)} unit</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${dayPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Per Minggu</span>
                <span>{formatNumber(calc.unitsPerWeek)} unit</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-300 rounded-full transition-all duration-700"
                  style={{ width: `${weekPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Per Bulan</span>
                <span>{formatNumber(calc.unitsPerMonth)} unit</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-200 rounded-full transition-all duration-700"
                  style={{ width: `${monthPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {calc.unitsPerDay > 100 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>{formatNumber(calc.unitsPerDay)} unit per hari</strong> tergolong
              tinggi. Pertimbangkan menaikkan harga jual atau menurunkan biaya untuk
              menurunkan jumlah unit yang dibutuhkan. Lihat rekomendasi AI di langkah
              berikutnya.
            </div>
          </div>
        )}
        {calc.unitsPerDay > 0 && calc.unitsPerDay <= 50 && (
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-800">
              <strong>{formatNumber(calc.unitsPerDay)} unit per hari</strong> terlihat
              realistis untuk usaha {estimate.mainProduct}. Lanjut ke rekomendasi AI
              untuk melihat skenario harga alternatif.
            </div>
          </div>
        )}

        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
        >
          Lihat Rekomendasi & Skenario AI
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
