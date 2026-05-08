import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  DollarSign, 
  Search, 
  LogOut, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function AffiliateDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('');
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const q = query(collection(db, 'affiliates'), where('code', '==', affiliateCode.toUpperCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setError('Kode Referal tidak ditemukan.');
      } else {
        const data = snap.docs[0].data();
        setAffiliateData({ id: snap.docs[0].id, ...data });
        setIsLoggedIn(true);
        localStorage.setItem('affiliate_session', affiliateCode.toUpperCase());
      }
    } catch (err) {
      setError('Terjadi kesalahan saat validasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCode = localStorage.getItem('affiliate_session');
    if (savedCode) {
      setAffiliateCode(savedCode);
      const autoLogin = async () => {
        try {
          const q = query(collection(db, 'affiliates'), where('code', '==', savedCode));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const docSnap = snap.docs[0];
            setAffiliateData({ id: docSnap.id, ...docSnap.data() });
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem('affiliate_session');
          }
        } catch (err) {
          console.error("Auto login error:", err);
          localStorage.removeItem('affiliate_session');
        }
      };
      autoLogin();
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && affiliateData) {
      const q = query(
        collection(db, 'commissions'), 
        where('affiliateId', '==', affiliateData.id),
        orderBy('createdAt', 'desc')
      );
      
      const unsub = onSnapshot(q, (snapshot) => {
        setCommissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      
      return () => unsub();
    }
  }, [isLoggedIn, affiliateData]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAffiliateData(null);
    setCommissions([]);
    localStorage.removeItem('affiliate_session');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-accent/5 via-transparent to-transparent">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white border border-brand-border rounded-[3rem] p-10 shadow-2xl shadow-brand-sidebar/5"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-brand-sidebar text-brand-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-sidebar/20 rotate-3">
              <Users className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-brand-sidebar leading-none">Affiliate <span className="text-brand-accent">Portal</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3 italic">Pantau keberhasilan referal Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Kode Referal Unik</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-accent" />
                <input 
                  type="text" 
                  value={affiliateCode}
                  onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                  required
                  placeholder="CONTOH: RASYA77"
                  className="w-full bg-slate-50 border border-brand-border rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-brand-sidebar focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all uppercase"
                />
              </div>
            </div>

            {error && (
              <p className="text-[10px] font-black text-red-500 uppercase italic text-center animate-pulse">{error}</p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-sidebar text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand-sidebar/20 hover:bg-brand-accent hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 italic"
            >
              {loading ? 'Validasi...' : 'Masuk ke Dashboard'}
            </button>
          </form>

          <p className="text-[9px] text-slate-400 font-medium italic mt-10 text-center leading-relaxed px-10">
            Belum punya kode? Hubungi Admin <span className="text-brand-sidebar font-bold">Rasyacomp</span> untuk bergabung Program Affiliate.
          </p>
        </motion.div>
      </div>
    );
  }

  const totalEarnings = commissions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-brand-sidebar pb-20">
      {/* Header */}
      <nav className="bg-white border-b border-brand-border sticky top-0 z-50 px-6 sm:px-12 py-6">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-brand-sidebar text-brand-accent rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-sm font-black italic uppercase tracking-tighter text-brand-sidebar leading-none">Affiliate <span className="text-brand-accent">Partner</span></h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Selamat Datang, {affiliateData.name}</p>
               </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors italic tracking-widest"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
         </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10">
         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-brand-sidebar text-white p-8 rounded-[3rem] shadow-2xl shadow-brand-sidebar/20 relative overflow-hidden group"
            >
               <DollarSign className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 italic">Total Komisi Terkumpul</p>
               <h4 className="text-4xl font-black text-brand-accent tracking-tight italic">Rp {totalEarnings.toLocaleString()}</h4>
               <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-white/60 italic uppercase">
                  <TrendingUp className="w-3 h-3 text-green-400" /> +{commissions.length} Transaksi Berhasil
               </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               delay={0.1}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white border border-brand-border p-8 rounded-[3rem] shadow-sm relative overflow-hidden"
            >
               <Users className="absolute -right-4 -top-4 w-24 h-24 text-slate-50 rotate-12" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic">Skema Komisi Anda</p>
               <h4 className="text-xl font-black text-brand-sidebar uppercase italic">
                  {affiliateData.commissionType === 'percentage' ? `${affiliateData.commissionValue}%` : `Rp ${affiliateData.commissionValue.toLocaleString()}`} 
                  <span className="text-[10px] text-slate-300 ml-2">PER PENDAFTARAN</span>
               </h4>
               <p className="text-[9px] text-slate-400 font-medium italic mt-2">Dihitung otomatis per sistem divalidasi oleh admin.</p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               delay={0.2}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white border border-brand-border p-8 rounded-[3rem] shadow-sm flex flex-col justify-between"
            >
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic">Kode Referal unik</p>
                  <div className="flex items-center gap-3">
                     <span className="text-3xl font-black text-brand-sidebar italic uppercase tracking-tighter">{affiliateData.code}</span>
                     <button className="text-brand-accent hover:scale-110 transition-transform">
                        <ExternalLink className="w-5 h-5" />
                     </button>
                  </div>
               </div>
               <p className="text-[9px] text-brand-accent font-black uppercase italic tracking-widest mt-4">Bagikan ke Partner Anda!</p>
            </motion.div>
         </div>

         {/* Transactions */}
         <div className="bg-white border border-brand-border rounded-[3.5rem] overflow-hidden shadow-sm">
            <div className="px-10 py-8 border-b border-brand-border flex justify-between items-center bg-slate-50/50">
               <h5 className="text-[11px] font-black text-brand-sidebar uppercase tracking-[0.2em] flex items-center gap-3 italic">
                  <Award className="w-4 h-4 text-brand-accent" /> Log Referal & Komisi
               </h5>
               <span className="text-[9px] font-black text-slate-400 uppercase italic">Terakhir diperbarui: {format(new Date(), 'HH:mm')} WIB</span>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-white text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="px-10 py-6 italic">Sekolah</th>
                        <th className="px-6 py-6 italic">Tanggal</th>
                        <th className="px-6 py-6 italic">Paket</th>
                        <th className="px-10 py-6 text-right italic">Komisi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 uppercase text-[10px] font-bold text-brand-sidebar">
                     {commissions.map((comm) => (
                        <tr key={comm.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-brand-accent group-hover:text-white transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                 </div>
                                 <span className="font-black italic text-brand-sidebar">{comm.schoolName}</span>
                              </div>
                           </td>
                           <td className="px-6 py-6 text-slate-400">{comm.date ? format(comm.date.toDate(), 'dd MMM yyyy HH:mm') : '-'}</td>
                           <td className="px-6 py-6 font-black italic">{comm.packageName}</td>
                           <td className="px-10 py-6 text-right font-black italic text-brand-accent">+ Rp {comm.amount.toLocaleString()}</td>
                        </tr>
                     ))}
                     {commissions.length === 0 && (
                        <tr>
                           <td colSpan={4} className="px-10 py-24 text-center">
                              <div className="flex flex-col items-center gap-4">
                                 <Search className="w-12 h-12 text-slate-200" />
                                 <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest italic">Belum ada referal yang telah lunas pembayaran</p>
                              </div>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </main>
    </div>
  );
}
