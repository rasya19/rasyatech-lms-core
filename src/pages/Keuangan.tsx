import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download, 
  Plus,
  CreditCard,
  History,
  TrendingUp,
  PieChart as PieChartIcon,
  Sparkles,
  Loader2,
  CloudUpload
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import { fetchKeuanganFromSheet, pushDataToSheet } from '../services/apiService';

interface Transaction {
  id: string;
  date: string;
  title: string;
  category: 'SPP' | 'BOS' | 'Operasional' | 'Gaji' | 'Lainnya';
  amount: number;
  type: 'pemasukan' | 'pengeluaran';
  status: 'selesai' | 'menunggu';
}

export default function Keuangan() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: '2026-05-01', title: 'Pembayaran SPP - Rasyid', category: 'SPP', amount: 250000, type: 'pemasukan', status: 'selesai' },
    { id: '2', date: '2026-05-02', title: 'Dana BOS Tahap I', category: 'BOS', amount: 15000000, type: 'pemasukan', status: 'selesai' },
    { id: '3', date: '2026-05-03', title: 'Listrik & Wifi Mei', category: 'Operasional', amount: 1200000, type: 'pengeluaran', status: 'selesai' },
    { id: '4', date: '2026-05-05', title: 'Gaji Guru Honorer', category: 'Gaji', amount: 5000000, type: 'pengeluaran', status: 'menunggu' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Lainnya' as Transaction['category'],
    amount: '',
    type: 'pemasukan' as Transaction['type']
  });

  const [filter, setFilter] = useState('all');

  const totalIncome = transactions.filter(t => t.type === 'pemasukan').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'pengeluaran').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const autoPushKeuangan = async (list: Transaction[]) => {
    const url = import.meta.env.VITE_APP_URL || '';
    if (!url) return;
    try {
      const header = ["Tanggal", "Keterangan", "Kategori", "Tipe", "Jumlah", "Status"];
      const rows = list.map(t => [t.date, t.title, t.category, t.type, t.amount, t.status]);
      await pushDataToSheet(url, 'Keuangan', [header, ...rows]);
    } catch (e) {
      console.error("Auto-sync error", e);
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: formData.date,
      title: formData.title,
      category: formData.category,
      amount: Number(formData.amount),
      type: formData.type,
      status: 'selesai'
    };
    const newList = [newTransaction, ...transactions];
    setTransactions(newList);
    autoPushKeuangan(newList);
    setIsModalOpen(false);
    setFormData({ 
      title: '', 
      date: new Date().toISOString().split('T')[0], 
      category: 'Lainnya', 
      amount: '', 
      type: 'pemasukan' 
    });
  };

  const [consultationLink, setConsultationLink] = useState(() => {
    return localStorage.getItem('school_consultation_link') || 'https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20konsultasi%20keuangan.';
  });

  const handleExport = () => {
    // Excel Export logic using XLSX
    const worksheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
      'Tanggal': t.date,
      'Deskripsi': t.title,
      'Kategori': t.category,
      'Tipe': t.type,
      'Jumlah': t.amount,
      'Status': t.status
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan');
    
    // Generate buffer and trigger download
    XLSX.writeFile(workbook, `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.xlsx`);

    // Also trigger print for visual report
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleConsultation = () => {
    window.open(consultationLink, '_blank');
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
      const data = await fetchKeuanganFromSheet(url);
      if (data.length > 0) {
        setTransactions(data);
        alert(`Berhasil sinkronisasi ${data.length} data transaksi dari spreadsheet.`);
      } else {
        alert("Tidak ada data ditemukan di spreadsheet sheet 'Keuangan'.");
      }
    } catch (error) {
      alert("Gagal mengambil data. Pastikan URL Apps Script benar dan sheet bernama 'Keuangan' sudah ada.");
    } finally {
      setLoadingSheet(false);
    }
  };

  const handlePushToSpreadsheet = async () => {
    const url = import.meta.env.VITE_APP_URL || '';
    if (!url) return alert("URL Spreadsheet belum diatur.");
    if (!confirm("Kirim data Keuangan ke Cloud (Overwrite)?")) return;
    setLoadingSheet(true);
    try {
      const header = ["Tanggal", "Keterangan", "Kategori", "Tipe", "Jumlah", "Status"];
      const rows = transactions.map(t => [t.date, t.title, t.category, t.type, t.amount, t.status]);
      await pushDataToSheet(url, 'Keuangan', [header, ...rows]);
      alert("Data Keuangan berhasil disimpan ke Cloud.");
    } catch (error) { alert("Gagal mengirim data."); }
    finally { setLoadingSheet(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm print:hidden">
        <div>
          <h1 className="text-xl font-bold text-brand-sidebar uppercase italic tracking-tighter">Manajemen <span className="text-brand-accent">Keuangan</span></h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Laporan Arus Kas & Administrasi Pembayaran</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="bg-slate-50 border border-brand-border text-brand-sidebar px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all italic"
          >
            <Download className="w-3.5 h-3.5" /> Unduh Laporan
          </button>
          <button 
            onClick={handleSyncSpreadsheet}
            disabled={loadingSheet}
            className="bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-200 transition-all italic shadow-sm border border-emerald-200 disabled:opacity-50"
          >
            {loadingSheet ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Ambil
          </button>
          <button 
            onClick={handlePushToSpreadsheet}
            disabled={loadingSheet}
            className="bg-brand-sidebar text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand-sidebar/90 transition-all italic shadow-sm disabled:opacity-50"
          >
            <CloudUpload className="w-3.5 h-3.5" /> Simpan
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-sidebar text-white px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand-accent transition-all italic shadow-lg shadow-brand-sidebar/20"
          >
            <Plus className="w-3.5 h-3.5" /> Catat Transaksi
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-sidebar p-6 rounded-3xl text-white relative overflow-hidden group print:bg-white print:text-brand-sidebar print:border print:border-brand-border"
        >
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform print:hidden">
             <Wallet className="w-32 h-32" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Saldo Saat Ini</p>
          <h2 className="text-2xl font-black italic tracking-tighter mb-4">{formatCurrency(balance)}</h2>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase italic">
             <TrendingUp className="w-3 h-3" /> Surplus Bulan Ini
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-brand-border flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4 print:hidden">
             <div className="p-2 bg-emerald-50 rounded-xl"><ArrowDownLeft className="w-5 h-5 text-emerald-500" /></div>
             <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Pemasukan</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Masuk</p>
            <p className="text-xl font-black text-brand-sidebar italic tracking-tighter">{formatCurrency(totalIncome)}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-brand-border flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4 print:hidden">
             <div className="p-2 bg-red-50 rounded-xl"><ArrowUpRight className="w-5 h-5 text-red-500" /></div>
             <span className="text-[8px] font-black uppercase tracking-widest bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Pengeluaran</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Keluar</p>
            <p className="text-xl font-black text-brand-sidebar italic tracking-tighter">{formatCurrency(totalExpense)}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-sm font-black text-brand-sidebar uppercase italic tracking-tighter flex items-center gap-2">
               <History className="w-4 h-4 text-brand-accent" /> Riwayat Transaksi
            </h2>
            <div className="flex items-center gap-2">
               <Search className="w-3.5 h-3.5 text-slate-400" />
               <input type="text" placeholder="Cari..." className="bg-transparent border-none text-[10px] font-bold uppercase outline-none focus:ring-0 w-24" />
            </div>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm print:shadow-none print:border-x-0 print:border-t-0">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50 border-b border-brand-border print:bg-white">
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Tanggal</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Deskripsi</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Kategori</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 italic print:hidden">Status</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 italic text-right">Jumlah</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                   {transactions.map((t) => (
                     <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                           <span className="text-[10px] font-bold text-slate-500">{t.date}</span>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-xs font-bold text-brand-sidebar italic">{t.title}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{t.category}</span>
                        </td>
                        <td className="px-6 py-4 print:hidden">
                           <span className={cn(
                             "text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5",
                             t.status === 'selesai' ? "text-emerald-500" : "text-orange-400"
                           )}>
                              <div className={cn("w-1 h-1 rounded-full", t.status === 'selesai' ? "bg-emerald-500" : "bg-orange-400")} />
                              {t.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className={cn(
                             "text-xs font-black italic tracking-tighter",
                             t.type === 'pemasukan' ? "text-emerald-600" : "text-red-500"
                           )}>
                              {t.type === 'pemasukan' ? '+' : '-'} {formatCurrency(t.amount)}
                           </span>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Quick Payment & Summary */}
        <div className="space-y-6 print:hidden">
           <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-brand-sidebar uppercase italic tracking-tighter mb-6 flex items-center gap-2">
                 <CreditCard className="w-4 h-4 text-brand-accent" /> Virtual Account SPP
              </h3>
              <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border mb-6">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Nomor Rekening Sekolah</p>
                 <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-brand-sidebar tracking-[0.1em]">8809 1234 5678</p>
                    <button className="text-[8px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded italic transition-colors hover:bg-brand-accent hover:text-white">Salin</button>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 mt-2 italic capitalize">Armilla Nusa Education Foundation</p>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-slate-400">Total Tagihan Siswa</span>
                    <span className="text-brand-sidebar">84 Siswa</span>
                 </div>
                 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-accent h-full w-[65%]" />
                 </div>
                 <p className="text-[9px] font-bold text-slate-400 italic text-center">65% Siswa telah melunasi SPP Mei</p>
              </div>
           </div>

           <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/20 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <h3 className="text-xs font-black uppercase italic tracking-tighter mb-4 flex items-center gap-2">
                 <PieChartIcon className="w-4 h-4 text-brand-accent" /> Info Keuangan
              </h3>
              <p className="text-[11px] text-slate-300 italic leading-relaxed mb-6">
                 Seluruh dana dikelola secara transparan dan dapat dipantau oleh auditor internal setiap periodenya.
              </p>
              <button 
                onClick={handleConsultation}
                className="w-full py-3 bg-brand-accent rounded-xl text-[10px] font-bold uppercase tracking-widest italic shadow-lg shadow-brand-accent/20 hover:bg-white hover:text-brand-sidebar transition-all"
              >
                 Buka Konsultasi
              </button>
           </div>
        </div>
      </div>

      {/* Modal Catat Transaksi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-sidebar/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-brand-border"
          >
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-slate-50">
              <h2 className="text-sm font-bold text-brand-sidebar uppercase italic tracking-tighter">Catat <span className="text-brand-accent">Transaksi Baru</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-brand-accent font-bold">×</button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Judul Transaksi</label>
                <input 
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Contoh: Pembelian Alat Tulis"
                  className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Jenis</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as Transaction['type']})}
                    className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent"
                  >
                    <option value="pemasukan">Pemasukan</option>
                    <option value="pengeluaran">Pengeluaran</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Kategori</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as Transaction['category']})}
                    className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent"
                  >
                    <option value="Lainnya">Lainnya</option>
                    <option value="SPP">SPP</option>
                    <option value="BOS">Dana BOS</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Gaji">Gaji</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Tanggal</label>
                  <input 
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Jumlah (IDR)</label>
                  <input 
                    required
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="Contoh: 50000"
                    className="w-full bg-slate-50 border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-brand-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-brand-sidebar text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-accent transition-all italic shadow-lg shadow-brand-sidebar/20"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
