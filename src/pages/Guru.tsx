import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, MoreVertical, Plus, Download, X, Check, FileUp, FileDown, Edit2, Trash2, Sparkles, Loader2, CloudUpload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { fetchGuruFromSheet, pushDataToSheet } from '../services/apiService';

interface Teacher {
  id: string;
  name: string;
  mataPelajaran: string;
  nip: string;
  email?: string;
  phone?: string;
  alamat?: string;
}

const INITIAL_GURU: Teacher[] = [
  { id: '1', name: 'Dra. Siti Aminah', mataPelajaran: 'Bahasa Indonesia', nip: '1970051255', email: 'siti@armilla.edu', phone: '0812345678', alamat: 'Kuningan' },
  { id: '2', name: 'Drs. Ahmad Yani', mataPelajaran: 'Matematika', nip: '1975082012', email: 'ahmad@armilla.edu', phone: '0812345679', alamat: 'Cirebon' },
  { id: '3', name: 'Ibu Ratna', mataPelajaran: 'Keterampilan Menjahit', nip: 'Tenaga Ahli', email: 'ratna@armilla.edu', phone: '0812345680', alamat: 'Kuningan' },
  { id: '4', name: 'Bp. Suryadi', mataPelajaran: 'TIK', nip: '1982031544', email: 'suryadi@armilla.edu', phone: '0812345681', alamat: 'Majalengka' },
];

export default function Guru() {
  const [guruList, setGuruList] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('school_guru_list');
    if (saved) return JSON.parse(saved);
    return INITIAL_GURU;
  });

  useEffect(() => {
    localStorage.setItem('school_guru_list', JSON.stringify(guruList));
  }, [guruList]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Teacher | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    mataPelajaran: '',
    nip: '',
    email: '',
    phone: '',
    alamat: ''
  });

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingGuru(teacher);
      setFormData({
        name: teacher.name,
        mataPelajaran: teacher.mataPelajaran,
        nip: teacher.nip,
        email: teacher.email || '',
        phone: teacher.phone || '',
        alamat: teacher.alamat || ''
      });
    } else {
      setEditingGuru(null);
      setFormData({
        name: '',
        mataPelajaran: '',
        nip: '',
        email: '',
        phone: '',
        alamat: ''
      });
    }
    setIsModalOpen(true);
  };

  const autoPushGuru = async (list: Teacher[]) => {
    const url = import.meta.env.VITE_APP_URL || '';
    if (!url) return;
    try {
      const header = ["Nama", "NIP/ID", "ID Lain", "Email", "Telepon", "Mata Pelajaran", "Alamat"];
      const rows = list.map(g => [
        g.name, g.nip, g.nip, g.email || '', g.phone || '', g.mataPelajaran || '', g.alamat || ''
      ]);
      await pushDataToSheet(url, 'Guru', [header, ...rows]);
    } catch (e) {
      console.error("Auto-sync error", e);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let newList;
    if (editingGuru) {
      newList = guruList.map(g => g.id === editingGuru.id ? { ...g, ...formData } : g);
    } else {
      const newGuru: Teacher = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      };
      newList = [...guruList, newGuru];
    }
    setGuruList(newList);
    autoPushGuru(newList);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
      const newList = guruList.filter(g => g.id !== id);
      setGuruList(newList);
      autoPushGuru(newList);
    }
  };

  const downloadTemplate = () => {
    const data = [
      ["Nama", "NIP", "Email", "Telepon", "Mata Pelajaran"],
      ["Dra. Siti Aminah", "19700512...", "siti@email.com", "08123456789", "Bahasa Indonesia"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Guru");
    XLSX.writeFile(wb, "template_import_guru.xlsx");
  };

  const exportData = () => {
    const data = guruList.map(g => ({
      Nama: g.name,
      NIP: g.nip,
      Email: g.email,
      Telepon: g.phone,
      "Mata Pelajaran": g.mataPelajaran
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Guru");
    XLSX.writeFile(wb, "data_guru_export.xlsx");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const importedGuru: Teacher[] = data.map((item, index) => ({
        id: `imported-teacher-${Date.now()}-${index}`,
        name: item.Nama || item.name || '',
        nip: String(item.NIP || item.nip || ''),
        mataPelajaran: item["Mata Pelajaran"] || item.mataPelajaran || '',
        email: item.Email || item.email || '',
        phone: item.Telepon || item.phone || String(item.phone || '')
      }));

      const newList = [...guruList, ...importedGuru];
      setGuruList(newList);
      autoPushGuru(newList);
      alert(`${importedGuru.length} data guru berhasil diimport.`);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      const data = await fetchGuruFromSheet(url);
      if (data.length > 0) {
        setGuruList(data);
        alert(`Berhasil sinkronisasi ${data.length} data guru dari spreadsheet.`);
      } else {
        alert("Tidak ada data ditemukan di spreadsheet sheet 'Guru'.");
      }
    } catch (error) {
      alert("Gagal mengambil data. Pastikan URL Apps Script benar dan sheet bernama 'Guru' sudah ada.");
    } finally {
      setLoadingSheet(false);
    }
  };

  const handlePushToSpreadsheet = async () => {
    const url = import.meta.env.VITE_APP_URL || '';
    if (!url) {
      alert("URL Spreadsheet belum diatur di environment variable (VITE_APP_URL).");
      return;
    }

    if (!confirm("Ini akan mengirim seluruh data guru di platform ini ke Spreadsheet (Overwrite). Lanjutkan?")) return;

    setLoadingSheet(true);
    try {
      const header = ["Nama", "NIP/ID", "ID Lain", "Email", "Telepon", "Mata Pelajaran", "Alamat"];
      const rows = guruList.map(g => [
        g.name, g.nip, g.nip, g.email || '', g.phone || '', g.mataPelajaran || '', g.alamat || ''
      ]);

      await pushDataToSheet(url, 'Guru', [header, ...rows]);
      alert("Data guru berhasil dikirim ke Spreadsheet.");
    } catch (error) {
      alert("Gagal mengirim data.");
    } finally {
      setLoadingSheet(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx, .xls" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-text-main">Tenaga Pengajar</h2>
          <p className="text-xs text-brand-text-muted">Total {guruList.length} Guru dan Staf Terdaftar</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 bg-brand-bg border border-brand-border text-brand-text-main px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all italic"
          >
            <Download className="w-3.5 h-3.5" />
            Template
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-white border border-brand-border text-brand-text-main px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <FileUp className="w-3.5 h-3.5" />
            Import
          </button>
          <button 
            onClick={exportData}
            className="flex items-center gap-2 bg-white border border-brand-border text-brand-text-main px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export
          </button>
          <button 
            onClick={handleSyncSpreadsheet}
            disabled={loadingSheet}
            className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-200 transition-all shadow-sm border border-emerald-200 disabled:opacity-50"
            title="Ambil data dari Cloud"
          >
            {loadingSheet ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Ambil
          </button>
          <button 
            onClick={handlePushToSpreadsheet}
            disabled={loadingSheet}
            className="flex items-center gap-2 bg-brand-sidebar text-white px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-sidebar/90 transition-all shadow-sm disabled:opacity-50"
            title="Simpan data ke Cloud"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            Simpan
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:shadow-lg shadow-brand-accent/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Guru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {guruList.map((g) => (
          <motion.div 
            layout
            key={g.id} 
            className="bg-white p-4 rounded-xl border border-brand-border shadow-sm group hover:border-brand-accent transition-all flex flex-col items-center text-center relative"
          >
            <div className="absolute top-2 right-2 flex gap-2">
                       <button 
                         onClick={() => handleOpenModal(g)} 
                         className="p-1.5 bg-white border border-brand-border rounded-md transition-all text-slate-400 hover:text-brand-accent shadow-sm"
                         title="Edit Guru"
                       >
                         <Edit2 className="w-3 h-3" />
                       </button>
                       <button 
                         onClick={() => handleDelete(g.id)} 
                         className="p-1.5 bg-white border border-brand-border rounded-md transition-all text-slate-400 hover:text-red-500 shadow-sm"
                         title="Hapus Guru"
                       >
                         <Trash2 className="w-3 h-3" />
                       </button>
            </div>

            <div className="relative mb-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center font-bold text-brand-accent border-2 border-brand-border group-hover:border-brand-accent transition-colors text-lg">
                {g.name.split(' ').filter(n => n.length > 2).map(n => n[0]).join('').slice(0,2).toUpperCase() || g.name[0]}
              </div>
            </div>
            
            <div className="min-h-[40px]">
              <h3 className="font-bold text-xs text-brand-text-main uppercase mb-0.5">{g.name}</h3>
              <p className="text-[9px] text-brand-accent font-bold tracking-widest uppercase">{g.mataPelajaran}</p>
            </div>

            <div className="w-full mt-4 pt-4 border-t border-brand-border space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-bold group-hover:text-brand-text-main transition-colors">
                <Mail className="w-3 h-3" /> {g.email || 'Email Belum Ada'}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-bold group-hover:text-brand-text-main transition-colors">
                <Phone className="w-3 h-3" /> {g.phone || 'No. Telp Belum Ada'}
              </div>
            </div>
            
            <button 
              onClick={() => handleOpenModal(g)}
              className="w-full mt-4 py-2 bg-slate-50 group-hover:bg-brand-accent group-hover:text-white rounded-lg text-[9px] font-bold text-brand-text-muted transition-all uppercase tracking-widest"
            >
              Biodata Lengkap
            </button>
          </motion.div>
        ))}
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
              className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl relative z-10 overflow-hidden border border-brand-border"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-black text-brand-sidebar uppercase italic tracking-widest">
                      BIODATA <span className="text-brand-accent">GURU</span>
                    </h3>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nama Lengkap</label>
                      <input 
                        type="text" required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">NIP / ID Guru</label>
                      <input 
                        type="text" required
                        value={formData.nip}
                        onChange={(e) => setFormData({...formData, nip: e.target.value})}
                        className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Mata Pelajaran</label>
                    <input 
                      type="text" required
                      value={formData.mataPelajaran}
                      onChange={(e) => setFormData({...formData, mataPelajaran: e.target.value})}
                      className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Email</label>
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Telepon</label>
                      <input 
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Alamat</label>
                    <textarea 
                      value={formData.alamat}
                      onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                      className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none h-20 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-brand-border rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50">Batal</button>
                    <button type="submit" className="flex-1 px-4 py-3 bg-brand-sidebar text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <Check className="w-3.5 h-3.5" /> Simpan Data
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

