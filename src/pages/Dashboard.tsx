import React, { useState } from 'react';
import { 
  Users, UserCheck, CheckCircle2, Clock,
  ArrowUpRight, ArrowDownRight, Activity, XCircle, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useSchool } from '../contexts/SchoolContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const CHART_DATA = [
  { name: 'Jan', lunas: 40, menunggu: 24 },
  { name: 'Feb', lunas: 30, menunggu: 13 },
  { name: 'Mar', lunas: 20, menunggu: 58 },
  { name: 'Apr', lunas: 27, menunggu: 39 },
  { name: 'Mei', lunas: 18, menunggu: 48 },
  { name: 'Jun', lunas: 23, menunggu: 38 },
  { name: 'Jul', lunas: 34, menunggu: 43 },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    user: 'Siswa A',
    action: 'baru saja melakukan pembayaran SPP Bulan ini',
    time: '2 menit yang lalu',
    type: 'payment',
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50'
  },
  {
    id: 2,
    user: 'Admin B',
    action: 'memperbarui data Guru Matematika',
    time: '15 menit yang lalu',
    type: 'update',
    icon: UserCheck,
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  },
  {
    id: 3,
    user: 'Sistem',
    action: 'membuat 45 Tagihan baru untuk Kelas 10',
    time: '1 jam yang lalu',
    type: 'system',
    icon: Activity,
    color: 'text-violet-500',
    bg: 'bg-violet-50'
  },
  {
    id: 4,
    user: 'Siswa C',
    action: 'baru saja mendaftar melalui PPDB',
    time: '3 jam yang lalu',
    type: 'register',
    icon: Users,
    color: 'text-orange-500',
    bg: 'bg-orange-50'
  }
];

export default function Dashboard() {
  const { school } = useSchool();
  const adminName = localStorage.getItem('adminName') || 'Administrator';

  const isExpired = school?.expiryDate ? new Date(school.expiryDate) < new Date() : false;
  const isExpiringSoon = school?.expiryDate ? (new Date(school.expiryDate).getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000) : false;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Expiry Warning */}
      {isExpired ? (
        <div className="bg-red-600 text-white p-6 rounded-[2rem] shadow-xl shadow-red-600/20 flex items-center justify-between gap-6 border-4 border-red-400">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                 <XCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                 <h3 className="text-lg font-black uppercase italic italic leading-tight">Masa Aktif Berakhir!</h3>
                 <p className="text-xs font-bold text-white/80 italic">Akses dashboard Anda telah dibatasi. Segera hubungi pusat untuk perpanjangan.</p>
              </div>
           </div>
           <a href="https://wa.me/6285225025555" target="_blank" className="bg-white text-red-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all italic">Layanan Pusat</a>
        </div>
      ) : isExpiringSoon ? (
        <div className="bg-orange-500 text-white p-5 rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-between gap-4 border-2 border-orange-300">
           <div className="flex items-center gap-4">
              <Clock className="w-6 h-6 animate-pulse" />
              <div>
                 <h3 className="text-xs font-black uppercase italic italic leading-none">Peringatan Masa Aktif</h3>
                 <p className="text-[10px] font-bold text-white/80 italic mt-1">Masa aktif sekolah akan berakhir pada {school?.expiryDate}. Segera perpanjang layanan Anda.</p>
              </div>
           </div>
           <a href="https://wa.me/6285225025555" target="_blank" className="bg-white text-orange-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest italic shrink-0">Beli Paket</a>
        </div>
      ) : null}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Utama</h2>
          <p className="text-xs font-bold text-slate-500 mt-1">Selamat datang kembali, {adminName}</p>
        </div>
      </div>

      {/* Compact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL SISWA', value: '1,245', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12 baris bulan ini', trendUp: true },
          { label: 'TOTAL GURU', value: '48', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+2 guru baru', trendUp: true },
          { label: 'LUNAS (BLN INI)', value: 'Rp 45.5M', icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50', trend: '+15% dari bulan lalu', trendUp: true },
          { label: 'MENUNGGU (BLN INI)', value: 'Rp 12.3M', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', trend: '-5% dari bulan lalu', trendUp: false },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <span className={cn("text-[10px] font-bold flex items-center gap-1", stat.trendUp ? "text-emerald-600" : "text-red-600")}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Tren Pembayaran</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Statistik Lunas vs Menunggu (6 Bulan Terakhir)</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl outline-none">
              <option>Tahun 2024</option>
              <option>Tahun 2023</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLunas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMenunggu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="lunas" name="Lunas" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorLunas)" />
                <Area type="monotone" dataKey="menunggu" name="Menunggu" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorMenunggu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Aktivitas Terbaru</h3>
            <button className="text-blue-600 font-bold text-[10px] hover:underline uppercase tracking-widest">
              Lihat Semua
            </button>
          </div>
          
          <div className="space-y-6 flex-1">
            {RECENT_ACTIVITIES.map((activity, idx) => (
              <div key={activity.id} className="flex gap-4 relative">
                 {/* Timeline Line */}
                 {idx !== RECENT_ACTIVITIES.length - 1 && (
                   <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-slate-100" />
                 )}
                 
                 <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm", activity.bg)}>
                    <activity.icon className={cn("w-4 h-4", activity.color)} />
                 </div>
                 
                 <div className="pt-1">
                    <p className="text-xs font-bold text-slate-800">
                      {activity.user} <span className="font-medium text-slate-500">{activity.action}</span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{activity.time}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
