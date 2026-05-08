import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Search, Plus, Layers, Edit2, Trash2, 
  FileText, CheckCircle2, MoreVertical, BookOpen, Clock, Settings, X, SearchIcon, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { DUMMY_MAPEL } from './MataPelajaran';

interface BankSoalModel {
  id: string;
  nama_ujian: string;
  mapel_id?: string;
  jumlah_soal?: number;
  durasi?: number; // in minutes
  is_aktif?: boolean;
}

export default function BankSoal() {
  const navigate = useNavigate();
  const [bankSoals, setBankSoals] = useState<BankSoalModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BankSoalModel>>({
    nama_ujian: '',
    mapel_id: '',
    jumlah_soal: 0,
    durasi: 60,
    is_aktif: false
  });

  useEffect(() => {
    fetchBankSoal();
  }, []);

  const fetchBankSoal = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('bank_soal').select('*').order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      setBankSoals(data || []);
    } catch (error: any) {
      console.error('Error fetching bank soal:', error);
      alert('Gagal mengambil data ujian. ' + (error.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const getMapel = (id: string) => DUMMY_MAPEL.find(m => m.id === id);

  const filteredBankSoals = bankSoals.filter(bs => {
    return bs.nama_ujian?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenModal = (bs?: BankSoalModel) => {
    if (bs) {
      setFormData(bs);
      setIsEditing(true);
    } else {
      setFormData({
        nama_ujian: '',
        mapel_id: '',
        jumlah_soal: 0,
        durasi: 60,
        is_aktif: false
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleToggleAktif = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('bank_soal').update({ is_aktif: !currentStatus }).eq('id', id);
      if (error) throw error;
      setBankSoals(bankSoals.map(bs => 
        bs.id === id ? { ...bs, is_aktif: !currentStatus } : bs
      ));
    } catch (err: any) {
      alert('Gagal toggle status: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
         const { error } = await supabase.from('bank_soal').update({
            nama_ujian: formData.nama_ujian,
            mapel_id: formData.mapel_id,
            jumlah_soal: formData.jumlah_soal,
            durasi: formData.durasi,
            is_aktif: formData.is_aktif
         }).eq('id', formData.id);
         if (error) throw error;
      } else {
         const { error } = await supabase.from('bank_soal').insert([{
            nama_ujian: formData.nama_ujian,
            mapel_id: formData.mapel_id,
            jumlah_soal: formData.jumlah_soal,
            durasi: formData.durasi,
            is_aktif: formData.is_aktif
         }]);
         if (error) throw error;
      }
      setIsModalOpen(false);
      fetchBankSoal();
    } catch (err: any) {
      alert('Gagal menyimpan data: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 text-white p-8 rounded-3xl relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <Layers className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Kelola <span className="text-emerald-400 italic">Ujian</span></h1>
          </div>
          <p className="text-[11px] text-emerald-400/60 font-bold uppercase tracking-widest pl-1">Manajemen Judul dan Butir Soal Ujian</p>
        </div>
        
        <div className="relative z-10 flex gap-4">
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 border border-emerald-500"
          >
            <Plus className="w-4 h-4" /> Buat Judul Ujian
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6">
        {/* Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96 flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama ujian..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* List Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80">
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Ujian</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Jumlah Soal</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Durasi</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBankSoals.length > 0 ? (
                filteredBankSoals.map((bs) => {
                  const mapel = getMapel(bs.mapel_id || '');
                  return (
                    <tr key={bs.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{bs.nama_ujian}</p>
                          <p className="text-[10px] font-mono font-bold text-emerald-600 mt-1">{bs.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{mapel?.nama || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                          {bs.jumlah_soal} Butir
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs font-bold">{bs.durasi} Menit</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => handleToggleAktif(bs.id, bs.is_aktif || false)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto transition-all border",
                            bs.is_aktif 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" 
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full", bs.is_aktif ? "bg-emerald-500" : "bg-slate-400")} />
                          {bs.is_aktif ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(_) => {
                              const prefix = window.location.pathname.startsWith('/s/') 
                                ? `/s/${window.location.pathname.split('/')[2]}` 
                                : '';
                              navigate(`${prefix}/dashboard/soal/${bs.id}/detail`);
                            }}
                            className="p-2 text-white bg-slate-800 hover:bg-emerald-600 rounded-lg transition-colors tooltip tooltip-left shadow-sm flex items-center gap-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            title="Kelola Butir Soal"
                          >
                             <FileText className="w-4 h-4" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Buat Soal / Edit</span>
                          </button>
                          <button 
                            onClick={() => handleOpenModal(bs)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-colors"
                            title="Pengaturan"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center border-t border-dashed border-slate-200">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                        <Layers className="w-6 h-6 text-slate-300" />
                      </div>
                      <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Kosong</h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Belum ada bank soal atau pencarian tidak ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Modal Form */}
       <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-950 p-6 flex flex-col relative shrink-0">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
                 <div className="relative z-10 flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                          <Layers className="w-5 h-5 text-emerald-400" />
                       </div>
                       <div>
                          <h3 className="font-black text-white uppercase tracking-widest text-lg leading-tight">
                             {isEditing ? 'Edit' : 'Tambah'} <span className="text-emerald-400 italic">Judul Ujian</span>
                          </h3>
                          <p className="text-[9px] text-emerald-400/60 font-bold uppercase tracking-widest">Pengaturan Ujian</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
                 <form id="banksoal-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Ujian</label>
                       <input 
                         type="text" 
                         required
                         value={formData.nama_ujian}
                         onChange={e => setFormData({...formData, nama_ujian: e.target.value})}
                         placeholder="Contoh: Ujian Tengah Semester Ganjil"
                         className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</label>
                       <select
                         required
                         value={formData.mapel_id}
                         onChange={e => setFormData({...formData, mapel_id: e.target.value})}
                         className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                       >
                         <option value="" disabled>Pilih Mata Pelajaran...</option>
                         {DUMMY_MAPEL.map((m) => (
                            <option key={m.id} value={m.id}>{m.nama} ({m.jenjang})</option>
                         ))}
                       </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Durasi Ujian (Menit)</label>
                            <input 
                              type="number" 
                              required
                              min="1"
                              value={formData.durasi}
                              onChange={e => setFormData({...formData, durasi: parseInt(e.target.value) || 0})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Jml Soal</label>
                            <input 
                              type="number" 
                              min="0"
                              value={formData.jumlah_soal}
                              onChange={e => setFormData({...formData, jumlah_soal: parseInt(e.target.value) || 0})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-bold text-slate-800">Status Aktif</p>
                          <p className="text-[10px] font-bold text-slate-500">Soal bisa diakses oleh siswa</p>
                       </div>
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, is_aktif: !formData.is_aktif})}
                         className={cn(
                           "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                           formData.is_aktif ? "bg-emerald-500" : "bg-slate-300"
                         )}
                       >
                         <span 
                           className={cn(
                             "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                             formData.is_aktif ? "translate-x-6" : "translate-x-1"
                           )}
                         />
                       </button>
                    </div>
                 </form>
              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
                 <button 
                   type="button"
                   onClick={() => setIsModalOpen(false)}
                   className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                 >
                   Batal
                 </button>
                 <button 
                   form="banksoal-form"
                   type="submit"
                   className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                   <ShieldCheck className="w-4 h-4" /> {isEditing ? 'Simpan Perubahan' : 'Buat Judul Ujian'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

