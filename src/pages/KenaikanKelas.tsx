import React, { useState } from 'react';
import { 
  ArrowUpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  ChevronRight,
  ShieldAlert,
  RotateCcw,
  GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function KenaikanKelas() {
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [loadingStep2, setLoadingStep2] = useState(false);

  const classes = [
    { name: 'Kelas 10 - Paket C', target: 'Kelas 11 - Paket C' },
    { name: 'Kelas 11 - Paket C', target: 'Kelas 12 - Paket C' },
    { name: 'Kelas 12 - Paket C', target: 'Alumni' },
    { name: 'Kelas 7 - Paket B', target: 'Kelas 8 - Paket B' },
    { name: 'Kelas 8 - Paket B', target: 'Kelas 9 - Paket B' },
    { name: 'Kelas 9 - Paket B', target: 'Alumni' },
  ];

  const handleNextStep1 = () => {
    const found = classes.find(c => c.name === selectedClass);
    if (found) {
      setTargetClass(found.target);
      setStep(2);
      setLoadingStep2(true);
      setTimeout(() => setLoadingStep2(false), 1500);
    }
  };

  const handleProcess = () => {
    setStep(3);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-end border-b border-brand-border pb-6">
        <div>
          <h2 className="text-xl font-bold text-brand-text-main tracking-tight uppercase italic">KENAIKAN <span className="text-brand-accent">KELAS MASSAL</span></h2>
          <p className="text-[10px] text-brand-text-muted font-bold tracking-widest uppercase opacity-70">Otomasi Transisi Tingkat Siswa</p>
        </div>
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black italic",
                step >= i ? "bg-brand-accent text-white" : "bg-slate-100 text-slate-400"
              )}>{i}</div>
              {i < 3 && <div className="w-4 h-[1px] bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-sm">
        {step === 1 && (
          <div className="p-10 space-y-8">
            <div className="text-center max-w-md mx-auto">
               <div className="w-16 h-16 bg-slate-50 border border-brand-border rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Users className="w-8 h-8 text-brand-sidebar" />
               </div>
               <h3 className="font-bold text-lg text-brand-text-main uppercase italic mb-2 tracking-tighter">Pilih Kelas Asal</h3>
               <p className="text-[11px] text-slate-500 italic">Pilih kelas yang siswanya akan Anda naikkan tingkat secara bersamaan.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {classes.map((c) => (
                 <button 
                  key={c.name}
                  onClick={() => setSelectedClass(c.name)}
                  className={cn(
                    "p-6 rounded-2xl border transition-all text-left group relative overflow-hidden",
                    selectedClass === c.name ? "border-brand-accent bg-brand-bg ring-2 ring-brand-accent/10" : "border-brand-border hover:border-brand-accent shadow-sm"
                  )}
                 >
                    <h4 className="font-bold text-sm text-brand-text-main group-hover:text-brand-accent transition-colors uppercase italic">{c.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest italic">{c.name.includes('12') || c.name.includes('9') ? 'TRANSISI KELULUSAN' : 'TRANSISI TINGKAT'}</p>
                    {selectedClass === c.name && (
                      <div className="absolute -right-2 -bottom-2 opacity-10">
                        <ArrowUpCircle className="w-12 h-12 text-brand-accent" />
                      </div>
                    )}
                 </button>
               ))}
            </div>

            <div className="pt-8 border-t border-brand-border flex justify-end">
              <button 
                disabled={!selectedClass}
                onClick={handleNextStep1}
                className="bg-brand-sidebar text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.2em] disabled:opacity-30 flex items-center gap-3 group"
              >
                Tahap Selanjutnya <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 space-y-8">
             <div className="flex items-start gap-6 bg-yellow-50 border border-yellow-100 p-6 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-yellow-900 uppercase italic mb-1">Verifikasi Target Transisi</h4>
                  <p className="text-[11px] text-yellow-700 italic leading-relaxed">
                    Siswa dari <span className="font-bold">{selectedClass}</span> akan dipindahkan ke <span className="font-bold text-brand-accent">{targetClass}</span>. 
                    {targetClass === 'Alumni' ? ' Data siswa akan dipindahkan ke tab Alumni dan kehilangan status aktif.' : ' Seluruh data akademik akan diteruskan ke tingkat baru.'}
                  </p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                   <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[11px] font-bold text-brand-text-main uppercase italic">Validasi Nilai Akhir</span>
                   </div>
                   <span className="text-[10px] font-bold text-emerald-600 uppercase">Siap</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                   <div className="flex items-center gap-3">
                      {loadingStep2 ? (
                        <div className="w-4 h-4 rounded-full border-2 border-brand-accent border-t-transparent animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      <span className="text-[11px] font-bold text-brand-text-main uppercase italic">Pengecekan Kelengkapan Berkas</span>
                   </div>
                   <span className={cn("text-[10px] font-bold uppercase", loadingStep2 ? "text-brand-accent" : "text-emerald-600")}>
                     {loadingStep2 ? 'Memuat...' : 'Siap'}
                   </span>
                </div>
             </div>

             <div className="pt-8 border-t border-brand-border flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="text-slate-400 px-6 py-3 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:text-brand-sidebar transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Kembali
              </button>
              <button 
                disabled={loadingStep2}
                onClick={handleProcess}
                className="bg-brand-accent text-white px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-accent/20 flex items-center gap-3 hover:scale-105 transition-all disabled:opacity-50"
              >
                <ArrowUpCircle className="w-4 h-4" /> Proses Sekarang
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-16 text-center space-y-6">
             <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                {targetClass === 'Alumni' ? <GraduationCap className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />}
                <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-ping" />
             </div>
             <h3 className="text-3xl font-bold text-brand-text-main italic tracking-tighter uppercase leading-none">
               TRANSISI <br /> <span className="text-brand-accent italic">BERHASIL!</span>
             </h3>
             <p className="text-sm text-slate-500 max-w-sm mx-auto italic font-medium">Siswa dari <span className="text-brand-sidebar font-bold uppercase">{selectedClass}</span> telah dipindahkan ke <span className="text-brand-accent font-bold uppercase italic">{targetClass}</span>.</p>
             <button 
                onClick={() => { setStep(1); setSelectedClass(''); }}
                className="mt-12 bg-brand-sidebar text-white px-12 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-brand-sidebar/90 transition-all shadow-xl shadow-brand-sidebar/20"
             >
                Selesai & Tutup
             </button>
          </div>
        )}
      </div>

      <div className="bg-brand-sidebar p-6 rounded-3xl text-white flex items-start gap-4 ring-4 ring-brand-sidebar/5">
         <ShieldAlert className="w-5 h-5 text-brand-accent shrink-0" />
         <div>
            <h5 className="text-[11px] font-bold uppercase italic tracking-widest text-brand-accent mb-2">Peringatan Keamanan</h5>
            <p className="text-[11px] text-slate-400 italic leading-relaxed">Proses ini akan merekap data akademik semester terakhir dan memperbarui status kelas siswa di database. Pastikan tidak ada data yang tertukar.</p>
         </div>
      </div>
    </div>
  );
}

