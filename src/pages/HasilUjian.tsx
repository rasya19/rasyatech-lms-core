import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, Clock, AlertCircle, CheckCircle2, 
  Search, Power, RefreshCcw, Loader2 
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function MonitoringUjian() {
  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMonitoring();
    const interval = setInterval(fetchMonitoring, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoring = async () => {
    try {
      setIsLoading(true);
      // We join jawaban_siswa with bank_soal and profiles_siswa
      // Ideally we'd have a 'sesi_ujian' table, but we'll derive from latest activity
      const { data, error } = await supabase
        .from('jawaban_siswa')
        .select(`
          student_id,
          bank_soal_id,
          updated_at,
          bank_soal (nama_ujian),
          profiles_siswa:student_id (nama, nisn, class)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Group by student and bank_soal to get "active" sessions
      const uniqueSessions = Array.from(new Set(data.map(s => `${s.student_id}-${s.bank_soal_id}`)))
        .map(id => {
          const sessions = data.filter(s => `${s.student_id}-${s.bank_soal_id}` === id);
          return sessions[0]; // Get most recent activity for this session
        });

      setMonitoringData(uniqueSessions);
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceFinish = async (studentId: string, bankSoalId: string) => {
    if (!window.confirm('Paksa siswa ini mengakhiri ujian? Semua jawaban tersimpan akan dikunci.')) return;
    
    try {
      // In a real app, we might set a 'status' in a sessions table.
      // Here, we'll mark the exam as finished in hasil_ujian to trigger completion on client.
      const { error } = await supabase.from('hasil_ujian').upsert({
        student_id: studentId,
        bank_soal_id: bankSoalId,
        end_time: new Date().toISOString(),
        nilai: 0, // Admin can set this or it can be auto-calculated
        total_benar: 0,
        total_soal: 0,
        status: 'FORCED'
      });
      if (error) throw error;
      alert('Siswa berhasil dipaksa selesai.');
      fetchMonitoring();
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Monitoring <span className="text-emerald-500">Ujian Live</span></h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Pantau aktivitas pengerjaan siswa secara real-time</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Cari Siswa/Ujian..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
             />
          </div>
          <button 
            onClick={fetchMonitoring}
            className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCcw className={cn("w-5 h-5", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ujian</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Terakhir</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {monitoringData.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                   <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-slate-50/50">
                      <Users className="w-8 h-8" />
                   </div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada aktivitas ujian yang terdeteksi.</p>
                </td>
              </tr>
            ) : (
              monitoringData.map((session, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xs border border-emerald-500/20">
                        {session.profiles_siswa?.nama?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{session.profiles_siswa?.nama}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{session.profiles_siswa?.nisn} • Kelas {session.profiles_siswa?.class}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{session.bank_soal?.nama_ujian}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Sedang Mengerjakan</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{new Date(session.updated_at).toLocaleTimeString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleForceFinish(session.student_id, session.bank_soal_id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:border-red-500 transition-all shadow-lg shadow-black/10 group-hover:-translate-x-1"
                    >
                      <Power className="w-3.5 h-3.5" /> Paksa Selesai
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
