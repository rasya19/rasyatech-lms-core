import React from 'react';
import { Megaphone, Calendar, ChevronRight, Pin } from 'lucide-react';
import { motion } from 'motion/react';

const MOCK_PENGUMUMAN = [
  { id: '1', title: 'Jadwal Libur Idul Fitri 1447 H', date: '04 Mei 2026', type: 'Penting', isPinned: true },
  { id: '2', title: 'Informasi Kelancaran Ujian Online', date: '01 Mei 2026', type: 'Akademik', isPinned: false },
  { id: '3', title: 'Penawaran Kursus Keterampilan Gratis', date: '28 Apr 2026', type: 'Program', isPinned: false },
  { id: '4', title: 'Update Aplikasi LMS Versi 2.1', date: '25 Apr 2026', type: 'Sistem', isPinned: false },
];

export default function Pengumuman() {
  const savedBerita = localStorage.getItem('school_berita');
  const beritaList = savedBerita ? JSON.parse(savedBerita) : [];

  const allAnnouncements = [
    ...beritaList.map((b: any) => ({
      id: b.id,
      title: b.title,
      date: b.date,
      type: b.category || 'Berita',
      source: b.source || 'Internal PKBM',
      content: b.content || '',
      isPinned: false
    })),
    ...MOCK_PENGUMUMAN.map(p => ({ ...p, source: 'Internal PKBM', content: '' }))
  ];

  return (
    <div className="max-w-4xl space-y-6">
       <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-xl font-bold text-brand-text-main italic uppercase tracking-tight">Pusat <span className="text-brand-accent">Informasi</span></h2>
            <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest italic">Berita & Pengumuman Sekolah</p>
          </div>
          <Megaphone className="w-5 h-5 text-brand-accent opacity-30 shrink-0" />
       </div>

       <div className="space-y-4">
          {allAnnouncements.map((p) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={p.id} 
              className="bg-white rounded-2xl border border-brand-border p-6 group hover:border-brand-accent transition-all shadow-sm"
            >
               <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                     <div className={cn(
                       "p-3 rounded-xl shrink-0 mt-1",
                       p.isPinned ? "bg-brand-accent/10" : "bg-slate-50"
                     )}>
                        {p.isPinned ? <Pin className="w-4 h-4 text-brand-accent" /> : <Megaphone className="w-4 h-4 text-slate-400" />}
                     </div>
                     <div>
                       <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest",
                            p.type === 'Penting' ? "bg-red-50 text-red-500" : "bg-brand-sidebar text-white"
                          )}>
                            {p.type}
                          </span>
                          <span className={cn(
                             "text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border",
                             p.source === 'Internal PKBM' ? "border-brand-accent text-brand-accent" : "border-slate-200 text-slate-400"
                          )}>
                             {p.source}
                          </span>
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-auto">
                             <Calendar className="w-3 h-3" /> {p.date}
                          </div>
                       </div>
                       <h4 className="font-bold text-base text-brand-sidebar italic uppercase tracking-tight mb-3">{p.title}</h4>
                       
                       {p.content && (
                         <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-brand-border/50">
                            <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{p.content}</p>
                         </div>
                       )}
                     </div>
                  </div>
               </div>
            </motion.div>
          ))}
       </div>

       <div className="mt-12 bg-slate-50 rounded-xl border border-brand-border p-6 border-dashed text-center">
          <p className="text-[10px] font-bold text-slate-400 italic">Arsip Pengumuman Sebelumnya...</p>
          <button className="mt-4 text-xs font-bold text-brand-accent uppercase tracking-[0.2em] hover:underline">Lihat Semua Arsip</button>
       </div>
    </div>
  );
}

// Fixed import for cn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
