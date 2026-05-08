import React, { useState } from 'react';
import { 
  Search, Filter, Plus, Edit2, Trash2, 
  User, MapPin, GraduationCap, Upload, X, ShieldCheck, 
  Phone, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export interface Student {
  id: string;
  nisn: string;
  name: string;
  class: string;
  whatsapp: string;
  status: 'Aktif' | 'Nonaktif' | 'Lulus' | 'Pindah';
  photoUrl?: string;
}

export const DUMMY_STUDENTS: Student[] = [
  {
    id: 'S001',
    nisn: '0012345678',
    name: 'Ahmad Rafli',
    class: '10 IPA 1',
    whatsapp: '081234567890',
    status: 'Aktif'
  },
  {
    id: 'S002',
    nisn: '0012345679',
    name: 'Siti Najwa',
    class: '11 IPS 2',
    whatsapp: '081234567891',
    status: 'Aktif'
  },
  {
    id: 'S003',
    nisn: '0012345680',
    name: 'Budi Santoso',
    class: '12 IPA 3',
    whatsapp: '081234567892',
    status: 'Lulus'
  },
  {
    id: 'S004',
    nisn: '0012345681',
    name: 'Clara Bella',
    class: '10 IPS 1',
    whatsapp: '081234567893',
    status: 'Nonaktif'
  }
];

export default function DataSiswa() {
  const [students, setStudents] = useState<Student[]>(DUMMY_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Student>>({
    nisn: '',
    name: '',
    class: '',
    whatsapp: '',
    status: 'Aktif',
    photoUrl: ''
  });

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.nisn.includes(searchTerm)
  );

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setFormData(student);
      setIsEditing(true);
    } else {
      setFormData({ nisn: '', name: '', class: '', whatsapp: '', status: 'Aktif', photoUrl: '' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) {
      setStudents(students.map(s => s.id === formData.id ? { ...formData } as Student : s));
    } else {
      const newStudent: Student = {
        ...formData as Student,
        id: `S${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      };
      setStudents([...students, newStudent]);
    }
    setIsModalOpen(false);
  };

  const getStatusColor = (status: Student['status']) => {
    switch(status) {
      case 'Aktif': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Lulus': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Pindah': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Nonaktif': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <User className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Master Data <span className="text-emerald-400 italic">Siswa</span></h1>
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest pl-1">Kelola Identitas dan Profil Siswa</p>
        </div>
        
        <div className="relative z-10 flex gap-4">
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" /> Tambah Siswa
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan Nama Lengkap atau NISN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="bg-slate-50 text-slate-500 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-800 transition-all flex items-center gap-2 border border-slate-200">
               <Filter className="w-3 h-3" /> Filter Kelas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-20">Foto</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">NISN</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Lengkap</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kelas / Rombel</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">WhatsApp</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                       {student.photoUrl ? (
                         <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                       ) : (
                         <User className="w-5 h-5 text-slate-400" />
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600 font-mono tracking-wider">{student.nisn}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-800 tracking-tight">{student.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider border border-slate-200">
                      {student.class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {student.whatsapp || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border", getStatusColor(student.status))}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(student)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip tooltip-left"
                        data-tip="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip tooltip-left"
                        data-tip="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                      Tidak ada data siswa yang ditemukan.
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
              {/* Modal Header */}
              <div className="bg-slate-900 p-6 flex flex-col relative shrink-0">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
                 <div className="relative z-10 flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-emerald-500/20 rounded-xl">
                          <User className="w-5 h-5 text-emerald-400" />
                       </div>
                       <div>
                          <h3 className="font-black text-white uppercase tracking-widest text-lg leading-tight">
                             {isEditing ? 'Edit Data' : 'Tambah'} <span className="text-emerald-400 italic">Siswa</span>
                          </h3>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Lengkapi formulir di bawah ini</p>
                       </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors relative z-10 w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              {/* Form Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                 <form id="student-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo Area */}
                    <div className="flex flex-col items-center gap-3 pb-6 border-b border-slate-100">
                       <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                          {formData.photoUrl ? (
                             <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                          ) : (
                             <User className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Upload className="w-5 h-5 text-white" />
                          </div>
                       </div>
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest cursor-pointer hover:underline">Unggah Foto Siswa</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NISN</label>
                         <input 
                           type="text" 
                           required
                           value={formData.nisn}
                           onChange={e => setFormData({...formData, nisn: e.target.value})}
                           placeholder="Contoh: 0012345678"
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                         <input 
                           type="text" 
                           required
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           placeholder="Contoh: Ahmad Rafli"
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                         />
                       </div>
                       <div className="space-y-2 lg:col-span-1">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><GraduationCap className="w-3 h-3" /> Kelas / Rombel</label>
                         <input 
                           type="text" 
                           required
                           value={formData.class}
                           onChange={e => setFormData({...formData, class: e.target.value})}
                           placeholder="Contoh: 10 IPA 1"
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all uppercase"
                         />
                       </div>
                       <div className="space-y-2 lg:col-span-1">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> WhatsApp Aktif</label>
                         <input 
                           type="text" 
                           required
                           value={formData.whatsapp}
                           onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                           placeholder="Contoh: 0812..."
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                         />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">Status Siswa</label>
                         <select 
                           required
                           value={formData.status}
                           onChange={e => setFormData({...formData, status: e.target.value as Student['status']})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                         >
                            <option value="Aktif">Aktif</option>
                            <option value="Nonaktif">Nonaktif</option>
                            <option value="Lulus">Lulus</option>
                            <option value="Pindah">Pindah</option>
                         </select>
                       </div>
                    </div>
                 </form>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
                 <button 
                   type="button"
                   onClick={() => setIsModalOpen(false)}
                   className="flex-1 bg-white text-slate-600 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all"
                 >
                   Batal
                 </button>
                 <button 
                   form="student-form"
                   type="submit"
                   className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                   <ShieldCheck className="w-4 h-4" /> {isEditing ? 'Simpan Perubahan' : 'Simpan Data'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
