import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Plus, GraduationCap, FileDown, FileUp, Download, RotateCcw, Trash2, Users, Sparkles, Loader2, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { cn } from '@/src/lib/utils';
import { useRef } from 'react';
import { fetchAlumniFromSheet, pushDataToSheet } from '../services/apiService';

interface AlumniMember {
  id: string;
  name: string;
  nisn?: string;
  lulus: string;
  program: string;
  status: string;
}

const INITIAL_ALUMNI: AlumniMember[] = [
  { id: '1', name: 'Andri Laksana', nisn: '1234567890', lulus: '2024', program: 'Paket C', status: 'Kuliah - UNY' },
  { id: '2', name: 'Maya Citra', nisn: '1234567891', lulus: '2023', program: 'Paket C', status: 'Bekerja - Admin' },
  { id: '3', name: 'Rudi Tabuti', nisn: '1234567892', lulus: '2023', program: 'Paket B', status: 'Lanjut Paket C' },
  { id: '4', name: 'Sinta Dewi', nisn: '1234567893', lulus: '2022', program: 'Paket C', status: 'Wirausaha' },
];

export default function Alumni() {
  const [alumni, setAlumni] = useState<AlumniMember[]>(() => {
    const saved = localStorage.getItem('school_alumni_list');
    if (saved) return JSON.parse(saved);
    return INITIAL_ALUMNI;
  });

  useEffect(() => {
    localStorage.setItem('school_alumni_list', JSON.stringify(alumni));
  }, [alumni]);

  const [searchTerm, setSearchTerm] = useState('');

  const exportToExcel = () => {
    const data = alumni.map(a => ({
       "Nama Alumni": a.name,
       "Tahun Lulus": a.lulus,
       "Program": a.program,
       "Status Pasca Lulus": a.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alumni");
    XLSX.writeFile(wb, "data_alumni.xlsx");
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    lulus: new Date().getFullYear().toString(),
    program: 'Paket C'
  });

  const getCandidates = () => {
    const savedSiswa = localStorage.getItem('school_siswa_list');
    const siswaList = savedSiswa ? JSON.parse(savedSiswa) : [];
    return siswaList.filter((s: any) => 
      s.paket === formData.program && 
      (s.status === 'Lulus' || s.status === 'Keluar')
    );
  };

  const autoPushAlumni = async (list: AlumniMember[]) => {
    const url = import.meta.env.VITE_APP_URL || '';
    if (!url) return;
    try {
      const header = ["Nama", "NISN", "Tahun Lulus", "Program", "Status"];
      const rows = list.map(a => [a.name, a.nisn, a.lulus, a.program, a.status]);
      await pushDataToSheet(url, 'Alumni', [header, ...rows]);
    } catch (e) {
      console.error("Auto-sync error", e);
    }
  };

  const handleBatchMigrate = () => {
    const candidates = getCandidates();
    if (candidates.length === 0) {
      alert(`Tidak ada siswa ${formData.program} dengan status 'Lulus' atau 'Keluar' yang ditemukan.`);
      return;
    }

    if (confirm(`Pindahkan ${candidates.length} siswa ke Database Alumni?`)) {
      const newAlumniEntries = candidates.map((s: any) => ({
        id: s.id,
        name: s.name,
        nisn: s.nisn,
        lulus: formData.lulus,
        program: s.paket,
        status: s.status === 'Lulus' ? 'Alumni - Lulus' : 'Keluar / DO'
      }));

      const updatedAlumni = [...alumni, ...newAlumniEntries];
      setAlumni(updatedAlumni);
      autoPushAlumni(updatedAlumni);

      // Remove from active students
      const savedSiswa = localStorage.getItem('school_siswa_list');
      const siswaList = savedSiswa ? JSON.parse(savedSiswa) : [];
      const updatedSiswa = siswaList.filter((s: any) => !candidates.find((c: any) => c.id === s.id));
      localStorage.setItem('school_siswa_list', JSON.stringify(updatedSiswa));

      setIsModalOpen(false);
      alert(`Berhasil memindahkan ${candidates.length} siswa ke Database Alumni.`);
    }
  };

  const handleRestore = (person: AlumniMember) => {
    if (confirm(`Kembalikan ${person.name} ke daftar Siswa Aktif?`)) {
      const savedSiswa = localStorage.getItem('school_siswa_list');
      const siswaList = savedSiswa ? JSON.parse(savedSiswa) : [];
      
      // Create a basic student record if they were removed
      const restoredSiswa = {
        id: person.id,
        name: person.name,
        nisn: person.nisn || '-',
        paket: person.program,
        status: 'Aktif',
        jk: 'Laki-Laki',
        mustChangePassword: true,
        password: '12345'
      };

      localStorage.setItem('school_siswa_list', JSON.stringify([...siswaList, restoredSiswa]));
      setAlumni(alumni.filter(a => a.id !== person.id));
      alert(`Berhasil mengembalikan ${person.name} ke Siswa Aktif.`);
    }
  };

  const handleDeleteAlumni = (id: string) => {
    if (confirm('Hapus selamanya data alumni ini?')) {
      const newList = alumni.filter(a => a.id !== id);
      setAlumni(newList);
      autoPushAlumni(newList);
    }
  };

  const [selectedYear, setSelectedYear] = useState('Semua Angkatan');

  const years = Array.from(new Set(alumni.map(a => a.lulus))).sort((a, b) => (b as string).localeCompare(a as string));

  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const data = [
      ["Nama Alumni", "NISN", "Tahun Lulus", "Program", "Status Pasca Lulus"],
      ["Andri Laksana", "1234567890", "2024", "Paket C", "Kuliah - UNY"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Alumni");
    XLSX.writeFile(wb, "template_import_alumni.xlsx");
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

      const importedAlumni: AlumniMember[] = data.map((item, index) => ({
        id: `imported-alumni-${Date.now()}-${index}`,
        name: item["Nama Alumni"] || item.name || '',
        nisn: String(item.NISN || item.nisn || ''),
        lulus: String(item["Tahun Lulus"] || item.lulus || new Date().getFullYear()),
        program: item.Program || item.program || 'Paket C',
        status: item["Status Pasca Lulus"] || item.status || 'Alumni'
      }));

      setAlumni([...alumni, ...importedAlumni]);
      alert(`${importedAlumni.length} data alumni berhasil diimport.`);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredAlumni = alumni.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.lulus.includes(searchTerm);
    const matchesYear = selectedYear === 'Semua Angkatan' || a.lulus === selectedYear;
    return matchesSearch && matchesYear;
  });

  const [loadingSheet, setLoadingSheet] = useState(false);

  const handleSyncSpreadsheet = async () => {
    const url = import.meta.env.VITE_APP_URL || '';
    if (!url) {
      alert("URL Spreadsheet belum diatur di environment variable (VITE_APP_URL).");
      return;
    }

    setLoadingSheet(true);
    try {
      const data = await fetchAlumniFromSheet(url);
      if (data.length > 0) {
        setAlumni(data);
        alert(`Berhasil sinkronisasi ${data.length} data alumni dari spreadsheet.`);
      } else {
        alert("Tidak ada data ditemukan di spreadsheet sheet 'Alumni'.");
      }
    } catch (error) {
      alert("Gagal mengambil data. Pastikan URL Apps Script benar dan sheet bernama 'Alumni' sudah ada.");
    } finally {
      setLoadingSheet(false);
    }
  };

  const handlePushToSpreadsheet = async () => {
    const url = import.meta.env.VITE_APP_URL || '';
    if (!url) return alert("URL Spreadsheet belum diatur.");
    if (!confirm("Kirim data Alumni ke Cloud?")) return;
    setLoadingSheet(true);
    try {
      const header = ["Nama", "NISN", "Tahun Lulus", "Program", "Status"];
      const rows = alumni.map(a => [a.name, a.nisn, a.lulus, a.program, a.status]);
      await pushDataToSheet(url, 'Alumni', [header, ...rows]);
      alert("Data Alumni berhasil disimpan ke Cloud.");
    } catch (error) { alert("Gagal mengirim data."); }
    finally { setLoadingSheet(false); }
  };

  return (
    <div className="space-y-6 max-w-5xl">
       <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        className="hidden" 
        accept=".xlsx, .xls"
      />
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-text-main tracking-tight uppercase">Database <span className="text-brand-accent italic">Alumni</span></h2>
          <p className="text-[10px] text-brand-text-muted font-bold tracking-widest italic opacity-70 border-l-2 border-brand-accent/20 pl-2 mt-1">Jejak Langkah Lulusan Armilla Nusa</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 bg-brand-bg border border-brand-border text-brand-text-main px-4 py-3 rounded-xl text-[10px] font-black hover:bg-white transition-all uppercase tracking-widest italic"
          >
            <Download className="w-3.5 h-3.5" /> Template
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-white border border-brand-border text-brand-text-main px-4 py-3 rounded-xl text-[10px] font-black hover:bg-slate-50 transition-all uppercase tracking-widest italic"
          >
            <FileUp className="w-3.5 h-3.5" /> Import
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-sidebar text-white px-6 py-3 rounded-xl text-[10px] font-black hover:bg-brand-sidebar/90 transition-all uppercase tracking-widest italic shadow-lg shadow-brand-sidebar/20"
          >
            <Plus className="w-3.5 h-3.5" /> Migrasi Lulusan
          </button>
        </div>
      </div>

      {/* Filter & Action Menu */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
        <div className="flex-1 w-full md:w-auto relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 inset-y-0 my-auto group-focus-within:text-brand-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nama atau tahun lulus..." 
            className="w-full bg-slate-50 border border-brand-border rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-brand-sidebar outline-none focus:border-brand-accent transition-all" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Users className="w-3.5 h-3.5 text-slate-400 absolute left-4 inset-y-0 my-auto" />
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-white border border-brand-border rounded-xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest italic outline-none focus:border-brand-accent transition-all cursor-pointer appearance-none"
            >
              <option value="Semua Angkatan">Semua Angkatan</option>
              {years.map(year => (
                <option key={year} value={year}>Angkatan {year}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={exportToExcel}
            className="flex items-center justify-center px-4 bg-white border border-brand-border text-brand-text-main rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
            title="Export Excel"
          >
            <FileDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 bg-slate-50 border-b border-brand-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-brand-sidebar uppercase">Registrasi <span className="text-brand-accent italic">Alumni</span></h3>
                    <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase italic">Input Data Lulusan Baru</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Tahun Lulus</label>
                    <input 
                      type="text" 
                      value={formData.lulus}
                      onChange={(e) => setFormData({...formData, lulus: e.target.value})}
                      placeholder="2024"
                      className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold text-brand-sidebar outline-none focus:border-brand-accent transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Program</label>
                    <select 
                      value={formData.program}
                      onChange={(e) => setFormData({...formData, program: e.target.value})}
                      className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold text-brand-sidebar outline-none focus:border-brand-accent transition-all"
                    >
                      <option value="Paket A">Paket A</option>
                      <option value="Paket B">Paket B</option>
                      <option value="Paket C">Paket C</option>
                    </select>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-orange-600 uppercase italic mb-2">Siswa Siap Lulus ({getCandidates().length})</p>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {getCandidates().length > 0 ? getCandidates().map((s: any) => (
                      <div key={s.id} className="flex justify-between items-center bg-white/50 p-2 rounded-lg border border-orange-200">
                        <span className="text-[11px] font-bold text-brand-sidebar">{s.name}</span>
                        <span className="text-[9px] font-black text-orange-500 uppercase">{s.status}</span>
                      </div>
                    )) : (
                      <p className="text-[10px] text-slate-400 italic">Tidak ada siswa dengan status 'Lulus' atau 'Keluar' pada program ini.</p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleBatchMigrate}
                  disabled={getCandidates().length === 0}
                  className="w-full bg-brand-sidebar text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-brand-sidebar/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                >
                  Pindahkan ke Alumni
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Alumni', value: alumni.length.toLocaleString(), icon: GraduationCap },
          { label: 'Lulus', value: alumni.filter(a => a.status.includes('Lulus')).length.toLocaleString(), icon: GraduationCap },
          { label: 'Keluar/DO', value: alumni.filter(a => a.status.includes('Keluar') || a.status.includes('DO')).length.toLocaleString(), icon: GraduationCap },
          { label: 'Wirausaha/Lain', value: alumni.filter(a => !a.status.includes('Lulus') && !a.status.includes('Keluar')).length.toLocaleString(), icon: GraduationCap },
        ].map((stat, i) => (
           <div key={i} className="bg-white p-4 rounded-xl border border-brand-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                 <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-lg font-bold text-brand-text-main leading-none mt-1 italic">{stat.value}</p>
              </div>
           </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-brand-border italic">Nama Alumni</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-brand-border text-center italic">Angkatan</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-brand-border text-center italic">Program</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-brand-border italic">Status Pasca Lulus</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 border-b border-brand-border"></th>
            </tr>
          </thead>
          <tbody>
            {filteredAlumni.map((a, i) => (
              <tr key={i} className="hover:bg-slate-50/70 transition-all group">
                <td className="px-6 py-4 border-b border-brand-border text-[11px] font-bold text-brand-text-main uppercase tracking-tight">{a.name}</td>
                <td className="px-6 py-4 border-b border-brand-border text-center text-[11px] text-slate-500 font-bold">{a.lulus}</td>
                <td className="px-6 py-4 border-b border-brand-border text-center text-[10px] font-bold text-slate-600 italic uppercase tracking-widest">{a.program}</td>
                <td className="px-6 py-4 border-b border-brand-border">
                  <span className="text-[10px] font-black bg-brand-accent/5 text-brand-accent px-3 py-1 rounded-full italic uppercase tracking-tighter">{a.status}</span>
                </td>
                <td className="px-6 py-4 border-b border-brand-border text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleRestore(a)}
                      className="p-1.5 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-100 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all"
                      title="Kembalikan ke Siswa Aktif"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAlumni(a.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      title="Hapus Permanen"
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
  );
}

