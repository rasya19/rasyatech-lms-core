import React, { useState } from 'react';
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
  namaUjian: string;
  mapelId: string;
  jumlahSoal: parseInt;
  durasi: parseInt; // in minutes
  isAktif: boolean;
}

const DUMMY_BANK_SOAL: BankSoalModel[] = [
  {
    id: 'BS-001',
    namaUjian: 'Ujian Akhir Semester Ganjil',
    mapelId: 'M001',
    jumlahSoal: 40,
    durasi: 90,
    isAktif: true
  },
  {
    id: 'BS-002',
    namaUjian: 'Kuis Harian 1 - Tata Bahasa',
    mapelId: 'M001',
    jumlahSoal: 15,
    durasi: 30,
    isAktif: false
  },
  {
    id: 'BS-003',
    namaUjian: 'Ujian Tengah Semester',
    mapelId: 'M003',
    jumlahSoal: 50,
    durasi: 120,
    isAktif: true
  }
];

export default function BankSoal() {
  const navigate = useNavigate();
  const [bankSoals, setBankSoals] = useState<BankSoalModel[]>(DUMMY_BANK_SOAL);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<BankSoalModel, 'id'>>({
    namaUjian: '',
    mapelId: '',
    jumlahSoal: 0,
    durasi: 60,
    isAktif: false
  });

  const getMapel = (id: string) => DUMMY_MAPEL.find(m => m.id === id);

  const filteredBankSoals = bankSoals.filter(bs => {
    return bs.namaUjian.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenModal = (bs?: BankSoalModel) => {
    if (bs) {
      setFormData(bs);
      setIsEditing(true);
    } else {
      setFormData({
        namaUjian: '',
        mapelId: '',
        jumlahSoal: 0,
        durasi: 60,
        isAktif: false
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleToggleAktif = (id: string) => {
    setBankSoals(bankSoals.map(bs => 
      bs.id === id ? { ...bs, isAktif: !bs.isAktif } : bs
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setBankSoals(bankSoals.map(bs => 
        bs.id === (formData as BankSoalModel).id ? { ...formData, id: bs.id } as BankSoalModel : bs
      ));
    } else {
      const newId = `BS-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      setBankSoals([...bankSoals, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
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
            <h1 className="text-2xl font-black uppercase tracking-tight">Bank <span className="text-emerald-400 italic">Soal</span></h1>
          </div>
          <p className="text-[11px] text-emerald-400/60 font-bold uppercase tracking-widest pl-1">Kelola Kumpulan Soal Ujian</p>
        </div>
        
        <div className="relative z-10 flex gap-4">
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 border border-emerald-500"
          >
            <Plus className="w-4 h-4" /> Buat Bank Soal
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
                  const mapel = getMapel(bs.mapelId);
                  return (
                    <tr key={bs.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{bs.namaUjian}</p>
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
                          {bs.jumlahSoal} Butir
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
                          onClick={() => handleToggleAktif(bs.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto transition-all border",
                            bs.isAktif 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" 
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full", bs.isAktif ? "bg-emerald-500" : "bg-slate-400")} />
                          {bs.isAktif ? 'Aktif' : 'Nonaktif'}
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
                             {isEditing ? 'Edit' : 'Tambah'} <span className="text-emerald-400 italic">Bank Soal</span>
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
                         value={formData.namaUjian}
                         onChange={e => setFormData({...formData, namaUjian: e.target.value})}
                         placeholder="Contoh: Ujian Tengah Semester Ganjil"
                         className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</label>
                       <select
                         required
                         value={formData.mapelId}
                         onChange={e => setFormData({...formData, mapelId: e.target.value})}
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
                              value={formData.jumlahSoal}
                              onChange={e => setFormData({...formData, jumlahSoal: parseInt(e.target.value) || 0})}
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
                         onClick={() => setFormData({...formData, isAktif: !formData.isAktif})}
                         className={cn(
                           "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                           formData.isAktif ? "bg-emerald-500" : "bg-slate-300"
                         )}
                       >
                         <span 
                           className={cn(
                             "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                             formData.isAktif ? "translate-x-6" : "translate-x-1"
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
                   <ShieldCheck className="w-4 h-4" /> {isEditing ? 'Simpan Perubahan' : 'Buat Bank Soal'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

