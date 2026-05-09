import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, CheckCircle2, Clock,
  ArrowUpRight, ArrowDownRight, Activity, XCircle, AlertCircle,
  FileText, Wallet, Rocket, Trophy, Calendar, Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useSchool } from '../contexts/SchoolContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
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
    totalSiswa: '0',
    totalGuru: '0',
    totalUjian: '0',
    rataNilai: '0',
    mapelAktif: '0',
    tugasSelesai: '0'
  });

  useEffect(() => {
    if (userRole === 'Siswa' && studentId) {
      fetchStudentDashboardData();
    } else if (userRole === 'Admin') {
      fetchAdminDashboardData();
    }
  }, [userRole, studentId]);

  const handleResetAll = async () => {
    if (!window.confirm('Hapus SEMUA jawaban siswa dan hasil ujian sekarang? Tujuannya untuk memulai simulasi dari awal.')) return;
    try {
      const { error: err1 } = await supabase.from('jawaban_siswa').delete().neq('student_id', 'none');
      const { error: err2 } = await supabase.from('hasil_ujian').delete().neq('student_id', 'none');
      if (err1 || err2) throw (err1 || err2);
      toast.success('Database berhasil direset untuk simulasi baru.');
      fetchAdminDashboardData();
    } catch (err: any) {
      toast.error('Gagal reset: ' + err.message);
    }
  };

  const fetchAdminDashboardData = async () => {
    try {
      // Total Siswa
      const { count: siswaCount } = await supabase.from('profiles_siswa').select('*', { count: 'exact', head: true });
      // Total Guru
      const { count: guruCount } = await supabase.from('profiles_guru').select('*', { count: 'exact', head: true });
      // Total Ujian
      const { count: ujianCount } = await supabase.from('bank_soal').select('*', { count: 'exact', head: true });
      // Rata Nilai
      const { data: results } = await supabase.from('hasil_ujian').select('nilai');
      const avg = results && results.length > 0 
        ? Math.round(results.reduce((acc, curr) => acc + curr.nilai, 0) / results.length)
        : 0;

      setStats({
        totalSiswa: siswaCount?.toString() || '0',
        totalGuru: guruCount?.toString() || '0',
        totalUjian: ujianCount?.toString() || '0',
        rataNilai: avg.toString()
      });
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    }
  };

  const exportAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('hasil_ujian')
        .select(`
          nilai,
          end_time,
          profiles_siswa:student_id (nama, nisn, class),
          bank_soal (nama_ujian)
        `);

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error('Belum ada data kehadiran ujian.');
        return;
      }

      const worksheetData = data.map(row => ({
        'Nama Siswa': row.profiles_siswa?.nama,
        'NISN': row.profiles_siswa?.nisn,
        'Kelas': row.profiles_siswa?.class,
        'Nama Ujian': row.bank_soal?.nama_ujian,
        'Skor': row.nilai,
        'Waktu Selesai': new Date(row.end_time).toLocaleString('id-ID')
      }));

      const { utils, writeFile } = await import('xlsx');
      const wb = utils.book_new();
      const ws = utils.json_to_sheet(worksheetData);
      utils.book_append_sheet(wb, ws, 'Kehadiran Ujian');
      writeFile(wb, `Laporan_Kehadiran_Ujian_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Laporan Kehadiran berhasil diunduh.');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Gagal mengekspor laporan.');
    }
  };

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
            { label: 'TOTAL UJIAN', value: stats.totalUjian, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
            { label: 'RATA-RATA SKOR', value: stats.rataNilai, icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' }
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
          /* Admin View */
          <div className="lg:col-span-3 space-y-6">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 bg-slate-900/80 rounded-[3rem] border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-tight">Rekap Nilai <br/> <span className="text-emerald-400">Simulasi UNBK</span></h3>
                  <p className="text-xs font-medium text-slate-400 max-w-sm">Unduh rekapitulasi nilai seluruh siswa yang telah mengikuti simulasi dalam format Excel untuk evaluasi hasil belajar.</p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={exportAttendance}
                      className="bg-slate-50 text-slate-900 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-all shadow-xl shadow-black/20 flex items-center gap-3"
                    >
                      <Download className="w-4 h-4" /> Download Rekap Simulasi (XLSX)
                    </button>
                    <button 
                      onClick={handleResetAll}
                      className="bg-red-500/10 text-red-500 border border-red-500/20 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    >
                      <RotateCcw className="w-4 h-4" /> Reset Semua Sesi
                    </button>
                  </div>
                </div>
                <div className="relative z-10 w-full md:w-auto">
                   <div className="grid grid-cols-2 gap-4">
                      <Link to="/dashboard/hasil-ujian" className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700 hover:border-emerald-500/30 transition-all text-center">
                         <Activity className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                         <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Live Monitor</p>
                      </Link>
                      <Link to="/dashboard/settings" className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700 hover:border-emerald-500/30 transition-all text-center">
                         <RotateCcw className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                         <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Reset Sesi</p>
                      </Link>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

const RotateCcw = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

