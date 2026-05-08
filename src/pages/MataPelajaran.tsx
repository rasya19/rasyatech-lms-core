import React, { useState } from 'react';
import { 
  Search, Plus, Edit2, Trash2, 
  Book, GraduationCap, X, ShieldCheck, 
  Target, GraduationCap as JenjangIcon,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export interface MataPelajaranModel {
  id: string;
  kode: string;
  nama: string;
  jenjang: 'Paket A' | 'Paket B' | 'Paket C';
  kkm: number;
  guruPengampu: string[]; // List of Guru Names or IDs
}

export const DUMMY_MAPEL: MataPelajaranModel[] = [
  {
    id: 'M001',
    kode: 'MPL-001',
    nama: 'Matematika Dasar',
    jenjang: 'Paket A',
    kkm: 70,
    guruPengampu: ['Budi Santoso, S.Pd', 'Siti Aminah, M.Pd']
  },
  {
    id: 'M002',
    kode: 'MPL-002',
    nama: 'Bahasa Indonesia',
    jenjang: 'Paket B',
    kkm: 75,
    guruPengampu: ['Ahmad Yani, S.S']
  },
  {
    id: 'M003',
    kode: 'MPL-003',
    nama: 'Fisika Lanjutan',
    jenjang: 'Paket C',
    kkm: 75,
    guruPengampu: ['Drs. Joko Widodo']
  },
  {
    id: 'M004',
    kode: 'MPL-004',
    nama: 'Pendidikan Kewarganegaraan',
    jenjang: 'Paket C',
    kkm: 80,
    guruPengampu: []
  }
];

export default function MataPelajaran() {
  const [mapels, setMapels] = useState<MataPelajaranModel[]>(DUMMY_MAPEL);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenjang, setFilterJenjang] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [guruInput, setGuruInput] = useState('');
  
  const [formData, setFormData] = useState<Partial<MataPelajaranModel>>({
    kode: '',
    nama: '',
    jenjang: 'Paket C',
    kkm: 75,
    guruPengampu: []
  });

  const filteredMapels = mapels.filter(m => {
    const matchName = m.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      m.kode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchJenjang = filterJenjang === 'Semua' || m.jenjang === filterJenjang;
    return matchName && matchJenjang;
  });

  const handleOpenModal = (mapel?: MataPelajaranModel) => {
    if (mapel) {
      setFormData(mapel);
      setIsEditing(true);
    } else {
      setFormData({ kode: '', nama: '', jenjang: 'Paket C', kkm: 75, guruPengampu: [] });
      setIsEditing(false);
    }
    setGuruInput('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
      setMapels(mapels.filter(m => m.id !== id));
    }
  };

  const handleAddGuru = () => {
    if (guruInput.trim() !== '') {
      setFormData({
        ...formData,
        guruPengampu: [...(formData.guruPengampu || []), guruInput.trim()]
      });
      setGuruInput('');
    }
  };

  const handleRemoveGuru = (index: number) => {
    const newGuruList = [...(formData.guruPengampu || [])];
    newGuruList.splice(index, 1);
    setFormData({
      ...formData,
      guruPengampu: newGuruList
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) {
      setMapels(mapels.map(m => m.id === formData.id ? { ...formData } as MataPelajaranModel : m));
    } else {
      const newMapel: MataPelajaranModel = {
        ...formData as MataPelajaranModel,
        id: `M${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      };
      setMapels([...mapels, newMapel]);
    }
    setIsModalOpen(false);
  };

  const getJenjangColor = (jenjang: MataPelajaranModel['jenjang']) => {
    switch(jenjang) {
      case 'Paket A': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Paket B': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Paket C': return 'bg-violet-50 text-violet-700 border-violet-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 text-white p-8 rounded-3xl relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Book className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Master Data <span className="text-emerald-400 italic">Mapel</span></h1>
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest pl-1">Kelola Mata Pelajaran & Plotting Guru</p>
        </div>
        
        <div className="relative z-10 flex gap-4">
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" /> Tambah Mapel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96 flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan Kode atau Nama Mapel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="w-full md:w-48 shrink-0 relative">
            <select
              value={filterJenjang}
              onChange={(e) => setFilterJenjang(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
            >
              <option value="Semua">Semua Jenjang</option>
              <option value="Paket A">Paket A (Setara SD)</option>
              <option value="Paket B">Paket B (Setara SMP)</option>
              <option value="Paket C">Paket C (Setara SMA)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <JenjangIcon className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kode Mapel</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Mapel</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Jenjang / Paket</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">KKM</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest max-w-[200px]">Guru Pengampu</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMapels.map((mapel) => (
                <tr key={mapel.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600 font-mono tracking-wider bg-slate-100 px-2 py-1 rounded-md border border-slate-200">{mapel.kode}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-800 tracking-tight">{mapel.nama}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border", getJenjangColor(mapel.jenjang))}>
                      {mapel.jenjang}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-black text-slate-700">{mapel.kkm}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[250px]">
                    {mapel.guruPengampu.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {mapel.guruPengampu.map((guru, idx) => (
                          <span key={idx} className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Users className="w-3 h-3" /> {guru}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 italic">Belum diplot</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(mapel)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip tooltip-left"
                        data-tip="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(mapel.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip tooltip-left"
                        data-tip="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMapels.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                      Tidak ada data mata pelajaran yang ditemukan.
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                       <div className="p-2 bg-emerald-500/20 rounded-xl">
                          <Book className="w-5 h-5 text-emerald-400" />
                       </div>
                       <div>
                          <h3 className="font-black text-white uppercase tracking-widest text-lg leading-tight">
                             {isEditing ? 'Edit' : 'Tambah'} <span className="text-emerald-400 italic">Mapel</span>
                          </h3>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Lengkapi formulir mata pelajaran</p>
                       </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors relative z-10 w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                 <form id="mapel-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kode Mapel</label>
                         <input 
                           type="text" 
                           required
                           value={formData.kode}
                           onChange={e => setFormData({...formData, kode: e.target.value})}
                           placeholder="Contoh: MPL-005"
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nilai KKM</label>
                         <input 
                           type="number" 
                           required
                           min="0"
                           max="100"
                           value={formData.kkm}
                           onChange={e => setFormData({...formData, kkm: parseInt(e.target.value) || 0})}
                           placeholder="75"
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                         />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Mata Pelajaran</label>
                         <input 
                           type="text" 
                           required
                           value={formData.nama}
                           onChange={e => setFormData({...formData, nama: e.target.value})}
                           placeholder="Contoh: Sejarah Nasional"
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                         />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><JenjangIcon className="w-3 h-3" /> Jenjang / Paket</label>
                         <select 
                           required
                           value={formData.jenjang}
                           onChange={e => setFormData({...formData, jenjang: e.target.value as MataPelajaranModel['jenjang']})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                         >
                            <option value="Paket A">Paket A (Setara SD)</option>
                            <option value="Paket B">Paket B (Setara SMP)</option>
                            <option value="Paket C">Paket C (Setara SMA)</option>
                         </select>
                       </div>
                       
                       {/* Plotting Guru - Simplistic Approach */}
                       <div className="space-y-3 md:col-span-2 pt-4 border-t border-slate-100">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Users className="w-3 h-3" /> Plotting Guru Pengampu</label>
                         
                         <div className="flex gap-2">
                           <input 
                             type="text" 
                             value={guruInput}
                             onChange={e => setGuruInput(e.target.value)}
                             onKeyDown={e => {
                               if(e.key === 'Enter') {
                                 e.preventDefault();
                                 handleAddGuru();
                               }
                             }}
                             placeholder="Ketik nama guru pengajar..."
                             className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                           />
                           <button 
                             type="button" 
                             onClick={handleAddGuru}
                             className="bg-slate-800 text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
                           >
                              Tambah
                           </button>
                         </div>
                         
                         {formData.guruPengampu && formData.guruPengampu.length > 0 && (
                           <div className="flex flex-col gap-2 mt-2">
                             {formData.guruPengampu.map((guru, index) => (
                               <div key={index} className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg">
                                  <span className="text-xs font-bold text-indigo-800 flex items-center gap-2"><Users className="w-3.5 h-3.5 text-indigo-400" /> {guru}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveGuru(index)}
                                    className="p-1 hover:bg-indigo-100 rounded-md text-indigo-500 hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                             ))}
                           </div>
                         )}
                         {(!formData.guruPengampu || formData.guruPengampu.length === 0) && (
                           <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                             <p className="text-[10px] text-slate-400 font-medium italic">Belum ada guru yang diplot untuk matpel ini.</p>
                           </div>
                         )}
                       </div>

                    </div>
                 </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
                 <button 
                   type="button"
                   onClick={() => setIsModalOpen(false)}
                   className="flex-1 bg-white text-slate-600 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all"
                 >
                   Batal
                 </button>
                 <button 
                   form="mapel-form"
                   type="submit"
                   className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                   <ShieldCheck className="w-4 h-4" /> {isEditing ? 'Simpan Perubahan' : 'Simpan Mapel'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
