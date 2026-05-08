import React, { useState } from 'react';
import { 
  Wallet, Search, Filter, Plus, ArrowUpRight, ArrowDownRight, 
  MoreVertical, FileText, CheckCircle2, XCircle, Clock, Check,
  CreditCard, ExternalLink, ShieldCheck, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, updateDoc, doc } from 'firebase/firestore';

interface Bill {
  id: string;
  studentName: string;
  studentClass: string;
  billType: string;
  amount: number;
  status: 'Lunas' | 'Belum Lunas' | 'Menunggu Pembayaran';
  vaNumber?: string;
  dueDate: string;
}

const DUMMY_BILLS: Bill[] = [
  {
    id: 'BILL-001',
    studentName: 'Ahmad Rafli',
    studentClass: '10 IPA 1',
    billType: 'SPP Mei 2026',
    amount: 500000,
    status: 'Belum Lunas',
    dueDate: '2026-05-15'
  },
  {
    id: 'BILL-002',
    studentName: 'Siti Najwa',
    studentClass: '11 IPS 2',
    billType: 'Uang Pangkal Semester 2',
    amount: 1500000,
    status: 'Lunas',
    vaNumber: '880192839102',
    dueDate: '2026-05-10'
  },
  {
    id: 'BILL-003',
    studentName: 'Budi Santoso',
    studentClass: '12 IPA 3',
    billType: 'Biaya Ujian Praktik',
    amount: 300000,
    status: 'Belum Lunas',
    dueDate: '2026-05-20'
  },
  {
    id: 'BILL-004',
    studentName: 'Clara Bella',
    studentClass: '10 IPS 1',
    billType: 'SPP Mei 2026',
    amount: 500000,
    status: 'Menunggu Pembayaran',
    vaNumber: '880123994821',
    dueDate: '2026-05-15'
  }
];

export default function Keuangan() {
  const [bills, setBills] = useState<Bill[]>(DUMMY_BILLS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isVaModalOpen, setIsVaModalOpen] = useState(false);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bill.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'Lunas': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Belum Lunas': return 'bg-red-100 text-red-700 border-red-200';
      case 'Menunggu Pembayaran': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handlePayClick = (bill: Bill) => {
    // Generate a VA number if not already generated
    const vaNumber = bill.vaNumber || ('8809' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'));
    
    // Update local state temporarily
    const updatedBills = bills.map(b => 
      b.id === bill.id ? { ...b, vaNumber, status: b.status === 'Belum Lunas' ? 'Menunggu Pembayaran' as const : b.status } : b
    );
    setBills(updatedBills);
    
    setSelectedBill({ ...bill, vaNumber, status: bill.status === 'Belum Lunas' ? 'Menunggu Pembayaran' : bill.status });
    setIsVaModalOpen(true);
  };

  const simulatePaymentSuccess = (id: string) => {
    const updatedBills = bills.map(b => 
      b.id === id ? { ...b, status: 'Lunas' as const } : b
    );
    setBills(updatedBills);
    setIsVaModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Dashboard Keuangan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard <span className="text-blue-400 italic">Keuangan</span></h1>
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest pl-1">Kelola Tagihan & Pembayaran Terpusat</p>
        </div>
        
        <div className="relative z-10 flex gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Tagihan Aktif</p>
            <p className="text-2xl font-black tracking-tight">{filteredBills.filter(b => b.status !== 'Lunas').length} <span className="text-sm font-medium text-slate-400">Siswa</span></p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Daftar Tagihan Siswa
            </h3>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari Siswa / No. Tagihan..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 overflow-x-auto w-full md:w-auto">
              {['Semua', 'Belum Lunas', 'Menunggu Pembayaran', 'Lunas'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    statusFilter === status 
                      ? "bg-white shadow-sm text-blue-600 border border-slate-200/50" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Tagihan</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Siswa & Kelas</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Jenis Tagihan</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Jatuh Tempo</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Nominal</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-4">
                    <span className="text-xs font-bold text-slate-700">{bill.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{bill.studentName}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{bill.studentClass}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-medium text-slate-600">{bill.billType}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-md",
                      new Date(bill.dueDate) < new Date() && bill.status !== 'Lunas' 
                        ? "bg-red-50 text-red-600" 
                        : "text-slate-600"
                    )}>
                      {bill.dueDate}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-xs font-bold text-slate-800 tracking-tight">
                      Rp {bill.amount.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn("px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md border", getStatusColor(bill.status))}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {bill.status !== 'Lunas' ? (
                      <button 
                        onClick={() => handlePayClick(bill)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                      >
                         Bayar VA <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="bg-slate-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-200 inline-flex items-center gap-1.5 cursor-not-allowed opacity-80"
                      >
                         <CheckCircle2 className="w-3 h-3" /> Lunas
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && (
                <tr>
                   <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs font-medium">
                      Tidak ada tagihan yang sesuai dengan pencarian Anda.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VA Payment Modal */}
      <AnimatePresence>
        {isVaModalOpen && selectedBill && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVaModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 p-6 flex items-start justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                     <ShieldCheck className="w-5 h-5 text-blue-400" />
                     <h3 className="font-black text-white uppercase tracking-widest text-lg">Pembayaran <span className="text-blue-400 italic">VA</span></h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sandbox Mode - Xendit Integration</p>
                </div>
                <button onClick={() => setIsVaModalOpen(false)} className="text-slate-400 hover:text-white relative z-10">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                 {/* Bank Selector (Visual Only) */}
                 <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['BNI', 'BRI', 'Mandiri', 'BCA', 'Permata'].map((bank, i) => (
                       <div key={bank} className={cn(
                          "px-4 py-2 border rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all shrink-0",
                          i === 0 ? "border-blue-500 text-blue-600 bg-blue-50" : "border-slate-200 text-slate-400 hover:border-slate-300"
                       )}>
                          {bank}
                       </div>
                    ))}
                 </div>

                 {/* VA Render */}
                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nomor Virtual Account (BNI)</p>
                    <div className="flex items-center justify-center gap-3">
                       <span className="text-3xl font-black text-slate-800 tracking-wider font-mono select-all">
                          {selectedBill.vaNumber?.match(/.{1,4}/g)?.join(' ')}
                       </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                       <Clock className="w-3 h-3" /> Berakhir dalam <span className="font-bold text-orange-500">23:59:59</span>
                    </p>
                 </div>

                 <div className="space-y-4">
                   <div className="flex justify-between items-center py-3 border-b border-slate-100">
                     <span className="text-xs font-bold text-slate-500">Nama Siswa</span>
                     <span className="text-xs font-black text-slate-800">{selectedBill.studentName}</span>
                   </div>
                   <div className="flex justify-between items-center py-3 border-b border-slate-100">
                     <span className="text-xs font-bold text-slate-500">Keterangan</span>
                     <span className="text-xs font-bold text-slate-800">{selectedBill.billType}</span>
                   </div>
                   <div className="flex justify-between items-center py-3">
                     <span className="text-xs font-bold text-slate-500">Total Pembayaran</span>
                     <span className="text-lg font-black text-blue-600">Rp {selectedBill.amount.toLocaleString('id-ID')}</span>
                   </div>
                 </div>

                 <div className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-2">Instruksi Pembayaran (Mobile Banking)</p>
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-blue-900/70">
                       <li>Buka aplikasi Mobile Banking Anda</li>
                       <li>Pilih menu Transfer &gt; Virtual Account</li>
                       <li>Masukkan nomor VIRTUAL ACCOUNT di atas</li>
                       <li>Pastikan nominal dan nama sesuai sebelum menekan "Lanjut"</li>
                    </ol>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button 
                  onClick={() => simulatePaymentSuccess(selectedBill.id)}
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simulasi Lunas Terbayar
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
