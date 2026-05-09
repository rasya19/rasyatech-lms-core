import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, CheckCircle2, Clock,
  ArrowUpRight, ArrowDownRight, Activity, XCircle, AlertCircle,
  FileText, Wallet, Rocket, Trophy, Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useSchool } from '../contexts/SchoolContext';
import { supabase } from '../lib/supabase';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const { school } = useSchool();
  const userRole = localStorage.getItem('userRole') || 'Siswa';
  const adminName = localStorage.getItem('adminName') || 'Ismanto';
  const studentName = localStorage.getItem('studentName') || 'Budi Santoso';
  const studentId = localStorage.getItem('studentId');

  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalSiswa: '1,245',
    totalGuru: '48',
    mapelAktif: '12',
    tugasSelesai: '8/10'
  });

  useEffect(() => {
    if (userRole === 'Siswa' && studentId) {
      fetchStudentDashboardData();
    }
  }, [userRole, studentId]);

  const fetchStudentDashboardData = async () => {
    try {
      // Fetch recent exam results
      const { data, error } = await supabase
        .from('hasil_ujian')
        .select(`
          *,
          bank_soal (nama_ujian, mata_pelajaran)
        `)
        .eq('student_id', studentId)
        .order('end_time', { ascending: false })
        .limit(5);

      if (!error && data) {
        setStudentResults(data);
        setStats(prev => ({
          ...prev,
          tugasSelesai: `${data.length}`
        }));
      }
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    }
  };

  const isExpired = school?.expiryDate ? new Date(school.expiryDate) < new Date() : false;
  const isExpiringSoon = school?.expiryDate ? (new Date(school.expiryDate).getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000) : false;

  return (
    <div className="space-y-6 max-w-6xl p-6 bg-slate-950 min-h-screen text-slate-100 rounded-3xl mt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-50 tracking-tight">Halo, {userRole === 'Admin' ? adminName : studentName}!</h2>
          <p className="text-sm font-medium text-emerald-400 mt-1 uppercase tracking-widest">Selamat Datang Kembali.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL SISWA', value: stats.totalSiswa, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
          { label: 'TOTAL GURU', value: stats.totalGuru, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
          ...(userRole === 'Admin' ? [
            { label: 'SALDO MASUK', value: 'Rp 45.5M', icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
            { label: 'TAGIHAN PENDING', value: 'Rp 12.3M', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' }
          ] : [
            { label: 'MAPEL AKTIF', value: stats.mapelAktif, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
            { label: 'UJIAN SELESAI', value: stats.tugasSelesai, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {userRole === 'Siswa' ? (
          <>
            {/* Student Results List */}
            <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-black text-slate-50 uppercase tracking-widest">Aktivitas Ujian Terakhir</h3>
                 <Link to="/dashboard/ujian" className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:underline">Lihat Semua</Link>
               </div>
               
               <div className="space-y-4">
                 {studentResults.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 italic text-xs">Belum ada data ujian.</div>
                 ) : (
                    studentResults.map((res) => (
                      <div key={res.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            res.nilai >= 75 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          )}>
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white uppercase italic tracking-tight">{res.bank_soal?.nama_ujian}</h4>
                            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-500 uppercase">
                              <span>{res.bank_soal?.mata_pelajaran}</span>
                              <span>• {new Date(res.end_time).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-white italic">{res.nilai}</p>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SKOR AKHIR</p>
                        </div>
                      </div>
                    ))
                 )}
               </div>
            </div>

            {/* Next Exam Card */}
            <div className="bg-emerald-600 p-8 rounded-3xl relative overflow-hidden group shadow-2xl shadow-emerald-600/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
               <div className="relative z-10">
                 <Rocket className="w-10 h-10 text-white mb-6 animate-bounce" />
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight mb-2">SIAP UNTUK<br/>UJIAN LANJUTAN?</h3>
                 <p className="text-xs font-bold text-emerald-100 italic opacity-80 mb-8">Kerjakan sisa tugas dan ujian harian Anda hari ini untuk meningkatkan skor raport.</p>
                 <Link 
                   to="/dashboard/ujian" 
                   className="inline-flex items-center gap-2 bg-slate-950 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all"
                 >
                   Ikut Ujian Sekarang <ArrowUpRight className="w-4 h-4" />
                 </Link>
               </div>
            </div>
          </>
        ) : (
          /* Admin View (simplified version since we're focusing on Student) */
          <div className="lg:col-span-3">
             <p className="text-slate-500 italic text-xs">Menu Administrasi Sekolah lengkap tersedia di sidebar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

