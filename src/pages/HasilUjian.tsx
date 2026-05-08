import React from 'react';
import { 
  CheckCircle, FileBarChart, Search, Download
} from 'lucide-react';

export default function HasilUjian() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-orange-400" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Hasil <span className="text-orange-400 italic">Ujian</span></h1>
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest pl-1">Rekapitulasi Nilai & Evaluasi Siswa</p>
        </div>
        
        <div className="relative z-10 flex gap-4">
          <button className="bg-slate-800 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-700 transition-all border border-slate-700">
            <Download className="w-4 h-4" /> Export Data
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6 text-center">
         <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-full mb-4 border border-slate-100">
               <FileBarChart className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Data Ujian Kosong</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm font-medium">Belum ada hasil ujian yang direkam karena belum ada ujian yang diselenggarakan.</p>
         </div>
      </div>
    </div>
  );
}
