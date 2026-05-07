import React from 'react';
import { 
  BookOpen, 
  Search, 
  LayoutGrid, 
  List, 
  ChevronRight,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_MATERI = [
  { id: '1', title: 'Bahasa Indonesia - Paket C', tutor: 'Dra. Siti Aminah', modules: 12, category: 'Akademik', color: 'bg-blue-500' },
  { id: '2', title: 'Matematika - Paket B', tutor: 'Drs. Ahmad Yani', modules: 10, category: 'Akademik', color: 'bg-rose-500' },
  { id: '3', title: 'Keterampilan Menjahit', tutor: 'Ibu Ratna', modules: 8, category: 'Vokasi', color: 'bg-emerald-500' },
  { id: '4', title: 'Bahasa Inggris Dasar', tutor: 'Bp. Suryadi', modules: 15, category: 'Vokasi', color: 'bg-amber-500' },
  { id: '5', title: 'Sosiologi - Paket C', tutor: 'Dra. Siti Aminah', modules: 8, category: 'Akademik', color: 'bg-indigo-500' },
  { id: '6', title: 'IPA Dasar - Paket A', tutor: 'Drs. Ahmad Yani', modules: 10, category: 'Akademik', color: 'bg-teal-500' },
];

export default function Materi() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-bold text-brand-text-main italic">MODUL <span className="not-italic text-brand-accent">PEMBELAJARAN</span></h2>
          <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-[0.2em]">Bank Materi PKBM Armilla Nusa</p>
        </div>
        <div className="flex gap-2">
           <button className="p-2 border border-brand-border rounded-lg bg-white"><LayoutGrid className="w-4 h-4 text-brand-accent" /></button>
           <button className="p-2 border border-brand-border rounded-lg bg-white"><List className="w-4 h-4 text-slate-400" /></button>
        </div>
      </div>

      <div className="flex gap-4 p-1">
        <div className="flex-1 bg-white border border-brand-border rounded-xl flex items-center px-4 py-2 gap-3 group focus-within:border-brand-accent transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Cari materi pelajaran..." className="bg-transparent border-none outline-none text-xs w-full" />
        </div>
        <select className="bg-white border border-brand-border rounded-xl px-4 py-2 text-xs font-bold text-brand-text-main outline-none focus:border-brand-accent transition-all">
          <option>Semua Program</option>
          <option>Paket A</option>
          <option>Paket B</option>
          <option>Paket C</option>
          <option>Keterampilan</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_MATERI.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-brand-border overflow-hidden group hover:border-brand-accent transition-all flex flex-col p-4">
            <div className={`w-10 h-10 ${m.color} rounded-lg mb-4 flex items-center justify-center text-white`}>
              <FileText className="w-5 h-5" />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-bold text-brand-accent border border-brand-accent/20 px-1.5 py-0.5 rounded uppercase">{m.category}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{m.modules} Modul</span>
              </div>
              <h4 className="font-bold text-sm text-brand-text-main leading-tight mb-2 group-hover:text-brand-accent transition-colors">{m.title}</h4>
              <p className="text-[10px] text-slate-500 italic">Pengampu: {m.tutor}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-brand-border flex justify-between items-center">
              <Link to={`/dashboard/course/${m.id}`} className="text-[10px] font-bold text-brand-accent hover:underline flex items-center gap-1 uppercase tracking-widest">
                Akses Materi <ChevronRight className="w-3 h-3" />
              </Link>
              <div className="flex -space-x-2">
                {[1,2].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full bg-slate-200 border border-white" />
                ))}
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[7px] text-slate-500 font-bold">+12</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
