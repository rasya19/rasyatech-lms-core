import React, { useState } from 'react';
import { 
  Users, UserCheck, CheckCircle2, Clock,
  ArrowUpRight, ArrowDownRight, Activity, XCircle, AlertCircle,
  FileText, Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useSchool } from '../contexts/SchoolContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const CHART_DATA = [
  { name: 'Jan', lunas: 4000000, menunggu: 2400000 },
  { name: 'Feb', lunas: 3000000, menunggu: 1300000 },
  { name: 'Mar', lunas: 2000000, menunggu: 5800000 },
  { name: 'Apr', lunas: 2700000, menunggu: 3900000 },
  { name: 'Mei', lunas: 1800000, menunggu: 4800000 },
  { name: 'Jun', lunas: 2300000, menunggu: 3800000 },
  { name: 'Jul', lunas: 3400000, menunggu: 4300000 },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    user: 'Sistem',
    action: 'Pendaftaran Siswa Baru - Budi Santoso',
    time: '2 menit yang lalu',
    icon: Users,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/20'
  },
  {
    id: 2,
    user: 'Admin Ismanto',
    action: 'Memperbarui data Guru Matematika',
    time: '15 menit yang lalu',
    icon: UserCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/20'
  },
  {
    id: 3,
    user: 'System',
    action: 'Generate Tagihan SPP Bulan ini',
    time: '1 jam yang lalu',
    icon: FileText,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/20'
  },
  {
    id: 4,
    user: 'Siswa',
    action: 'Siti Aminah melakukan pembayaran lunas',
    time: '3 jam yang lalu',
    icon: Wallet,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/20'
  }
];

const TRANSAKSI_TERAKHIR = [
  { id: 'TRX-001', nama: 'Budi Santoso', nominal: 'Rp 250.000', status: 'Lunas' },
  { id: 'TRX-002', nama: 'Siti Aminah', nominal: 'Rp 250.000', status: 'Menunggu' },
  { id: 'TRX-003', nama: 'Ahmad Yani', nominal: 'Rp 500.000', status: 'Lunas' },
  { id: 'TRX-004', nama: 'Joko Widodo', nominal: 'Rp 150.000', status: 'Lunas' },
  { id: 'TRX-005', nama: 'Ratna Maimunah', nominal: 'Rp 250.000', status: 'Pending' },
];

export default function Dashboard() {
  const { school } = useSchool();
  const adminName = localStorage.getItem('adminName') || 'Ismanto';
  const userRole = localStorage.getItem('userRole') || 'Siswa';

  const isExpired = school?.expiryDate ? new Date(school.expiryDate) < new Date() : false;
  const isExpiringSoon = school?.expiryDate ? (new Date(school.expiryDate).getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000) : false;

  return (
    <div className="space-y-6 max-w-6xl p-6 bg-slate-950 min-h-screen text-slate-100 rounded-3xl mt-4">
      {/* Expiry Warning */}
      {isExpired ? (
        <div className="bg-red-900/50 text-red-100 p-6 rounded-3xl flex items-center justify-between gap-6 border border-red-500/50">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-2xl">
                 <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                 <h3 className="text-lg font-black uppercase italic leading-tight text-red-400">Masa Aktif Berakhir!</h3>
                 <p className="text-xs font-bold text-red-200/80 italic mt-1">Akses dashboard Anda telah dibatasi. Segera hubungi pusat untuk perpanjangan.</p>
              </div>
           </div>
           <a href="https://wa.me/6285225025555" target="_blank" className="bg-red-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all italic">Layanan Pusat</a>
        </div>
      ) : isExpiringSoon ? (
        <div className="bg-orange-900/50 text-orange-100 p-5 rounded-3xl flex items-center justify-between gap-4 border border-orange-500/50">
           <div className="flex items-center gap-4">
              <Clock className="w-6 h-6 text-orange-400 animate-pulse" />
              <div>
                 <h3 className="text-xs font-black uppercase italic leading-none text-orange-400">Peringatan Masa Aktif</h3>
                 <p className="text-[10px] font-bold text-orange-200/80 italic mt-1">Masa aktif sekolah akan berakhir pada {school?.expiryDate}. Segera perpanjang layanan Anda.</p>
              </div>
           </div>
           <a href="https://wa.me/6285225025555" target="_blank" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest italic shrink-0 hover:bg-orange-600 transition-colors">Beli Paket</a>
        </div>
      ) : null}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-50 tracking-tight">Halo, {userRole === 'Admin' ? 'Admin ' + adminName : adminName}!</h2>
          <p className="text-sm font-medium text-emerald-400 mt-1 uppercase tracking-widest">Selamat Datang Kembali.</p>
        </div>
      </div>

      {/* Compact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL SISWA', value: '1,245', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
          { label: 'TOTAL GURU', value: '48', icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
          ...(userRole === 'Admin' ? [
            { label: 'SALDO MASUK', value: 'Rp 45.5M', icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
            { label: 'TAGIHAN PENDING', value: 'Rp 12.3M', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' }
          ] : [
            { label: 'MAPEL AKTIF', value: '12', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
            { label: 'TUGAS SELESAI', value: '8/10', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' }
          ])
        ].map((stat, i) => (
          <div
            key={i}
            className={cn("bg-slate-900/50 p-6 rounded-3xl border flex flex-col justify-between group hover:border-emerald-500/50 transition-colors", stat.border)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-50 tracking-tight">{stat.value}</h3>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={cn("grid gap-6", userRole === 'Admin' ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1")}>
        {/* Chart Section - Only for Admin */}
        {userRole === 'Admin' && (
          <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-50 uppercase tracking-widest">Tren Pembayaran</h3>
                <p className="text-xs font-medium text-emerald-400/60 mt-1">Statistik Lunas vs Menunggu (6 Bulan Terakhir)</p>
              </div>
              <select className="bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 px-3 py-2 rounded-xl outline-none focus:border-emerald-500/50">
                <option>Tahun 2024</option>
                <option>Tahun 2023</option>
              </select>
            </div>
            
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLunas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMenunggu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                    tickFormatter={(val) => `Rp ${val/1000000}M`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid #1e293b', backgroundColor: '#0f172a', fontSize: '12px', fontWeight: 'bold', color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="lunas" name="Lunas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLunas)" />
                  <Area type="monotone" dataKey="menunggu" name="Menunggu" stroke="#64748b" strokeWidth={3} fillOpacity={1} fill="url(#colorMenunggu)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-50 uppercase tracking-widest">Aktivitas Terbaru</h3>
          </div>
          
          <div className="space-y-6 flex-1">
            {RECENT_ACTIVITIES.filter(a => userRole === 'Admin' ? true : a.action.indexOf('pembayaran') === -1 && a.action.indexOf('Tagihan') === -1).map((activity, idx, arr) => (
              <div key={activity.id} className="flex gap-4 relative group">
                 {/* Timeline Line */}
                 {idx !== arr.length - 1 && (
                   <div className="absolute left-[19px] top-10 bottom-[-24px] w-[1px] bg-slate-800" />
                 )}
                 
                 <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border border-slate-800 shadow-sm", activity.bg)}>
                    <activity.icon className={cn("w-4 h-4", activity.color)} />
                 </div>
                 
                 <div className="pt-1">
                    <p className="text-xs font-bold text-emerald-400">
                      {activity.user}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{activity.action}</p>
                    <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">{activity.time}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaksi Terakhir - Only for Admin */}
      {userRole === 'Admin' && (
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <h3 className="text-sm font-black text-slate-50 uppercase tracking-widest mb-6">Transaksi Terakhir</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID TRX</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {TRANSAKSI_TERAKHIR.map((trx, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4 text-xs font-mono text-slate-500">{trx.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-200">{trx.nama}</td>
                    <td className="px-4 py-4 text-xs font-bold text-emerald-400">{trx.nominal}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={cn(
                        "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                        trx.status === 'Lunas' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                        trx.status === 'Menunggu' ? "bg-slate-800 text-slate-300 border border-slate-700" :
                        "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      )}>
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

