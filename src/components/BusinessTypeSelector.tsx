import { useState } from 'react';
import { ArrowLeft, ArrowRight, Search, Check } from 'lucide-react';
import { businessTemplates } from '@/lib/businessData';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface BusinessTypeSelectorProps {
  onSelect: (key: string, customLabel?: string) => void;
  onBack: () => void;
}

export function BusinessTypeSelector({
  onSelect,
  onBack,
}: BusinessTypeSelectorProps) {
  const [search, setSearch] = useState('');
  const [customType, setCustomType] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const filtered = businessTemplates.filter(
    (t) =>
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleContinue = () => {
    if (selectedKey) {
      onSelect(selectedKey);
    } else if (customType.trim()) {
      onSelect('custom', customType.trim());
    }
  };

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

        <div className="mb-10">
          <div className="text-sm font-medium text-emerald-600 mb-2">
            Langkah 1 dari 4
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Pilih Jenis Usaha Anda
          </h1>
          <p className="text-slate-600">
            Pilih jenis usaha agar AI dapat memberikan estimasi biaya yang
            relevan. Atau ketik usaha Anda sendiri.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jenis usaha..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Grid of business types */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filtered.map((template) => {
            const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[template.icon] ?? LucideIcons.Store;
            const isSelected = selectedKey === template.key;
            return (
              <button
                key={template.key}
                onClick={() => {
                  setSelectedKey(template.key);
                  setCustomType('');
                }}
                className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-emerald-600' : 'bg-slate-100'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected ? 'text-white' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  {template.label}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {template.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Custom business type */}
        <div className="border-t border-slate-100 pt-6 mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Atau ketik jenis usaha Anda sendiri
          </label>
          <input
            type="text"
            value={customType}
            onChange={(e) => {
              setCustomType(e.target.value);
              setSelectedKey(null);
            }}
            placeholder="Contoh: jualan sepatu, catering, jasa cetak..."
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!selectedKey && !customType.trim()}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Lanjut ke Estimasi Biaya
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}