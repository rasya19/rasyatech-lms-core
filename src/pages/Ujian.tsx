import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Rocket, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function Ujian() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userRole = localStorage.getItem('userRole') || 'Siswa';

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bank_soal')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartExam = (id: string) => {
    navigate(`/ujian/${id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-text-main tracking-tight uppercase italic">Jadwal <span className="text-brand-accent">Ujian Aktif</span></h2>
          <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest italic opacity-70">Klik tombol pengerjaan untuk memulai ujian</p>
        </div>
        {(userRole === 'Admin' || userRole === 'Guru') && (
          <button 
            onClick={() => {
              const prefix = window.location.pathname.startsWith('/s/') 
                ? `/s/${window.location.pathname.split('/')[2]}` 
                : '';
              navigate(`${prefix}/dashboard/soal`);
            }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
          >
            <ClipboardCheck className="w-4 h-4" /> Tambah Ujian
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
           <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="w-8 h-8" />
           </div>
           <h3 className="font-bold text-slate-800">Tidak Ada Ujian</h3>
           <p className="text-xs text-slate-500 mt-1">Saat ini belum ada jadwal ujian yang tersedia untuk Anda.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-brand-border p-5 flex items-center justify-between hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center shadow-sm">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-text-main">{u.nama_ujian}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-500">{u.mata_pelajaran}</span>
                    <span className="text-brand-accent">• {u.durasi} MENIT</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                {(userRole === 'Admin' || userRole === 'Guru') && (
                  <button 
                    onClick={() => {
                      const prefix = window.location.pathname.startsWith('/s/') 
                        ? `/s/${window.location.pathname.split('/')[2]}` 
                        : '';
                      navigate(`${prefix}/dashboard/hasil-ujian`, { 
                        state: { examId: u.id, tab: 'status' } 
                      });
                    }}
                    className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Monitor Status
                  </button>
                )}
                
                <button 
                  onClick={() => handleStartExam(u.id)}
                  className="flex items-center gap-2 bg-brand-accent text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20"
                >
                  <Rocket className="w-3.5 h-3.5" /> {userRole === 'Siswa' ? 'Kerjakan Sekarang' : 'Cek Tampilan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-brand-sidebar rounded-xl p-6 text-white overflow-hidden relative group">
         <div className="relative z-10">
           <h3 className="font-bold text-sm uppercase tracking-widest mb-1 italic">Tata Tertib Ujian Online</h3>
           <ol className="text-[10px] text-slate-300 list-decimal pl-4 space-y-1 font-medium italic opacity-80 mt-3">
             <li>Pastikan koneksi internet stabil selama pengerjaan.</li>
             <li>Dilarang membuka tab browser lain saat ujian berlangsung.</li>
             <li>Sistem akan otomatis memasuki mode layar penuh. Dilarang keluar dari mode layar penuh.</li>
             <li>Sistem AI akan memantau aktivitas pengerjaan Anda.</li>
           </ol>
         </div>
         <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700" />
      </div>
    </div>
  );
}
