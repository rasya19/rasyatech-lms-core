import React, { useState } from 'react';
import { 
  Search, Plus, Layers, Edit2, Trash2, 
  FileText, CheckCircle2, MoreVertical 
} from 'lucide-react';

export default function BankSoal() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Layers className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Bank <span className="text-emerald-400 italic">Soal</span></h1>
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest pl-1">Kelola Kumpulan Soal Ujian</p>
        </div>
        
        <div className="relative z-10 flex gap-4">
          <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
            <Plus className="w-4 h-4" /> Buat Soal
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6 text-center">
         <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-full mb-4 border border-slate-100">
               <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Belum ada soal</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm font-medium">Klik tombol 'Buat Soal' di atas untuk mulai menambahkan butir soal ke dalam repositori.</p>
         </div>
      </div>
    </div>
  );
}
