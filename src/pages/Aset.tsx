import React from 'react';
import { Layers, Package, ClipboardList, PenTool as Tool, Search, Plus } from 'lucide-react';

export default function Aset() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-brand-sidebar p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">MANAJEMEN <span className="text-brand-accent">ASET</span></h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Inventaris & Sarana Prasarana (Platinum Only)</p>
        </div>
        <button className="relative z-10 bg-brand-accent text-brand-sidebar px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest italic flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-brand-accent/20">
          <Plus className="w-5 h-5" /> Tambah Aset Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Item Aset', value: '142 Unit', icon: Package, color: 'text-blue-500' },
          { label: 'Kondisi Baik', value: '138 Item', icon: Tool, color: 'text-emerald-500' },
          { label: 'Perlu Perbaikan', value: '4 Item', icon: ClipboardList, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-brand-border shadow-sm flex items-center gap-6">
            <div className={`p-4 rounded-2xl bg-slate-50 ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-brand-sidebar uppercase italic tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-brand-border rounded-[3rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-brand-border flex flex-col md:flex-row justify-between gap-4">
          <h3 className="text-sm font-black text-brand-sidebar uppercase italic tracking-widest">Daftar Inventaris</h3>
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
             <input type="text" placeholder="Cari aset..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-brand-border rounded-lg text-xs outline-none" />
          </div>
        </div>
        <div className="p-8 text-center py-20">
           <Layers className="w-12 h-12 text-slate-100 mx-auto mb-4" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Belum Ada Data Aset Yang Terdaftar</p>
        </div>
      </div>
    </div>
  );
}
