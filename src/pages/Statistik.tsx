import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Award } from 'lucide-react';

export default function Statistik() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-sidebar uppercase italic tracking-widest">STATISTIK <span className="text-brand-accent">EKSEKUTIF</span></h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Laporan Analitik Strategis Institusi (Platinum Only)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pertumbuhan Siswa', value: '+12.5%', icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Retensi Belajar', value: '94%', icon: Users, color: 'text-blue-500' },
          { label: 'Revenue Orbit', value: 'Rp 1.2M', icon: DollarSign, color: 'text-brand-accent' },
          { label: 'Kepuasan Siswa', value: '4.8/5.0', icon: Award, color: 'text-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-brand-border shadow-sm">
            <div className={`p-3 w-fit rounded-2xl bg-slate-50 mb-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-brand-sidebar uppercase italic tracking-tighter mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-brand-border shadow-sm min-h-[400px] flex items-center justify-center border-dashed">
         <div className="text-center space-y-4">
            <div className="p-4 bg-brand-accent/10 rounded-full w-fit mx-auto">
               <BarChart3 className="w-12 h-12 text-brand-accent" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Visualisasi Data Lanjutan Sedang Disiapkan</p>
         </div>
      </div>
    </div>
  );
}
