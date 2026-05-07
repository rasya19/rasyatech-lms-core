import React from 'react';
import { ClipboardCheck, Rocket, AlertCircle, CheckCircle2 } from 'lucide-react';

const MOCK_UJIAN = [
  { id: '1', title: 'Ujian Tengah Semester - B. Indo', date: 'Mulai Hari Ini', time: 's/d Minggu (23:59)', status: 'Active', link: 'https://forms.gle/example' },
  { id: '2', title: 'Kuis Harian - Matematika', date: 'Hari Ini', time: 'Sudah Berakhir', status: 'Completed' },
  { id: '3', title: 'Try Out Paket C', date: '20 Mei 2026', time: '09:00 - 12:00', status: 'Locked' },
  { id: '4', title: 'Pre-Test Menjahit', date: '01 Mei 2026', time: 'Sudah Selesai', status: 'Completed' },
];

export default function Ujian() {
  const handleStartExam = (link?: string) => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-brand-text-main tracking-tight uppercase italic">Jadwal <span className="text-brand-accent">Ujian Aktif</span></h2>
          <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest italic opacity-70">Klik tombol pengerjaan untuk memulai via Google Form</p>
        </div>
      </div>

      <div className="grid gap-4">
        {MOCK_UJIAN.map((u) => (
          <div key={u.id} className="bg-white rounded-xl border border-brand-border p-5 flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                u.status === 'Active' ? 'bg-brand-accent/10 text-brand-accent animate-pulse' : 
                u.status === 'Upcoming' ? 'bg-slate-100 text-slate-500' :
                u.status === 'Completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'
              )}>
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-brand-text-main">{u.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{u.date}</span>
                  <span className="text-[10px] text-brand-accent font-bold uppercase tracking-wider">• {u.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {u.status === 'Active' && (
                <button 
                  onClick={() => handleStartExam(u.link)}
                  className="flex items-center gap-2 bg-brand-accent text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20"
                >
                  <Rocket className="w-3.5 h-3.5" /> Kerjakan Sekarang
                </button>
              )}
              {u.status === 'Upcoming' && (
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase italic">
                  <AlertCircle className="w-3.5 h-3.5" /> Menunggu...
                </div>
              )}
              {u.status === 'Completed' && (
                <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-sidebar rounded-xl p-6 text-white overflow-hidden relative group">
         <div className="relative z-10">
           <h3 className="font-bold text-sm uppercase tracking-widest mb-1 italic">Tata Tertib Ujian Online</h3>
           <ol className="text-[10px] text-slate-300 list-decimal pl-4 space-y-1 font-medium italic opacity-80 mt-3">
             <li>Pastikan koneksi internet stabil selama pengerjaan.</li>
             <li>Dilarang membuka tab browser lain saat ujian berlangsung.</li>
             <li>Sistem AI akan memantau aktivitas pengerjaan Anda.</li>
           </ol>
         </div>
         <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700" />
      </div>
    </div>
  );
}

// Fixed import for cn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
