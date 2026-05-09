import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  Plus, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  BookOpen,
  Pencil,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface Relation {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  subject: string;
  jam: string;
  hari: string;
}

export default function Relasi() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchSchoolClasses = async () => {
      const { data } = await supabase.from('kelas').select('id, nama_kelas').order('nama_kelas', { ascending: true });
      if (data) {
        setSchoolClasses(data.map((d: any) => ({ id: d.id, name: d.nama_kelas })));
      }
    };
    fetchSchoolClasses();
  }, []);
  const [subjects, setSubjects] = useState<any[]>(() => {
    const saved = localStorage.getItem('school_mapel_list');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      const { data } = await supabase.from('profiles_guru').select('id, nama').order('nama', { ascending: true });
      if (data) setTeachers(data);
    };
    fetchTeachers();
  }, []);

  const [relations, setRelations] = useState<Relation[]>(() => {
    const saved = localStorage.getItem('school_relations_list');
    if (saved) return JSON.parse(saved);
    return [
      { 
        id: '1', 
        teacherId: '1', 
        teacherName: 'Budi Santoso, S.Pd', 
        classId: '1', 
        className: 'X-IPA-1', 
        subject: 'Matematika Dasar',
        hari: 'Senin',
        jam: '08:00 - 09:30'
      },
      { 
        id: '2', 
        teacherId: '2', 
        teacherName: 'Siti Aminah, M.Pd', 
        classId: '2', 
        className: 'X-IPS-2', 
        subject: 'Bahasa Indonesia',
        hari: 'Selasa',
        jam: '10:00 - 11:30'
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('school_mapel_list', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('school_relations_list', JSON.stringify(relations));
  }, [relations]);

  const [editingSubject, setEditingSubject] = useState<{id: string, name: string} | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  
  const [formData, setFormData] = useState({
    teacherId: '',
    subject: '',
    hari: 'Senin',
    jam: ''
  });
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const handleDelete = (id: string) => {
    setRelations(relations.filter(r => r.id !== id));
  };

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      setSubjects([...subjects, { id: Math.random().toString(36).substr(2, 9), name: newSubjectName }]);
      setNewSubjectName('');
    }
  };

  const handleUpdateSubject = () => {
    if (editingSubject && editingSubject.name.trim()) {
      setSubjects(subjects.map(s => s.id === editingSubject.id ? editingSubject : s));
      setEditingSubject(null);
    }
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleAdd = () => {
    const teacher = teachers.find(t => t.id === formData.teacherId);

    if (teacher && selectedClasses.length > 0 && formData.subject && formData.jam) {
      const newRelations: Relation[] = selectedClasses.map(classId => {
        const kelas = schoolClasses.find(k => k.id === classId);
        return {
          id: Math.random().toString(36).substr(2, 9),
          teacherId: teacher.id,
          teacherName: teacher.nama || teacher.name, // in case of 'nama' field in Supabase
          classId: classId,
          className: kelas?.name || 'Unknown',
          subject: formData.subject,
          hari: formData.hari,
          jam: formData.jam
        };
      });
      
      setRelations([...relations, ...newRelations]);
      setIsModalOpen(false);
      setFormData({ teacherId: '', subject: '', hari: 'Senin', jam: '' });
      setSelectedClasses([]);
    } else {
      alert('Mohon lengkapi semua data dan pilih minimal satu kelas.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-brand-sidebar uppercase italic tracking-tighter">Relasi <span className="text-brand-accent">Mengajar</span></h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Pemetaan Guru ke Kelas & Mata Pelajaran</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSubjectModalOpen(true)}
            className="border border-brand-border text-brand-sidebar px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all italic"
          >
            <BookOpen className="w-4 h-4" /> Kelola Mapel
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-sidebar text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand-accent transition-all italic shadow-lg shadow-brand-sidebar/20"
          >
            <Plus className="w-4 h-4" /> Tambah Relasi Baru
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-brand-border flex items-center gap-4">
          <div className="p-3 bg-brand-accent/10 rounded-xl">
            <Users className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Guru</p>
            <p className="text-xl font-black text-brand-sidebar italic tracking-tighter">{teachers.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-brand-border flex items-center gap-4">
          <div className="p-3 bg-brand-sidebar/10 rounded-xl">
            <Layers className="w-6 h-6 text-brand-sidebar" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Kelas</p>
            <p className="text-xl font-black text-brand-sidebar italic tracking-tighter">{schoolClasses.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-brand-border flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Mapel</p>
            <p className="text-xl font-black text-brand-sidebar italic tracking-tighter">{subjects.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-brand-border flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Relasi Aktif</p>
            <p className="text-xl font-black text-brand-sidebar italic tracking-tighter">{relations.length}</p>
          </div>
        </div>
      </div>

      {/* List Layout - Kanban/Card Style for better mobile feel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {relations.map((rel) => (
          <motion.div 
            key={rel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-brand-border rounded-2xl overflow-hidden group hover:border-brand-accent transition-all shadow-sm"
          >
            <div className="p-5 border-b border-brand-border flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-sidebar text-white flex items-center justify-center font-bold italic shadow-md">
                    {rel.teacherName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-brand-sidebar uppercase italic tracking-tight">{rel.teacherName}</h3>
                    <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Pendidik Utama</p>
                  </div>
               </div>
               <button 
                onClick={() => handleDelete(rel.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
            
            <div className="p-5 grid grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                       <Layers className="w-3 h-3 text-slate-400" />
                       <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Target Kelas</span>
                    </div>
                    <p className="text-xs font-bold text-brand-sidebar">{rel.className}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                       <BookOpen className="w-3 h-3 text-slate-400" />
                       <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Mata Pelajaran</span>
                    </div>
                    <p className="text-xs font-bold text-brand-sidebar">{rel.subject}</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                       <Clock className="w-3 h-3 text-slate-400" />
                       <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Jadwal & Waktu</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-brand-accent uppercase">{rel.hari}</span>
                      <span className="text-xs font-bold text-brand-sidebar">{rel.jam}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                     <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full italic">
                        Terverifikasi
                     </span>
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Kelola Mapel */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-brand-sidebar/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-brand-border">
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-slate-50">
              <h2 className="text-sm font-bold text-brand-sidebar uppercase italic tracking-tighter">Kelola <span className="text-brand-accent">Mata Pelajaran</span></h2>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-brand-accent font-bold">×</button>
            </div>
            
            <div className="p-6 space-y-6">
               <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                    placeholder="Tambah Mapel Baru..."
                    className="flex-1 bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent"
                  />
                  <button 
                    type="button"
                    onClick={handleAddSubject}
                    className="p-3 bg-brand-sidebar text-white rounded-xl hover:bg-brand-accent transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
               </div>

                <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                  {subjects.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-brand-border transition-all">
                      {editingSubject?.id === s.id ? (
                        <>
                          <input 
                            type="text"
                            value={editingSubject.name}
                            onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateSubject()}
                            className="flex-1 bg-white border border-brand-accent rounded-lg px-2 py-1.5 text-xs font-bold outline-none mr-2"
                            autoFocus
                          />
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={handleUpdateSubject} 
                              className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                            >
                              Simpan
                            </button>
                            <button 
                              onClick={() => setEditingSubject(null)} 
                              className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-300 transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-brand-sidebar uppercase italic tracking-tight">{s.name}</span>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => setEditingSubject(s)} 
                              className="p-2 text-slate-400 hover:text-brand-accent hover:bg-white rounded-lg transition-all"
                              title="Edit Mapel"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSubject(s.id)} 
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                              title="Hapus Mapel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
               </div>

               <button 
                onClick={() => setIsSubjectModalOpen(false)}
                className="w-full py-3 bg-slate-100 text-brand-sidebar rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
               >
                 Selesai
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Relasi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-sidebar/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-brand-border">
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-slate-50">
              <h2 className="text-sm font-bold text-brand-sidebar uppercase italic tracking-tighter">Tambah <span className="text-brand-accent">Relasi Mengajar</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-brand-accent font-bold">×</button>
            </div>
            
            <div className="p-6 space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Pilih Guru</label>
                  <select 
                    value={formData.teacherId}
                    onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                    className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent cursor-pointer"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.nama || t.name}</option>)}
                  </select>
               </div>

               <div className="space-y-1.5">
                  <div className="flex justify-between items-center pl-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Target Kelas</label>
                    <span className="text-[9px] font-bold text-brand-accent">{selectedClasses.length} Dipilih</span>
                  </div>
                  <div className="bg-slate-50 border border-brand-border rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                    {schoolClasses.map(k => (
                      <label key={k.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                        <input 
                          type="checkbox" 
                          checked={selectedClasses.includes(k.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClasses([...selectedClasses, k.id]);
                            } else {
                              setSelectedClasses(selectedClasses.filter(id => id !== k.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent cursor-pointer"
                        />
                        <span className="text-xs font-bold text-brand-sidebar">{k.name}</span>
                      </label>
                    ))}
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Mata Pelajaran</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent"
                  >
                    <option value="">-- Pilih Mata Pelajaran --</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Hari</label>
                    <select 
                      value={formData.hari}
                      onChange={(e) => setFormData({...formData, hari: e.target.value})}
                      className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent"
                    >
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Jam Belajar</label>
                    <input 
                      type="text"
                      value={formData.jam}
                      onChange={(e) => setFormData({...formData, jam: e.target.value})}
                      placeholder="08:00 - 10:00"
                      className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent"
                    />
                  </div>
               </div>

               <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-brand-border rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleAdd}
                    className="flex-1 py-3 bg-brand-sidebar text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-accent transition-all italic"
                  >
                    Simpan Relasi
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
