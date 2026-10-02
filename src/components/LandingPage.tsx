import {
  TrendingUp,
  Calculator,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  Target,
  Wallet,
  BarChart3,
  MessageSquare,
  Check,
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900/80 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              ProfitRiddle
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/ProfitRiddle.jpg')",
          }}
        />

        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Cari tahu berapa unit
              <br />
              <span className="text-emerald-400">yang harus dijual</span>
              <br />
              untuk capai target profit.
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mb-10 leading-relaxed">
              ProfitRiddle bantu Anda hitung HPP, margin, break-even, dan
              jumlah penjualan bulanan — lengkap dengan estimasi biaya dan
              rekomendasi harga dari asisten AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/30"
              >
                Mulai Hitung Profit
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
              <a
                href="#cara-kerja"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/15 transition-all"
              >
                Lihat Cara Kerja
              </a>
            </div>

            {/* Trust stats */}
            <div className="flex flex-wrap gap-x-10 gap-y-4 mt-14 pt-8 border-t border-white/10">
              <div>
                <div className="text-2xl font-bold text-white">20+</div>
                <div className="text-sm text-slate-400">Jenis usaha UMKM</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">3</div>
                <div className="text-sm text-slate-400">Skenario harga AI</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">.xlsx</div>
                <div className="text-sm text-slate-400">Export Excel siap pakai</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Banyak pelaku UMKM jualan tanpa tahu angka pasti
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            "Berapa sih saya harus jual per hari biar untung?" — pertanyaan
            yang sering tidak terjawab karena rumitnya menghitung biaya tetap,
            HPP, dan margin sekaligus.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { stat: '68%', desc: 'UMKM tidak hitung HPP secara terstruktur' },
            { stat: '3x', desc: 'Margin bisa naik 3x lipat dengan pricing tepat' },
            { stat: '50%', desc: 'Usaha gagal karena salah hitung break-even' },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 text-center"
            >
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {item.stat}
              </div>

              <div className="text-sm text-slate-600 leading-relaxed">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">
              Fitur Utama
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Semua yang Anda butuhkan untuk hitung profit
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Calculator,
                title: 'Kalkulator HPP & Margin',
                desc: 'Hitung biaya per unit, margin per unit, dan jumlah unit yang harus dijual untuk mencapai target profit bulanan.',
              },
              {
                icon: Sparkles,
                title: 'Estimasi Biaya Otomatis',
                desc: 'AI menghasilkan rincian biaya startup, operasional bulanan, dan bahan baku sesuai jenis usaha Anda — semua bisa diedit.',
              },
              {
                icon: TrendingUp,
                title: 'Skenario Harga',
                desc: 'Bandingkan 3 skenario harga (konservatif, seimbang, agresif) lengkap dengan rincian HPP bulanan, omzet, dan profit bersih.',
              },
              {
                icon: MessageSquare,
                title: 'Asisten AI Chat',
                desc: 'Tanya jawab seputar harga, margin, dan strategi. Coba simulasi "Bagaimana jika harga turun 10%?" dan AI langsung menghitung ulang.',
              },
              {
                icon: BarChart3,
                title: 'Visualisasi Target',
                desc: 'Lihat target penjualan dalam grafik harian, mingguan, dan bulanan. Tahu langsung apakah target realistis.',
              },
              {
                icon: FileSpreadsheet,
                title: 'Export ke Excel',
                desc: 'Unduh laporan lengkap 3 sheet: ringkasan bisnis, rincian biaya, dan perbandingan skenario — siap buka di Excel atau Google Sheets.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6"
              >
                <div className="mb-4">
                  <f.icon className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">
            Cara Kerja
          </p>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Empat langkah, langsung dapat angka
          </h2>
        </div>
        <div className="space-y-1">
          {[
            {
              step: '01',
              title: 'Pilih Jenis Usaha',
              desc: 'Pilih dari 20+ jenis usaha UMKM (kedai kopi, burger stall, laundry, barbershop, warung makan, dll) atau ketik usaha Anda sendiri.',
            },
            {
              step: '02',
              title: 'AI Buat Estimasi Biaya',
              desc: 'Asisten AI menghasilkan rincian biaya startup, operasional bulanan, dan bahan baku per unit. Semua bisa Anda edit, tambah, atau hapus.',
            },
            {
              step: '03',
              title: 'Atur Target Profit & Harga',
              desc: 'Masukkan target profit bulanan dan atur harga jual. Kalkulator langsung menghitung unit yang dibutuhkan per hari, minggu, dan bulan.',
            },
            {
              step: '04',
              title: 'Bandingkan, Tanya AI, & Export',
              desc: 'Lihat 3 skenario harga dengan rincian lengkap, tanya jawab dengan AI untuk simulasi, lalu export pilihan Anda ke Excel.',
            },
          ].map((s, i) => (
            <div
              key={i}
              className="flex gap-5 items-start py-5 border-b border-slate-100 last:border-0"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                {s.step}
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Example */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              Contoh Perhitungan
            </p>
            <h2 className="text-3xl font-bold text-white mb-3">
              Burger Stall — Target Rp5.000.000/bulan
            </h2>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: 'Harga jual per burger', value: 'Rp25.000', icon: Wallet },
                { label: 'HPP per burger (COGS)', value: 'Rp15.000', icon: Calculator },
                { label: 'Margin per burger', value: 'Rp10.000', icon: TrendingUp },
                { label: 'Biaya tetap bulanan', value: 'Rp0', icon: Wallet },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">{item.label}</div>
                    <div className="text-lg font-bold text-white">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-slate-700/50 rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">Per Bulan</div>
                  <div className="text-2xl font-bold text-white">500</div>
                  <div className="text-xs text-slate-400">burger</div>
                </div>
                <div className="text-center bg-slate-700/50 rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">Per Minggu</div>
                  <div className="text-2xl font-bold text-white">~125</div>
                  <div className="text-xs text-slate-400">burger</div>
                </div>
                <div className="text-center bg-emerald-600/20 rounded-xl p-4 border border-emerald-500/30">
                  <div className="text-xs text-emerald-400 mb-1">Per Hari</div>
                  <div className="text-2xl font-bold text-emerald-400">~17</div>
                  <div className="text-xs text-emerald-400/70">burger</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          {['Gratis', 'Tanpa daftar', 'Langsung pakai'].map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium"
            >
              <Check className="w-3.5 h-3.5" />
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Siap hitung profit usaha Anda?
        </h2>
        <p className="text-slate-600 text-lg mb-8">
          Pilih jenis usaha, dapatkan estimasi biaya, dan ketahui berapa unit
          yang harus dijual — dalam hitungan menit.
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
        >
          Mulai Sekarang
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Target className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <span className="font-bold text-slate-900">ProfitRiddle</span>
          </div>
          <p className="text-sm text-slate-500">
            Kalkulator profit untuk pelaku UMKM Indonesia
          </p>
        </div>
      </footer>
    </div>
  );
}
