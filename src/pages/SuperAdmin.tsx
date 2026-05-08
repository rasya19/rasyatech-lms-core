import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { 
  ShieldCheck, 
  School, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search,
  Filter,
  LogOut,
  LayoutDashboard,
  CreditCard,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface SchoolRegistration {
  id: string;
  name: string;
  npsn?: string;
  address?: string;
  adminName: string;
  adminEmail: string;
  whatsapp: string;
  packageId: string;
  paymentMethod?: string;
  slug: string;
  status: 'pending' | 'active' | 'suspended';
  createdAt: any;
}

export default function SuperAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<SchoolRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    bankName: '',
    bankAccount: '',
    bankRecipient: '',
    ewalletNumber: '',
    vaInfo: ''
  });

  const SUPER_ADMIN_EMAIL = 'ismanto095@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
        // Fetch registrations
        const q = query(collection(db, 'schools'), orderBy('createdAt', 'desc'));
        const unsubFirestore = onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as SchoolRegistration[];
          setRegistrations(docs);
          setLoading(false);
        });

        // Fetch Global Settings
        const fetchSettings = async () => {
          const settingsRef = doc(db, 'settings', 'payment');
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            setPaymentSettings(settingsSnap.data() as any);
          }
        };
        fetchSettings();

        return () => unsubFirestore();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'payment'), paymentSettings);
      alert('Pengaturan pembayaran berhasil disimpan!');
    } catch (error) {
      console.error('Save settings error:', error);
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login error details:', error);
      let message = 'Gagal login. Silakan coba lagi.';
      let help = '';
      
      if (error.code === 'auth/unauthorized-domain') {
        message = 'DOMAIN BELUM TERDAFTAR';
        help = 'Silakan masuk ke Firebase Console -> Authentication -> Settings -> Authorized Domains dan tambahkan domain ini.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        message = 'LOGIN DIBATALKAN';
        help = 'Anda menutup jendela login sebelum selesai.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'METODE LOGIN NONAKTIF';
        help = 'Aktifkan metode Google di Firebase Console -> Authentication -> Sign-in method.';
      }
      
      alert(`⚠️ ${message}\n\n${help}\n\nError: ${error.message}`);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Ubah status pendaftaran ke ${newStatus.toUpperCase()}?`)) return;
    try {
      await updateDoc(doc(db, 'schools', id), {
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update error:', error);
      alert('Gagal memperbarui status.');
    }
  };

  const handleDeleteSchool = async (id: string, name: string) => {
    if (!confirm(`APAKAH ANDA YAKIN? Sekolah "${name}" akan dihapus PERMANEN dari sistem.`)) return;
    try {
      await deleteDoc(doc(db, 'schools', id));
      alert('Sekolah berhasil dihapus.');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus sekolah.');
    }
  };

  const handleLogout = () => {
    auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-brand-sidebar rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-sidebar flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-brand-sidebar" />
          </div>
          <h1 className="text-2xl font-black italic uppercase text-brand-sidebar mb-2 tracking-tighter">Super Admin <span className="text-brand-accent">Portal</span></h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 leading-relaxed">
            Halaman ini khusus untuk manajemen pusat.<br />Silakan login dengan akun yang terdaftar.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full bg-brand-sidebar text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-sidebar/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 italic"
          >
            Login Google <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-brand-sidebar flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black italic uppercase text-brand-sidebar mb-2 tracking-tighter">Akses <span className="text-red-500">Ditolak</span></h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 leading-relaxed">
            Akun <span className="text-brand-sidebar">{user.email}</span> tidak memiliki akses sebagai Super Admin.
          </p>
          <p className="text-[10px] text-slate-400 mb-8 italic">Silakan login menggunakan akun {SUPER_ADMIN_EMAIL}</p>
          <button 
            onClick={handleLogout}
            className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-3 italic"
          >
            Logout & Ganti Akun <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const filteredDocs = registrations.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.adminName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Container */}
      <nav className="bg-brand-sidebar text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/5">
              <LayoutDashboard className="w-5 h-5 text-brand-accent" />
           </div>
           <div>
              <h1 className="text-sm font-black uppercase tracking-tighter italic leading-none">Super <span className="text-brand-accent">Control</span></h1>
              <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-0.5">LMS Central Management</p>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase italic">{user.displayName}</span>
              <span className="text-[8px] font-bold text-white/40">{user.email}</span>
           </div>
           <button 
             onClick={() => auth.signOut()}
             className="bg-white/10 p-2 rounded-lg hover:bg-red-500 transition-colors"
           >
             <LogOut className="w-5 h-5" />
           </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
           <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-brand-sidebar leading-none">
                 Pendaftaran <span className="text-brand-accent">Sekolah Baru</span>
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
                 Total {registrations.length} Institusi Terdaftar
              </p>
           </div>

           <div className="flex items-center gap-3">
              <div className="relative">
                 <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Cari sekolah atau admin..."
                   className="bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-brand-sidebar focus:ring-2 focus:ring-brand-accent/20 outline-none w-64"
                 />
              </div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-brand-sidebar focus:ring-2 focus:ring-brand-accent/20 outline-none"
              >
                 <option value="all">Semua Status</option>
                 <option value="pending">Menunggu</option>
                 <option value="active">Aktif</option>
                 <option value="suspended">Dihapus</option>
              </select>
           </div>
        </div>

        {/* Payment Settings Section */}
        <div className="mb-12 bg-white border border-brand-border rounded-[2.5rem] p-8 shadow-sm">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-sidebar">
                 <CreditCard className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="font-black text-brand-sidebar uppercase italic tracking-widest">Pengaturan <span className="text-brand-accent">Pembayaran Global</span></h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Kelola nomor rekening & instruksi pembayaran pendaftar</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-brand-sidebar" /> Transfer Bank
                 </h4>
                 <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Nama Bank (Contoh: BANK MANDIRI)"
                      value={paymentSettings.bankName}
                      onChange={(e) => setPaymentSettings({...paymentSettings, bankName: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[11px] font-bold outline-none focus:border-brand-accent"
                    />
                    <input 
                      type="text" 
                      placeholder="Nomor Rekening"
                      value={paymentSettings.bankAccount}
                      onChange={(e) => setPaymentSettings({...paymentSettings, bankAccount: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[11px] font-bold outline-none focus:border-brand-accent"
                    />
                    <input 
                      type="text" 
                      placeholder="Nama Penerima"
                      value={paymentSettings.bankRecipient}
                      onChange={(e) => setPaymentSettings({...paymentSettings, bankRecipient: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[11px] font-bold outline-none focus:border-brand-accent"
                    />
                 </div>
              </div>

              <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-brand-sidebar" /> E-Wallet
                 </h4>
                 <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Nomor HP E-Wallet"
                      value={paymentSettings.ewalletNumber}
                      onChange={(e) => setPaymentSettings({...paymentSettings, ewalletNumber: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[11px] font-bold outline-none focus:border-brand-accent"
                    />
                    <p className="text-[9px] text-slate-400 font-medium italic">Gunakan format 08xx-xxxx-xxxx</p>
                 </div>
              </div>

              <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-sidebar" /> Instruksi VA
                 </h4>
                 <textarea 
                   placeholder="Instruksi Virtual Account..."
                   value={paymentSettings.vaInfo}
                   onChange={(e) => setPaymentSettings({...paymentSettings, vaInfo: e.target.value})}
                   className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[11px] font-bold outline-none focus:border-brand-accent h-24 resize-none"
                 />
              </div>
           </div>

           <div className="flex justify-end">
              <button 
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="bg-brand-sidebar text-white px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-sidebar/20 italic disabled:opacity-50"
              >
                 {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan Pembayaran'}
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredDocs.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center">
               <Filter className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-xs font-black uppercase text-slate-300 tracking-widest">Tidak ada data pendaftaran yang sesuai</p>
            </div>
          ) : (
            filteredDocs.map((reg) => (
              <div 
                key={reg.id} 
                className="bg-white border border-brand-border rounded-3xl p-6 hover:shadow-xl transition-all group flex flex-col md:flex-row items-center gap-8"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                   <School className="w-8 h-8 text-brand-sidebar" />
                </div>

                <div className="flex-1 space-y-1">
                   <div className="flex items-center gap-2">
                      <h3 className="font-black italic uppercase text-brand-sidebar text-lg">{reg.name}</h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 rounded">NPSN: {reg.npsn || '-'}</span>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                        reg.packageId === 'basic' ? 'bg-blue-100 text-blue-600' :
                        reg.packageId === 'pro' ? 'bg-purple-100 text-purple-600' :
                        'bg-slate-800 text-white'
                      )}>
                        {reg.packageId}
                      </span>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Admin</p>
                         <p className="text-xs font-bold text-brand-sidebar">{reg.adminName}</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kontak</p>
                         <a href={`https://wa.me/${reg.whatsapp}`} target="_blank" className="text-xs font-bold text-brand-accent flex items-center gap-1">
                           {reg.whatsapp} <MessageCircle className="w-3 h-3" />
                         </a>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pembayaran</p>
                         <p className="text-xs font-bold text-slate-600 flex items-center gap-1 italic lowercase">
                           <CreditCard className="w-3 h-3" /> {reg.paymentMethod || 'manual'}
                         </p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Alamat</p>
                         <p className="text-[10px] font-medium text-slate-600 line-clamp-1 italic">{reg.address || '-'}</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Terdaftar</p>
                         <p className="text-xs font-bold text-slate-600 flex items-center gap-1">
                           <Clock className="w-3 h-3" /> {reg.createdAt ? format(reg.createdAt.toDate(), 'dd MMM yyyy, HH:mm', { locale: id }) : '-'}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 shrink-0">
                   <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[10px] uppercase italic tracking-widest transition-all",
                      reg.status === 'pending' ? 'bg-orange-50 border-orange-200 text-orange-500' :
                      reg.status === 'active' ? 'bg-green-50 border-green-200 text-green-500' :
                      'bg-red-50 border-red-200 text-red-500'
                   )}>
                      {reg.status === 'pending' && <Clock className="w-3 h-3" />}
                      {reg.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                      {reg.status === 'suspended' && <XCircle className="w-3 h-3" />}
                      {reg.status}
                   </div>

                   <div className="flex items-center gap-2">
                      {reg.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(reg.id, 'active')}
                          className="p-3 bg-green-500 text-white rounded-xl hover:scale-110 transition-all shadow-lg shadow-green-500/20"
                          title="Aktifkan"
                        >
                           <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => window.open(`/s/${reg.slug}`, '_blank')}
                        className="p-3 bg-brand-sidebar text-white rounded-xl hover:scale-110 transition-all shadow-lg shadow-brand-sidebar/20"
                        title="Lihat Dashboard Sekolah"
                      >
                         <ExternalLink className="w-5 h-5" />
                      </button>
                      {reg.status !== 'suspended' ? (
                        <button 
                          onClick={() => handleUpdateStatus(reg.id, 'suspended')}
                          className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-slate-200/20"
                          title="Nonaktifkan (Suspend)"
                        >
                           <XCircle className="w-5 h-5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateStatus(reg.id, 'active')}
                          className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-slate-200/20"
                          title="Aktifkan Kembali"
                        >
                           <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDeleteSchool(reg.id, reg.name)}
                        className="p-3 bg-red-50 text-red-300 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        title="Hapus Permanen"
                      >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                      </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
