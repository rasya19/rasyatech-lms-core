import React, { useState, useEffect } from 'react';
import { Layers, Users, Plus, ListFilter, MoreVertical, GraduationCap, X, Check, Search, Pencil, Trash2, ArrowLeft, TrendingUp, Sparkles, Loader2, Download, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import { fetchKelasFromSheet, pushDataToSheet } from '../services/apiService';

interface ClassData {
  id: string;
  name: string;
  wali: string;
  siswaCount: number;
  label: string;
}

const INITIAL_CLASSES: ClassData[] = [
  { id: '1', name: 'Kelas 10 - Paket C', wali: 'Dra. Siti Aminah', siswaCount: 32, label: 'A' },
  { id: '2', name: 'Kelas 11 - Paket C', wali: 'Drs. Ahmad Yani', siswaCount: 28, label: 'A' },
  { id: '3', name: 'Kelas 12 - Paket C', wali: 'Ibu Ratna', siswaCount: 35, label: 'B' },
  { id: '4', name: 'Kelas 9 - Paket B', wali: 'Bp. Suryadi', siswaCount: 24, label: 'A' },
];

export default function Kelas() {
  const [classes, setClasses] = useState<ClassData[]>(() => {
    const saved = localStorage.getItem('school_classes_list');
    if (saved) return JSON.parse(saved);
    return INITIAL_CLASSES;
  });

  useEffect(() => {
    localStorage.setItem('school_classes_list', JSON.stringify(classes));
  }, [classes]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [isManagingStudents, setIsManagingStudents] = useState<ClassData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    wali: '',
    label: 'A',
    siswaCount: 0
  });

  const handleOpenModal = (c?: ClassData) => {
    if (c) {
      setEditingClass(c);
      setFormData({
        name: c.name,
        wali: c.wali,
        label: c.label,
        siswaCount: c.siswaCount
      });
    } else {
      setEditingClass(null);
      setFormData({ name: '', wali: '', label: 'A', siswaCount: 0 });
    }
    setIsModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const autoPushKelas = async (list: ClassData[]) => {
    const url = import.meta.env.VITE_APP_URL || '';
    if (!url) return;
    try {
      const header = ["Nama Kelas", "Wali Kelas", "Label", "Jumlah Siswa"];
      const rows = list.map(c => [c.name, c.wali, c.label, c.siswaCount]);
      await pushDataToSheet(url, 'Kelas', [header, ...rows]);
    } catch (e) {
      console.error("Auto-sync error", e);
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let newList;
      if (editingClass) {
        newList = classes.map(c => c.id === editingClass.id ? { ...c, ...formData } : c);
      } else {
        const newClass: ClassData = {
          id: Math.random().toString(36).substr(2, 9),
          ...formData
        };
        newList = [...classes, newClass];
      }
      setClasses(newList);
      await autoPushKelas(newList);
      setIsModalOpen(false);
      setEditingClass(null);
      setFormData({ name: '', wali: '', label: 'A', siswaCount: 0 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicateClasses = () => {
    if (confirm('Duplikasi struktur kelas saat ini untuk tahun ajaran baru?')) {
      const duplicated = classes.map(c => ({
        ...c,
        id: Math.random().toString(36).substr(2, 9),
        siswaCount: 0 // Reset jumlah siswa untuk kelas baru
      }));
      setClasses([...classes, ...duplicated]);
      alert('Struktur kelas berhasil diduplikasi.');
    }
  };

  const handleAddStudentToClass = () => {
    const name = prompt('Masukkan nama siswa yang ingin ditambahkan:');
    if (name && isManagingStudents) {
      setClasses(classes.map(c => 
        c.id === isManagingStudents.id 
          ? { ...c, siswaCount: c.siswaCount + 1 } 
          : c
      ));
      setIsManagingStudents({ ...isManagingStudents, siswaCount: isManagingStudents.siswaCount + 1 });
      alert(`${name} berhasil ditambahkan ke kelas.`);
    }
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Hapus kelas ini?')) {
      const newList = classes.filter(c => c.id !== id);
      setClasses(newList);
      autoPushKelas(newList);
    }
  };

  const [isGradePromotionOpen, setIsGradePromotionOpen] = useState(false);
  const [promotionSourceClass, setPromotionSourceClass] = useState<string>('');
  const [promotionTargetClass, setPromotionTargetClass] = useState<string>('');
  const [selectedPromotionStudents, setSelectedPromotionStudents] = useState<Set<string>>(new Set());

  const handleProcessPromotion = () => {
    if (!promotionTargetClass) {
      alert('Pilih kelas tujuan terlebih dahulu!');
      return;
    }
    
    if (selectedPromotionStudents.size === 0) {
      alert('Pilih minimal satu siswa untuk diproses!');
      return;
    }

    const savedSiswa = localStorage.getItem('school_siswa_list');
    if (!savedSiswa) return;

    let siswaList = JSON.parse(savedSiswa);
    const targetClass = classes.find(c => c.id === promotionTargetClass);

    siswaList = siswaList.map((s: any) => {
      if (selectedPromotionStudents.has(s.id)) {
        return { ...s, kelas: targetClass?.name || s.kelas };
      }
      return s;
    });

    localStorage.setItem('school_siswa_list', JSON.stringify(siswaList));
    
    // Update local classes state if needed (student counts)
    const updatedClasses = classes.map(c => {
      if (c.id === promotionSourceClass) return { ...c, students: c.students - selectedPromotionStudents.size };
      if (c.id === promotionTargetClass) return { ...c, students: c.students + selectedPromotionStudents.size };
      return c;
    });
    setClasses(updatedClasses);

    alert(`Berhasil memproses kenaikan ${selectedPromotionStudents.size} siswa ke kelas ${targetClass?.name}.`);
    setIsGradePromotionOpen(false);
    setSelectedPromotionStudents(new Set());
  };

  const handleAddExistingStudent = (studentId: string) => {
    const savedSiswa = localStorage.getItem('school_siswa_list');
    if (!savedSiswa) return;
    
    let siswaList = JSON.parse(savedSiswa);
    siswaList = siswaList.map((s: any) => 
      s.id === studentId ? { ...s, kelas: isManagingStudents.name } : s
    );
    
    localStorage.setItem('school_siswa_list', JSON.stringify(siswaList));
    
    // Update local class count
    setClasses(classes.map(c => 
      c.id === isManagingStudents.id ? { ...c, students: c.students + 1 } : c
    ));
    
    alert('Siswa berhasil ditambahkan ke kelas.');
  };

  const handleAddNewStudentToClass = () => {
    const name = prompt('Nama Lengkap Siswa:');
    if (!name) return;
    const nisn = prompt('NISN Siswa:');
    if (!nisn) return;

    const savedSiswa = localStorage.getItem('school_siswa_list');
    const siswaList = savedSiswa ? JSON.parse(savedSiswa) : [];
    
    const newStudent = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      nisn,
      kelas: isManagingStudents.name,
      password: '12345',
      mustChangePassword: true,
      tanggalLahir: '2010-01-01',
      jk: 'Laki-Laki',
      alamat: '-'
    };

    const updatedSiswa = [...siswaList, newStudent];
    localStorage.setItem('school_siswa_list', JSON.stringify(updatedSiswa));
    
    setClasses(classes.map(c => 
      c.id === isManagingStudents.id ? { ...c, students: c.students + 1 } : c
    ));

    alert(`Siswa ${name} berhasil ditambahkan ke kelas ${isManagingStudents.name}`);
  };

  const [loadingSheet, setLoadingSheet] = useState(false);

  const handleSyncSpreadsheet = async () => {
    const url = import.meta.env.VITE_APP_URL || '';
    if (!url) {
      alert("URL Spreadsheet belum diatur di environment variable (VITE_APP_URL).");
      return;
    }

    setLoadingSheet(true);
    try {
      const data = await fetchKelasFromSheet(url);
      if (data.length > 0) {
        setClasses(data);
        alert(`Berhasil sinkronisasi ${data.length} data kelas dari spreadsheet.`);
      } else {
        alert("Tidak ada data ditemukan di spreadsheet sheet 'Kelas'.");
      }
    } catch (error) {
      alert("Gagal mengambil data. Pastikan URL Apps Script benar dan sheet bernama 'Kelas' sudah ada.");
    } finally {
      setLoadingSheet(false);
    }
  };

  const handlePushToSpreadsheet = async () => {
    const url = import.meta.env.VITE_APP_URL || '';
    if (!url) return alert("URL Spreadsheet belum diatur.");
    if (!confirm("Kirim data struktur Kelas ke Cloud?")) return;
    setLoadingSheet(true);
    try {
      const header = ["Nama Kelas", "Wali Kelas", "Label", "Jumlah Siswa"];
      const rows = classes.map(c => [c.name, c.wali, c.label, c.siswaCount]);
      await pushDataToSheet(url, 'Kelas', [header, ...rows]);
      alert("Data Kelas berhasil dikirim ke Cloud.");
    } catch (error) { alert("Gagal mengirim data."); }
    finally { setLoadingSheet(false); }
  };

  const handleDownloadClassStudents = (classData: ClassData) => {
    const allSiswa = JSON.parse(localStorage.getItem('school_siswa_list') || '[]');
    const studentsInClass = allSiswa.filter((s: any) => s.kelas === classData.name);
    
    if (studentsInClass.length === 0) {
      alert('Tidak ada siswa di kelas ini untuk diunduh.');
      return;
    }

    const dataToExport = studentsInClass.map((s: any, index: number) => ({
      'No': index + 1,
      'Nama': s.name,
      'NISN': s.nisn,
      'Jenis Kelamin': s.jk,
      'Tempat Lahir': s.tempatLahir || '-',
      'Tanggal Lahir': s.tanggalLahir || '-',
      'Alamat': s.alamat || '-',
      'Paket': s.paket || '-',
      'Status': s.status || 'Aktif',
      'No HP': s.noHp || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Siswa');
    XLSX.writeFile(workbook, `Daftar_Siswa_${classData.name.replace(/\s+/g, '_')}.xlsx`);
  };

  if (isGradePromotionOpen) {
    const sourceClass = classes.find(c => c.id === promotionSourceClass);
    const allSiswa = JSON.parse(localStorage.getItem('school_siswa_list') || '[]');
    const studentsInClass = allSiswa.filter((s: any) => s.kelas === sourceClass?.name);

    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsGradePromotionOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-brand-text-main tracking-tight uppercase">Proses <span className="text-brand-accent italic">Kenaikan Kelas</span></h2>
            <p className="text-[10px] text-brand-text-muted font-bold tracking-widest mt-1 uppercase">Dari Kelas: {sourceClass?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-brand-border flex justify-between items-center">
                <span className="text-[10px] font-black text-brand-sidebar uppercase italic tracking-widest">Pilih Siswa ({selectedPromotionStudents.size})</span>
                <button 
                  onClick={() => {
                    if (selectedPromotionStudents.size === studentsInClass.length) setSelectedPromotionStudents(new Set());
                    else setSelectedPromotionStudents(new Set(studentsInClass.map((s: any) => s.id)));
                  }}
                  className="text-[9px] font-bold text-brand-accent uppercase underline"
                >
                  {selectedPromotionStudents.size === studentsInClass.length ? 'Batal Semua' : 'Pilih Semua'}
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {studentsInClass.length > 0 ? (
                  studentsInClass.map((s: any) => (
                    <div 
                      key={s.id} 
                      onClick={() => {
                        const next = new Set(selectedPromotionStudents);
                        if (next.has(s.id)) next.delete(s.id);
                        else next.add(s.id);
                        setSelectedPromotionStudents(next);
                      }}
                      className={cn(
                        "p-4 border-b border-slate-50 flex items-center gap-3 cursor-pointer transition-colors",
                        selectedPromotionStudents.has(s.id) ? "bg-brand-accent/5" : "hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                        selectedPromotionStudents.has(s.id) ? "bg-brand-accent border-brand-accent text-white" : "border-slate-300 bg-white"
                      )}>
                        {selectedPromotionStudents.has(s.id) && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-sidebar uppercase">{s.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium">NISN: {s.nisn}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-400 italic text-xs">Tidak ada siswa di kelas ini.</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
                <h4 className="text-[10px] font-black text-brand-sidebar uppercase italic tracking-widest mb-4">Kelas Tujuan</h4>
                <select 
                  className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent mb-6"
                  value={promotionTargetClass}
                  onChange={(e) => setPromotionTargetClass(e.target.value)}
                >
                  <option value="">-- Pilih Kelas Tujuan --</option>
                  {classes.filter(c => c.id !== promotionSourceClass).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="LULUS">ALUMNI / LULUS</option>
                </select>

                <button 
                  onClick={handleProcessPromotion}
                  disabled={selectedPromotionStudents.size === 0 || !promotionTargetClass}
                  className="w-full bg-brand-sidebar text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-brand-sidebar/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  Proses Kenaikan
                </button>
             </div>

             <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <p className="text-[10px] text-indigo-700 italic leading-relaxed">
                  Data nilai siswa akan tetap tersimpan di database lama. Perubahan ini hanya akan mengubah atribut "Kelas" pada data profil siswa.
                </p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (isManagingStudents) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-brand-border">
          <button 
            onClick={() => setIsManagingStudents(null)}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="h-8 w-[1px] bg-brand-border" />
          <div>
            <h2 className="text-sm font-black text-brand-sidebar uppercase italic tracking-widest leading-none">
              KELOLA SISWA: <span className="text-brand-accent">{isManagingStudents.name} ({isManagingStudents.label})</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">Wali Kelas: {isManagingStudents.wali}</p>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-[2rem] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-brand-border flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari nama siswa di kelas ini..."
                className="w-full bg-slate-50 border border-brand-border rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-bold outline-none focus:border-brand-accent transition-all"
              />
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-[1px] h-10 bg-brand-border hidden md:block" />
              <div className="flex items-center gap-2">
                <select 
                  id="student-select"
                  className="bg-slate-50 border border-brand-border rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none focus:border-brand-accent min-w-[200px]"
                >
                  <option value="">-- Tambah Siswa Terdaftar --</option>
                  {JSON.parse(localStorage.getItem('school_siswa_list') || '[]')
                    .filter((s: any) => !s.kelas || s.kelas === '')
                    .map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.paket})</option>
                    ))}
                </select>
                <button 
                  onClick={() => {
                    const select = document.getElementById('student-select') as HTMLSelectElement;
                    if (select.value) {
                      handleAddExistingStudent(select.value);
                      select.value = '';
                    }
                  }}
                  className="bg-brand-accent text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest italic shadow-lg shadow-brand-accent/20 hover:scale-105 transition-all"
                >
                  Tambah
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleDownloadClassStudents(isManagingStudents)}
                className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 italic shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
              >
                 <Download className="w-3.5 h-3.5" /> Unduh Daftar Siswa
              </button>
              <button 
                onClick={handleAddNewStudentToClass}
                className="bg-brand-sidebar text-white px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 italic shadow-lg shadow-brand-sidebar/20 hover:scale-105 transition-all"
              >
                 <Plus className="w-3.5 h-3.5" /> Tambah Siswa Baru Ke Kelas
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
             <table className="w-full border-collapse">
                <thead>
                   <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-brand-border">No</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-brand-border">Nama Siswa</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-brand-border">NISN</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-brand-border">Jenis Kelamin</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-brand-border">Aksi</th>
                   </tr>
                </thead>
                <tbody>
                   {JSON.parse(localStorage.getItem('school_siswa_list') || '[]')
                    .filter((s: any) => s.kelas === isManagingStudents.name)
                    .map((s: any, i: number) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4 text-[11px] font-bold text-slate-400">{i + 1}</td>
                         <td className="px-6 py-4 text-[11px] font-bold text-brand-text-main uppercase">{s.name}</td>
                         <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{s.nisn}</td>
                         <td className="px-6 py-4 text-[11px] font-bold text-slate-500 italic uppercase">{s.jk}</td>
                         <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                               <button 
                                 onClick={() => {
                                   const saved = localStorage.getItem('school_siswa_list');
                                   if (saved) {
                                     const list = JSON.parse(saved);
                                     const updated = list.map((item: any) => 
                                       item.id === s.id ? { ...item, kelas: '' } : item
                                     );
                                     localStorage.setItem('school_siswa_list', JSON.stringify(updated));
                                     setClasses(classes.map(c => c.id === isManagingStudents.id ? { ...c, students: c.students - 1 } : c));
                                     alert('Siswa dikeluarkan dari kelas.');
                                   }
                                 }}
                                 className="p-1.5 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg text-red-400 transition-all"
                                 title="Keluarkan dari Kelas"
                               >
                                 <Trash2 className="w-3.5 h-3.5" />
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-bold text-brand-text-main tracking-tight uppercase">Manajemen <span className="text-brand-accent italic">Kelas</span></h2>
          <p className="text-[10px] text-brand-text-muted font-bold tracking-widest uppercase italic">Total {classes.length} Rombongan Belajar</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSyncSpreadsheet}
            disabled={loadingSheet}
            className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-200 transition-all shadow-sm border border-emerald-200 disabled:opacity-50"
            title="Ambil data dari Cloud"
          >
            {loadingSheet ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Ambil
          </button>
          <button 
            onClick={handlePushToSpreadsheet}
            disabled={loadingSheet}
            className="flex items-center gap-2 bg-brand-sidebar text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-sidebar/90 transition-all shadow-sm disabled:opacity-50"
            title="Simpan data ke Cloud"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            Simpan
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-accent/20 hover:scale-105 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-brand-border p-6 hover:border-brand-accent transition-all group relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-brand-accent/10 transition-colors">
                <Layers className="w-8 h-8 text-slate-200 group-hover:text-brand-accent/30" />
             </div>
             
             <div className="relative z-10">
                <div className="w-10 h-10 bg-brand-bg border border-brand-border rounded-xl flex items-center justify-center mb-4 font-black text-brand-sidebar italic">
                   {c.label}
                </div>
                <h3 className="font-bold text-sm text-brand-text-main uppercase mb-1">{c.name}</h3>
                <div className="space-y-2 mt-4 pt-4 border-t border-brand-border">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Wali Kelas</span>
                      <span className="text-[10px] font-bold text-brand-text-main italic">{c.wali}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total Siswa</span>
                      <div className="flex items-center gap-1.5 bg-brand-bg px-2 py-0.5 rounded border border-brand-border">
                         <Users className="w-3 h-3 text-brand-accent" />
                         <span className="text-[10px] font-bold text-brand-text-main">{c.siswaCount}</span>
                      </div>
                   </div>
                </div>
                
                <div className="mt-6 flex gap-2">
                   <button 
                    onClick={() => setIsManagingStudents(c)}
                    className="flex-1 py-2 bg-slate-50 text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-brand-sidebar hover:text-white transition-all italic border border-brand-border"
                  >
                    Kelola Siswa
                  </button>
                  <button 
                    onClick={() => handleDownloadClassStudents(c)}
                    className="p-2 border border-brand-border rounded-lg hover:bg-brand-bg hover:text-brand-accent transition-colors text-emerald-500"
                    title="Unduh Daftar Siswa"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                   <button 
                    onClick={() => {
                      setPromotionSourceClass(c.id);
                      setIsGradePromotionOpen(true);
                    }}
                    className="p-2 border border-brand-border rounded-lg hover:bg-brand-bg hover:text-brand-accent transition-colors"
                    title="Kenaikan Kelas"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                  </button>
                   <button 
                    onClick={() => handleOpenModal(c)}
                    className="p-2 border border-brand-border rounded-lg hover:bg-brand-bg hover:text-brand-accent transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                   <button 
                    onClick={() => handleDeleteClass(c.id)}
                    className="p-2 border border-brand-border rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
             </div>
          </div>
        ))}
        
        <button 
          onClick={handleDuplicateClasses}
          className="border-2 border-dashed border-brand-border rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-accent hover:text-brand-accent transition-all group"
        >
           <div className="p-3 bg-slate-50 rounded-full group-hover:bg-brand-accent/10 transition-colors">
              <Plus className="w-6 h-6" />
           </div>
           <span className="text-[10px] font-bold uppercase tracking-widest italic">Duplikasi Struktur Kelas</span>
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 overflow-hidden border border-brand-border"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black text-brand-sidebar uppercase italic tracking-widest">
                    {editingClass ? 'UBAH' : 'TAMBAH'} <span className="text-brand-accent">KELAS</span>
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                <form onSubmit={handleSaveClass} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Nama Rombel / Kelas</label>
                    <input 
                      type="text" required value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Contoh: Kelas 10 - Paket C"
                      className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold focus:border-brand-accent outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Wali Kelas</label>
                    <input 
                      type="text" required value={formData.wali}
                      onChange={(e) => setFormData({...formData, wali: e.target.value})}
                      placeholder="Masukkan nama guru"
                      className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold focus:border-brand-accent outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Label Ruang (Data Ruang)</label>
                      <select 
                        value={formData.label}
                        onChange={(e) => setFormData({...formData, label: e.target.value})}
                        className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold focus:border-brand-accent outline-none"
                      >
                        {['A', 'B', 'C', 'D', 'E', 'F'].map(l => <option key={l} value={l}>Ruang {l}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Kapasitas</label>
                      <input 
                        type="number" value={formData.siswaCount}
                        onChange={(e) => setFormData({...formData, siswaCount: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold focus:border-brand-accent outline-none"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full bg-brand-sidebar text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] mt-4 flex items-center justify-center gap-2 italic disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 
                    {isSaving ? 'Menyimpan...' : (editingClass ? 'Simpan Perubahan' : 'Simpan Struktur Kelas')}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

