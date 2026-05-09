import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Lock, 
  Trash2, 
  AlertTriangle, 
  Save, 
  ShieldAlert,
  History,
  RotateCcw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        toast.error('Konfirmasi password tidak cocok');
        return;
    }
    
    setLoading(true);
    try {
      // In this demo app, we use localStorage for admin password if not using Supabase Auth properly
      // For real apps, use supabase.auth.updateUser({ password: passwords.new })
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;
      
      toast.success('Password berhasil diperbarui');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('PERINGATAN: Ini akan menghapus SEMUA jawaban siswa dan hasil ujian. Data tidak dapat dikembalikan. Lanjutkan?')) {
      return;
    }

    setLoading(true);
    try {
      // Delete answers
      const { error: err1 } = await supabase.from('jawaban_siswa').delete().neq('student_id', 'none');
      if (err1) throw err1;

      // Delete results
      const { error: err2 } = await supabase.from('hasil_ujian').delete().neq('student_id', 'none');
      if (err2) throw err2;

      toast.success('Simulasi berhasil direset. Semua jawaban siswa telah dihapus.');
    } catch (err: any) {
      toast.error('Gagal mereset data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-emerald-500" />
          Pengaturan <span className="text-emerald-500">Akun Admin</span>
        </h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Kelola keamanan dan pemeliharaan database sistem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Password Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase italic">Ubah Password</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Perbarui akses login Admin</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password Baru</label>
              <input 
                type="password" 
                required
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Konfirmasi Password Baru</label>
              <input 
                type="password" 
                required
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Simpan Perubahan
            </button>
          </form>
        </div>

        {/* Maintenance Section */}
        <div className="bg-red-50/30 p-8 rounded-[2.5rem] border border-red-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-red-800 uppercase italic">Sesi Baru / Reset</h3>
                <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-wider">Pemeliharaan Basis Data</p>
              </div>
            </div>

            <div className="p-4 bg-white/50 border border-red-100 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-800">Zona Bahaya</p>
                  <p className="text-[10px] font-medium text-red-600 mt-1">Aksi ini akan menghapus permanen semua riwayat pengerjaan siswa untuk simulasi baru.</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleResetData}
            disabled={loading}
            className="w-full mt-8 bg-red-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
          >
            <History className="w-4 h-4" /> Reset Semua Jawaban Siswa
          </button>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[3rem] text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-emerald-500/20 transition-all duration-700" />
        <div className="relative z-10 flex items-center justify-between gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <ShieldAlert className="w-6 h-6 text-emerald-400" />
                 <h3 className="text-lg font-black uppercase italic tracking-tight">Keamanan Multi-Faktor</h3>
              </div>
              <p className="text-xs font-medium text-slate-400 max-w-md">Aktifkan perlindungan tambahan untuk mengamankan data institusi Anda dari akses yang tidak sah.</p>
              <button className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">Segera Hadir</button>
           </div>
           <div className="hidden md:block">
              <SettingsIcon className="w-24 h-24 text-slate-800 animate-spin-slow rotate-12" />
           </div>
        </div>
      </div>
    </div>
  );
}
