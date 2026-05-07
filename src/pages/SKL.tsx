import React from 'react';
import { ScrollText, CheckCircle2, CloudDownload, HelpCircle } from 'lucide-react';

export default function SKL() {
  const isEligible = true;

  return (
    <div className="space-y-6 max-w-4xl">
       <div>
          <h2 className="text-xl font-bold text-brand-text-main tracking-tight uppercase"><span className="text-brand-accent italic">SKL</span> & KELULUSAN</h2>
          <p className="text-[10px] text-brand-text-muted font-bold tracking-widest mt-1 uppercase italic">Surat Keterangan Lulus Elektronik</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Document Status */}
           <div className="md:col-span-2 bg-white rounded-xl border border-brand-border p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-2 relative">
                 <ScrollText className="w-10 h-10" />
                 <CheckCircle2 className="w-6 h-6 absolute -right-1 bottom-0 bg-white rounded-full p-0.5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-brand-text-main uppercase italic">Selamat! Anda Dinyatakan LULUS</h3>
                <p className="text-[11px] text-slate-500 italic max-w-xs mx-auto mt-2 leading-relaxed">Berdasarkan hasil evaluasi akhir dan sidang pleno pendidik PKBM Armilla Nusa Tahun 2025/2026.</p>
              </div>
              <div className="pt-6 w-full max-w-xs">
                 <button className="w-full flex items-center justify-center gap-2 bg-brand-accent text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:scale-[1.02] transition-all">
                    <CloudDownload className="w-4 h-4" /> Unduh SKL Digital
                 </button>
                 <p className="text-[9px] text-slate-400 mt-4 italic">*Ijazah asli dapat diambil di sekretariat setelah pemberitahuan selanjutnya.</p>
              </div>
           </div>

           {/* Checklist */}
           <div className="bg-slate-50 border border-brand-border rounded-xl p-6 space-y-6">
              <h4 className="text-[11px] font-bold text-brand-text-main uppercase tracking-widest pb-3 border-b border-brand-border italic">Persyaratan</h4>
              
              <div className="space-y-4">
                {[
                  { label: 'Ujian Akhir', status: 'Passed' },
                  { label: 'Nilai Rapor', status: 'Complete' },
                  { label: 'Adminstrasi', status: 'Settled' },
                  { label: 'Ujian Praktek', status: 'Passed' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 rounded italic group-hover:scale-110 transition-transform">✓ OK</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-auto">
                 <div className="p-4 bg-brand-sidebar rounded-lg text-white">
                    <div className="flex gap-2 items-center mb-2">
                       <HelpCircle className="w-3.5 h-3.5 text-brand-accent" />
                       <span className="text-[9px] font-bold uppercase italic tracking-widest">Perlu Bantuan?</span>
                    </div>
                    <p className="text-[9px] text-slate-400 italic">Hubungi tim kurikulum jika terdapat ketidaksesuaian data pada SKL Anda.</p>
                 </div>
              </div>
           </div>
        </div>
    </div>
  );
}
