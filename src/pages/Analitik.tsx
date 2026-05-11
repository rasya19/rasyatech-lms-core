import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { BrainCircuit, BookOpen, GraduationCap, Trophy, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const PERKEMBANGAN_NILAI = [
  { bulan: 'Jan', matematika: 78, b_indo: 82, b_inggris: 75, ipa: 80 },
  { bulan: 'Feb', matematika: 82, b_indo: 85, b_inggris: 78, ipa: 83 },
  { bulan: 'Mar', matematika: 80, b_indo: 84, b_inggris: 85, ipa: 81 },
  { bulan: 'Apr', matematika: 85, b_indo: 88, b_inggris: 82, ipa: 86 },
  { bulan: 'Mei', matematika: 89, b_indo: 87, b_inggris: 88, ipa: 90 },
  { bulan: 'Jun', matematika: 92, b_indo: 90, b_inggris: 91, ipa: 95 },
];

const PREDIKAT_DIST = [
  { name: 'A (Sangat Baik)', value: 35 },
  { name: 'B (Baik)', value: 45 },
  { name: 'C (Cukup)', value: 15 },
  { name: 'D (Kurang)', value: 5 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const REKOMENDASI_AI = [
  { MAPEL: 'Matematika', STATUS: 'Meningkat', PESAN: 'Pemahaman konsep aljabar sangat baik. Tingkatkan latihan soal cerita.', ICON: Trophy, COLOR: 'text-emerald-400', BG: 'bg-emerald-400/10' },
  { MAPEL: 'Bahasa Indonesia', STATUS: 'Stabil', PESAN: 'Kemampuan membaca komprehensif sudah baik. Perlu latihan menulis essai.', ICON: CheckCircle2, COLOR: 'text-blue-400', BG: 'bg-blue-400/10' },
  { MAPEL: 'Bahasa Inggris', STATUS: 'Perhatian', PESAN: 'Nilai grammar menurun. Disarankan mengikuti kelas tambahan di hari Sabtu.', ICON: AlertCircle, COLOR: 'text-orange-400', BG: 'bg-orange-400/10' },
];


export default function Analitik() {
  const [selectedSemester, setSelectedSemester] = useState('Genap 2023/2024');

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
               <BrainCircuit className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-50 tracking-tight italic uppercase">Analitik <span className="text-emerald-400">e-Rapor</span></h2>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest pl-[3.5rem]">Laporan Progress Akademik Berbasis AI</p>
        </div>
        
        <div className="relative group">
           <select 
             className="appearance-none bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 px-5 py-3 pr-10 rounded-xl outline-none focus:border-emerald-500/50 uppercase tracking-widest italic cursor-pointer shadow-lg"
             value={selectedSemester}
             onChange={(e) => setSelectedSemester(e.target.value)}
           >
             <option value="Genap 2023/2024">Semester Genap 23/24</option>
             <option value="Ganjil 2023/2024">Semester Ganjil 23/24</option>
             <option value="Genap 2022/2023">Semester Genap 22/23</option>
           </select>
           <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'RATA-RATA KELAS', val: '86.4', desc: '+2.1 dari semester lalu', icon: GraduationCap, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
          { label: 'SISWA TUNTAS', val: '92%', desc: 'Melewati KKM', icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
          { label: 'NILAI TERTINGGI', val: '98', desc: 'Matematika Peminatan', icon: Trophy, color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
          { label: 'PERLU REMEDIAL', val: '8%', desc: 'Di bawah KKM', icon: AlertCircle, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' }
        ].map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("bg-slate-900/50 p-6 rounded-3xl border flex flex-col justify-between group hover:-translate-y-1 transition-all shadow-xl", card.border)}
          >
             <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl", card.bg)}>
                   <card.icon className={cn("w-7 h-7", card.color)} />
                </div>
                <div className="text-right">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</h4>
                   <h3 className="text-3xl font-black text-white mt-1 uppercase italic tracking-tighter">{card.val}</h3>
                </div>
             </div>
             <p className="text-xs font-bold text-slate-500 tracking-wider bg-slate-800/50 inline-block px-3 py-1.5 rounded-lg w-full text-center">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col">
           <h3 className="text-sm font-black text-slate-50 uppercase tracking-widest mb-1">Perkembangan Nilai Kognitif</h3>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Rata-rata Kelas per Bulan</p>
           
           <div className="flex-1 min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={PERKEMBANGAN_NILAI} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorIpa" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                 <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} dy={10} />
                 <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                 <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: '1px solid #1e293b', backgroundColor: '#0f172a', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900, color: '#f8fafc', padding: '12px' }}
                   itemStyle={{ padding: '4px 0' }}
                 />
                 <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', paddingTop: '20px' }} />
                 <Area type="monotone" dataKey="matematika" name="MATEMATIKA" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMath)" />
                 <Area type="monotone" dataKey="ipa" name="IPA (SAINS)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIpa)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Pie Chart Distribution */}
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
           <div>
             <h3 className="text-sm font-black text-slate-50 uppercase tracking-widest mb-1">Distribusi Predikat</h3>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Persentase Capaian Siswa</p>
           </div>
           
           <div className="flex-1 w-full flex items-center justify-center min-h-[200px]">
             <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={PREDIKAT_DIST}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {PREDIKAT_DIST.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
             </ResponsiveContainer>
           </div>

           {/* Legend List */}
           <div className="space-y-3 mt-4">
              {PREDIKAT_DIST.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.name}</span>
                   </div>
                   <span className="text-xs font-black text-white italic">{item.value}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* AI Recommendation Section */}
      <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-xl">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
               <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Wawasan & Rekomendasi AI</h3>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Dihasilkan berdasarkan analisis data historis</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REKOMENDASI_AI.map((rec, i) => (
               <div key={i} className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-xs font-black text-white uppercase tracking-widest italic">{rec.MAPEL}</span>
                     <div className={cn("px-2 py-1 flex items-center justify-center rounded-lg border border-slate-700", rec.BG, rec.COLOR)}>
                        <rec.ICON className="w-3 h-3" />
                     </div>
                  </div>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">"{rec.PESAN}"</p>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
