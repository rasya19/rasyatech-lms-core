import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
  MessageCircle,
  FileText,
  Settings,
  Plus,
  Users,
  Calendar,
  DollarSign,
  FileDown
} from 'lucide-react';
import { generateInvoicePDF } from '../services/pdfService';
import { cn } from '@/src/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

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
  expiryDate?: string;
  studentLimit?: number;
  custom_domain?: string;
  referralCode?: string;
  createdAt: any;
}

interface Affiliate {
  id: string;
  name: string;
  code: string;
  commissionType: 'fixed' | 'percentage';
  commissionValue: number; // e.g., 100000 for fixed or 10 for percentage
  createdAt: any;
}

interface CommissionRecord {
  id: string;
  affiliateCode: string;
  schoolId: string;
  schoolName: string;
  amount: number;
  date: any;
}

interface PaymentRecord {
  id: string;
  schoolId: string;
  transactionId?: string;
  schoolName: string;
  amount: number;
  date: any;
  method: string;
  notes: string;
  status: 'Pending' | 'Success' | 'Failed';
  packageId?: string;
  proofUrl?: string;
  category: 'Subscription' | 'Setup' | 'Extra' | 'Other';
}

interface FeedbackRecord {
  id: string;
  schoolId: string;
  schoolName: string;
  name: string;
  role: string;
  feedback: string;
  ratings: {
    kemudahan: number;
    fitur: number;
    pelayanan: number;
  };
  createdAt: any;
}

export default function SuperAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<SchoolRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'institutions' | 'finance' | 'affiliates' | 'settings' | 'feedbacks'>('institutions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isAddingAffiliate, setIsAddingAffiliate] = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [selectedSchoolForConfig, setSelectedSchoolForConfig] = useState<SchoolRegistration | null>(null);
  
  const [newAffiliate, setNewAffiliate] = useState({
    name: '',
    code: '',
    commissionType: 'percentage' as 'fixed' | 'percentage',
    commissionValue: 10
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'AFF-';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAffiliate(prev => ({ ...prev, code: result }));
  };

  const [newPayment, setNewPayment] = useState({
    schoolId: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    method: 'Transfer Bank',
    category: 'Subscription' as any,
    notes: '',
    status: 'Success' as any // Manual entry defaults to Success
  });

  interface BankAccount {
    id: string;
    name: string;
    account: string;
    recipient: string;
  }

  interface EWalletAccount {
    id: string;
    name: string;
    number: string;
  }

  const INDONESIAN_BANKS = [
    'BCA', 'BANK MANDIRI', 'BRI', 'BNI', 'BTV', 'BSI', 'BANK PERMATA', 'BANK CIMB NIAGA', 'BANK DANAMON', 'BANK MEGA', 'OCBC NISP', 'BANK PANIN'
  ];

  const INDONESIAN_EWALLETS = [
    'GOPAY', 'DANA', 'OVO', 'SHOPEEPAY', 'LINKAJA'
  ];

  const [paymentSettings, setPaymentSettings] = useState({
    banks: [] as BankAccount[],
    ewallets: [] as EWalletAccount[],
    vaInfo: ''
  });

  const handleDownloadInvoice = (p: PaymentRecord) => {
    const rawDate = p.date;
    let dateObj: Date;
    
    if (rawDate?.toDate) {
      dateObj = rawDate.toDate();
    } else if (rawDate instanceof Date) {
      dateObj = rawDate;
    } else if (typeof rawDate === 'string' || typeof rawDate === 'number') {
      dateObj = new Date(rawDate);
    } else {
      dateObj = new Date();
    }

    const invoiceNumber = `INV/RC/${format(dateObj, 'yyyy/MM')}/${p.transactionId || p.id.slice(0,8).toUpperCase()}`;

    generateInvoicePDF({
      invoiceNumber,
      date: dateObj,
      schoolName: p.schoolName,
      packageName: p.packageId || (p.category === 'Subscription' ? 'Standard Subscription' : p.category),
      amount: p.amount,
      paymentMethod: p.method,
      status: p.status,
      banks: paymentSettings.banks
    });
  };

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

        // Fetch Payments
        const qPay = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
        const unsubPay = onSnapshot(qPay, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            transactionId: doc.id.slice(0, 8).toUpperCase(),
            ...doc.data()
          })) as PaymentRecord[];
          setPayments(docs);
        });

        // Fetch Affiliates
        const qAff = query(collection(db, 'affiliates'), orderBy('createdAt', 'desc'));
        const unsubAff = onSnapshot(qAff, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Affiliate[];
          setAffiliates(docs);
        });

        // Fetch Commissions
        const qComm = query(collection(db, 'commissions'), orderBy('createdAt', 'desc'));
        const unsubComm = onSnapshot(qComm, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCommissions(docs);
        });

        // Fetch Feedbacks
        const qFeedback = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
        const unsubFeedback = onSnapshot(qFeedback, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as FeedbackRecord[];
          setFeedbacks(docs);
        });

        // Fetch Global Settings
        const fetchSettings = async () => {
          const settingsRef = doc(db, 'settings', 'payment');
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            // Handle migration from old single fields to new array structure
            setPaymentSettings({
              banks: data.banks || (data.bankName ? [{
                id: 'legacy-bank',
                name: data.bankName,
                account: data.bankAccount,
                recipient: data.bankRecipient
              }] : []),
              ewallets: data.ewallets || (data.ewalletNumber ? [{
                id: 'legacy-ewallet',
                name: 'E-Wallet',
                number: data.ewalletNumber
              }] : []),
              vaInfo: data.vaInfo || ''
            });
          }
        };
        fetchSettings();

        return () => {
          unsubFirestore();
          unsubPay();
          unsubAff();
          unsubComm();
          unsubFeedback();
        };
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

  const handleVerifyPayment = async (payment: PaymentRecord) => {
    if (payment.status === 'Success') return;
    if (!confirm(`Verifikasi pembayaran dari ${payment.schoolName}? Ini akan mengaktifkan sekolah dan menambah masa aktif 1 tahun.`)) return;

    setIsVerifying(payment.id);
    try {
      // 1. Update Payment Status
      await updateDoc(doc(db, 'payments', payment.id), {
        status: 'Success',
        verifiedAt: serverTimestamp()
      });

      // 2. Fetch School Data to calculate expiry
      const schoolRef = doc(db, 'schools', payment.schoolId);
      const schoolSnap = await getDoc(schoolRef);
      
      if (schoolSnap.exists()) {
        const schoolData = schoolSnap.data() as SchoolRegistration;
        let currentExpiry = schoolData.expiryDate ? new Date(schoolData.expiryDate) : new Date();
        
        // If expired, start from today. If not, add to existing.
        const baseDate = currentExpiry < new Date() ? new Date() : currentExpiry;
        const newExpiry = new Date(baseDate);
        newExpiry.setDate(newExpiry.getDate() + 365);

        // 3. Update School Status and Expiry
        await updateDoc(schoolRef, {
          status: 'active',
          expiryDate: format(newExpiry, 'yyyy-MM-dd'),
          updatedAt: serverTimestamp()
        });

        // 4. Check for Referral Code and Record Commission
        if (schoolData.referralCode) {
          const aff = affiliates.find(a => a.code === schoolData.referralCode);
          if (aff) {
            const commissionAmount = aff.commissionType === 'percentage' 
              ? (payment.amount * (aff.commissionValue / 100))
              : aff.commissionValue;

            await setDoc(doc(collection(db, 'commissions')), {
              affiliateId: aff.id,
              affiliateCode: aff.code,
              schoolId: payment.schoolId,
              schoolName: payment.schoolName,
              packageName: schoolData.packageId || 'Standard',
              paymentAmount: payment.amount,
              amount: commissionAmount,
              date: serverTimestamp(),
              paymentId: payment.id,
              createdAt: serverTimestamp()
            });
            console.log(`Commission of Rp ${commissionAmount} recorded for ${aff.code}`);
          }
        }

        alert(`Verifikasi Berhasil! Sekolah ${payment.schoolName} kini Aktif hingga ${format(newExpiry, 'dd MMM yyyy')}.`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Gagal memproses verifikasi.');
    } finally {
      setIsVerifying(null);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.schoolId || !newPayment.amount) return;

    setIsAddingPayment(true);
    try {
      const school = registrations.find(s => s.id === newPayment.schoolId);
      await setDoc(doc(collection(db, 'payments')), {
        ...newPayment,
        amount: Number(newPayment.amount),
        schoolName: school?.name || 'Unknown',
        date: new Date(newPayment.date),
        createdAt: serverTimestamp()
      });
      alert('Pembayaran berhasil dicatat!');
      setIsAddingPayment(false);
      setNewPayment({
        schoolId: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        method: 'Transfer Bank',
        category: 'Subscription',
        notes: ''
      });
    } catch (error) {
      console.error('Add payment error:', error);
      alert('Gagal mencatat pembayaran.');
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleAddAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAffiliate.name || !newAffiliate.code) return;

    setIsAddingAffiliate(true);
    try {
      await setDoc(doc(collection(db, 'affiliates')), {
        ...newAffiliate,
        code: newAffiliate.code.toUpperCase(),
        commissionValue: Number(newAffiliate.commissionValue),
        createdAt: serverTimestamp()
      });
      alert('Affiliate berhasil ditambahkan!');
      setIsAddingAffiliate(false);
      setNewAffiliate({
        name: '',
        code: '',
        commissionType: 'percentage',
        commissionValue: 10
      });
    } catch (error) {
      console.error('Add affiliate error:', error);
      alert('Gagal menambahkan affiliate.');
    } finally {
      setIsAddingAffiliate(false);
    }
  };

  const handleUpdateSchoolConfig = async (id: string, config: any) => {
    try {
      await updateDoc(doc(db, 'schools', id), {
        ...config,
        updatedAt: serverTimestamp()
      });
      alert('Konfigurasi sekolah berhasil diperbarui!');
      setSelectedSchoolForConfig(null);
    } catch (error) {
      console.error('Update config error:', error);
      alert('Gagal memperbarui konfigurasi.');
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
      alert('Sekolah berhasil dihapus dari database. Harap hapus juga email pendaftar secara manual di Firebase Console Authentication jika ingin mendaftarkan dengan email yang sama.');
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
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-10 bg-white p-1.5 rounded-2xl border border-brand-border w-fit shadow-sm">
           <button 
             onClick={() => setActiveTab('institutions')}
             className={cn(
               "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic",
               activeTab === 'institutions' ? "bg-brand-sidebar text-white shadow-lg shadow-brand-sidebar/20" : "text-slate-400 hover:bg-slate-50"
             )}
           >
              <School className="w-4 h-4" /> Institusi Terdaftar
           </button>
           <button 
             onClick={() => setActiveTab('finance')}
             className={cn(
               "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic",
               activeTab === 'finance' ? "bg-brand-sidebar text-white shadow-lg shadow-brand-sidebar/20" : "text-slate-400 hover:bg-slate-50"
             )}
           >
              <DollarSign className="w-4 h-4" /> Finance & Billing
           </button>
           <button 
             onClick={() => setActiveTab('affiliates')}
             className={cn(
               "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic",
               activeTab === 'affiliates' ? "bg-brand-sidebar text-white shadow-lg shadow-brand-sidebar/20" : "text-slate-400 hover:bg-slate-50"
             )}
           >
              <Users className="w-4 h-4" /> Affiliate Manager
           </button>
           <button 
             onClick={() => setActiveTab('settings')}
             className={cn(
               "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic",
               activeTab === 'settings' ? "bg-brand-sidebar text-white shadow-lg shadow-brand-sidebar/20" : "text-slate-400 hover:bg-slate-50"
             )}
           >
              <Settings className="w-4 h-4" /> Global Settings
           </button>
           <button 
             onClick={() => setActiveTab('feedbacks')}
             className={cn(
               "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic",
               activeTab === 'feedbacks' ? "bg-brand-sidebar text-white shadow-lg shadow-brand-sidebar/20" : "text-slate-400 hover:bg-slate-50"
             )}
           >
              <MessageCircle className="w-4 h-4" /> Feedback & Survey
           </button>
        </div>

        {activeTab === 'institutions' && (
          <>
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
                       <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Limits</p>
                             <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1 italic">
                               <Users className="w-3 h-3 text-brand-accent" /> {reg.studentLimit || '∞'} Siswa
                             </p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Masa Aktif</p>
                             <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1 italic">
                               <Calendar className="w-3 h-3 text-brand-accent" /> {reg.expiryDate ? format(new Date(reg.expiryDate), 'dd/MM/yyyy') : 'Lifetime'}
                             </p>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Terdaftar</p>
                             <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                               <Clock className="w-3 h-3" /> {reg.createdAt ? format(reg.createdAt.toDate(), 'dd/MM/yy', { locale: id }) : '-'}
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
                          <button 
                            onClick={() => setSelectedSchoolForConfig(reg)}
                            className="p-3 bg-slate-100 text-brand-sidebar rounded-xl hover:bg-brand-sidebar hover:text-white transition-all shadow-lg shadow-slate-200/20"
                            title="Pengaturan Sekolah"
                          >
                             <Settings className="w-5 h-5" />
                          </button>
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
          </>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-sidebar">
                      <DollarSign className="w-8 h-8" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black italic uppercase tracking-tighter text-brand-sidebar">Finance <span className="text-brand-accent">Dashboard</span></h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Monitoring Pembayaran & Aktivasi Institusi</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsAddingPayment(true)}
                  className="bg-brand-sidebar text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-sidebar/20 flex items-center gap-2 italic"
                >
                   <Plus className="w-4 h-4 text-brand-accent" /> Input Manual
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-brand-sidebar text-white p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                   <DollarSign className="w-20 h-20 text-white/5 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 relative z-10">Total Revenue (Verified)</p>
                   <p className="text-2xl font-black text-brand-accent italic relative z-10">
                      Rp {payments.filter(p => p.status === 'Success').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                   </p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaksi Pending</p>
                      <p className="text-2xl font-black text-orange-500 italic">{payments.filter(p => p.status === 'Pending').length}</p>
                   </div>
                   <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                      <Clock className="w-6 h-6" />
                   </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Transaksi</p>
                      <p className="text-2xl font-black text-brand-sidebar italic">{payments.length}</p>
                   </div>
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500">
                      <CreditCard className="w-6 h-6" />
                   </div>
                </div>
             </div>

             <div className="bg-white border border-brand-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="px-8 py-6 bg-slate-50/50 border-b border-brand-border flex items-center justify-between">
                   <h4 className="text-xs font-black uppercase text-brand-sidebar italic tracking-widest">Riwayat Pembayaran Terbaru</h4>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-slate-50">
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-brand-border">ID Transaksi</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-brand-border">Sekolah</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-brand-border">Paket / Kat</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-brand-border">Nominal</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-brand-border">Status</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-brand-border text-center">Aksi</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border text-[11px]">
                         {payments.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                               <td className="px-6 py-4">
                                  <p className="font-black text-slate-300">#{p.transactionId}</p>
                                  <p className="text-[8px] font-bold text-slate-400 lowercase">{p.date ? format(p.date.toDate ? p.date.toDate() : new Date(p.date), 'dd/MM/yy HH:mm') : '-'}</p>
                               </td>
                               <td className="px-6 py-4">
                                  <p className="font-black text-brand-sidebar uppercase italic">{p.schoolName}</p>
                                  <p className="text-[9px] font-bold text-slate-400">{p.method}</p>
                               </td>
                               <td className="px-6 py-4">
                                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-black uppercase italic text-[8px] tracking-widest">
                                     {p.packageId || p.category}
                                  </span>
                               </td>
                               <td className="px-6 py-4 font-black text-brand-accent">
                                  Rp {p.amount.toLocaleString()}
                               </td>
                               <td className="px-6 py-4">
                                  <div className={cn(
                                     "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black uppercase italic text-[8px] tracking-wider",
                                     p.status === 'Success' ? 'bg-green-50 text-green-500 border border-green-100' :
                                     p.status === 'Pending' ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                                     'bg-red-50 text-red-500 border border-red-100'
                                  )}>
                                     {p.status === 'Pending' && <Clock className="w-2.5 h-2.5" />}
                                     {p.status === 'Success' && <CheckCircle2 className="w-2.5 h-2.5" />}
                                     {p.status === 'Failed' && <XCircle className="w-2.5 h-2.5" />}
                                     {p.status}
                                  </div>
                               </td>
                               <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                     <button 
                                       onClick={() => handleDownloadInvoice(p)}
                                       className="p-2 text-navy-600 hover:bg-slate-100 rounded-lg transition-all"
                                       title="Download Invoice"
                                     >
                                        <FileDown className="w-4 h-4" />
                                     </button>
                                     {p.proofUrl && (
                                        <button 
                                          onClick={() => window.open(p.proofUrl, '_blank')}
                                          className="p-2 text-brand-sidebar hover:bg-slate-100 rounded-lg transition-all"
                                          title="Lihat Bukti"
                                        >
                                           <FileText className="w-4 h-4" />
                                        </button>
                                     )}
                                     {p.status === 'Pending' && (
                                        <button 
                                          onClick={() => handleVerifyPayment(p)}
                                          disabled={isVerifying === p.id}
                                          className="px-4 py-1.5 bg-green-500 text-white rounded-lg font-black uppercase text-[8px] tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                           {isVerifying === p.id ? '...' : 'Verifikasi'}
                                        </button>
                                     )}
                                     {p.status === 'Success' && (
                                        <div className="p-2 text-green-500">
                                           <ShieldCheck className="w-5 h-5" />
                                        </div>
                                     )}
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                   {payments.length === 0 && (
                      <div className="p-20 text-center">
                         <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-slate-200" />
                         </div>
                         <p className="text-xs font-black uppercase text-slate-300 tracking-widest italic">Belum ada transaksi pembayaran untuk diproses</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'affiliates' && (
          <div className="space-y-10">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-sidebar">
                      <Users className="w-8 h-8" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black italic uppercase tracking-tighter text-brand-sidebar">Affiliate <span className="text-brand-accent">Manager</span></h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Kelola Affiliate & Pantau Komisi Referal</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsAddingAffiliate(true)}
                  className="bg-brand-sidebar text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-sidebar/20 flex items-center gap-2 italic"
                >
                   <Plus className="w-4 h-4 text-brand-accent" /> Tambah Affiliate
                </button>
             </div>

             {isAddingAffiliate && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white border-2 border-brand-accent/20 rounded-[2.5rem] p-8 shadow-xl"
               >
                  <h4 className="text-xs font-black uppercase text-brand-sidebar italic mb-6 tracking-widest">Informasi Affiliate Baru</h4>
                  <form onSubmit={handleAddAffiliate} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Nama Affiliate</label>
                        <input 
                          type="text" 
                          required
                          value={newAffiliate.name}
                          onChange={(e) => setNewAffiliate({...newAffiliate, name: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar"
                          placeholder="Budi Selebtok"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Kode Referal unik</label>
                        <div className="flex gap-2">
                           <input 
                             type="text" 
                             required
                             value={newAffiliate.code}
                             onChange={(e) => setNewAffiliate({...newAffiliate, code: e.target.value.toUpperCase()})}
                             className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar"
                             placeholder="AFF-XXXXX"
                           />
                           <button 
                             type="button"
                             onClick={generateRandomCode}
                             className="px-4 bg-brand-accent/10 text-brand-sidebar rounded-xl text-[10px] font-black uppercase hover:bg-brand-accent/20 transition-all border border-brand-accent/20"
                           >
                              Auto
                           </button>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Tipe Komisi</label>
                        <select 
                          value={newAffiliate.commissionType}
                          onChange={(e) => setNewAffiliate({...newAffiliate, commissionType: e.target.value as 'fixed' | 'percentage'})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar"
                        >
                           <option value="percentage">PERSENTASE (%)</option>
                           <option value="fixed">FIXED (Rp)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                          {newAffiliate.commissionType === 'percentage' ? 'Nilai %' : 'Nilai (Rp)'}
                        </label>
                        <input 
                          type="number" 
                          required
                          value={newAffiliate.commissionValue}
                          onChange={(e) => setNewAffiliate({...newAffiliate, commissionValue: Number(e.target.value)})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar"
                        />
                     </div>
                     <div className="flex gap-2">
                        <button 
                          type="submit"
                          className="flex-1 bg-brand-sidebar text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
                        >
                           Simpan
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsAddingAffiliate(false)}
                          className="px-4 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase"
                        >
                           Batal
                        </button>
                     </div>
                  </form>
               </motion.div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {affiliates.map((aff) => {
                  const affiliateCommissions = commissions.filter(c => c.affiliateId === aff.id);
                  const totalCommission = affiliateCommissions.reduce((acc, curr) => acc + curr.amount, 0);
                  
                  return (
                    <div key={aff.id} className="bg-white border border-brand-border rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all group">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <h4 className="text-lg font-black italic uppercase text-brand-sidebar group-hover:text-brand-accent transition-colors">{aff.name}</h4>
                             <span className="text-[10px] font-black bg-brand-sidebar text-brand-accent px-3 py-1 rounded-full uppercase tracking-tighter italic">#{aff.code}</span>
                          </div>
                          <button 
                            onClick={async () => {
                              if (confirm(`Hapus affiliate ${aff.name}?`)) {
                                await deleteDoc(doc(db, 'affiliates', aff.id));
                              }
                            }}
                            className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                          >
                             <XCircle className="w-5 h-5" />
                          </button>
                       </div>

                       <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Closing</p>
                             <p className="text-xl font-black text-brand-sidebar italic">{affiliateCommissions.length} <span className="text-[10px] uppercase NOT-italic">Sekolah</span></p>
                          </div>
                          <div className="bg-brand-accent/10 p-4 rounded-2xl border border-brand-accent/20">
                             <p className="text-[8px] font-black text-brand-sidebar uppercase tracking-widest mb-1">Skema Komisi</p>
                             <p className="text-[10px] font-black text-brand-sidebar italic">
                                {aff.commissionType === 'percentage' ? `${aff.commissionValue}% / Transaksi` : `Rp ${aff.commissionValue.toLocaleString()} / Sekolah`}
                             </p>
                          </div>
                       </div>

                       <div className="bg-brand-sidebar text-white p-6 rounded-[2rem] relative overflow-hidden">
                          <DollarSign className="absolute -right-4 -bottom-4 w-20 h-20 text-white/5" />
                          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Akumulasi Komisi Anda</p>
                          <p className="text-2xl font-black text-brand-accent italic">Rp {totalCommission.toLocaleString()}</p>
                       </div>
                    </div>
                  );
                })}
             </div>

             {affiliates.length === 0 && !isAddingAffiliate && (
               <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
                  <p className="text-xs font-black uppercase text-slate-300 tracking-widest italic">Belum ada affiliate terdaftar</p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'settings' && (
          <>
            {/* Global Settings Section (Restored from previous step) */}
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
                     <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                           <CreditCard className="w-4 h-4 text-brand-sidebar" /> Transfer Bank
                        </h4>
                        <select 
                          onChange={(e) => {
                            if (!e.target.value) return;
                            setPaymentSettings({
                              ...paymentSettings, 
                              banks: [...paymentSettings.banks, { id: Date.now().toString(), name: e.target.value, account: '', recipient: '' }]
                            });
                            e.target.value = '';
                          }}
                          className="p-1.5 bg-brand-sidebar text-brand-accent rounded-lg text-[8px] font-bold outline-none cursor-pointer hover:scale-105 transition-all"
                        >
                           <option value="">+ TAMBAH BANK</option>
                           {INDONESIAN_BANKS.filter(b => !paymentSettings.banks.find(pb => pb.name === b)).map(b => (
                             <option key={b} value={b}>{b}</option>
                           ))}
                        </select>
                     </div>
                     <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {paymentSettings.banks.map((bank, index) => (
                           <div key={bank.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 relative group">
                              <button 
                                onClick={() => {
                                  const newBanks = [...paymentSettings.banks];
                                  newBanks.splice(index, 1);
                                  setPaymentSettings({...paymentSettings, banks: newBanks});
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                              >
                                 <XCircle className="w-3 h-3" />
                              </button>
                              <select 
                                value={bank.name}
                                onChange={(e) => {
                                   const newBanks = [...paymentSettings.banks];
                                   newBanks[index].name = e.target.value;
                                   setPaymentSettings({...paymentSettings, banks: newBanks});
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-brand-accent cursor-pointer"
                              >
                                 <option value="">PILIH BANK...</option>
                                 {INDONESIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                              </select>
                              <input 
                                type="text" 
                                placeholder="Nomor Rekening"
                                value={bank.account}
                                onChange={(e) => {
                                   const newBanks = [...paymentSettings.banks];
                                   newBanks[index].account = e.target.value;
                                   setPaymentSettings({...paymentSettings, banks: newBanks});
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-brand-accent"
                              />
                              <input 
                                type="text" 
                                placeholder="Nama Penerima"
                                value={bank.recipient}
                                onChange={(e) => {
                                   const newBanks = [...paymentSettings.banks];
                                   newBanks[index].recipient = e.target.value.toUpperCase();
                                   setPaymentSettings({...paymentSettings, banks: newBanks});
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-brand-accent"
                              />
                           </div>
                        ))}
                        {paymentSettings.banks.length === 0 && (
                           <p className="text-[10px] text-slate-400 italic text-center py-4">Belum ada rekening bank.</p>
                        )}
                     </div>
                  </div>

                  <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                     <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                           <MessageCircle className="w-4 h-4 text-brand-sidebar" /> E-Wallet
                        </h4>
                        <select 
                          onChange={(e) => {
                            if (!e.target.value) return;
                            setPaymentSettings({
                              ...paymentSettings, 
                              ewallets: [...paymentSettings.ewallets, { id: Date.now().toString(), name: e.target.value, number: '' }]
                            });
                            e.target.value = '';
                          }}
                          className="p-1.5 bg-brand-sidebar text-brand-accent rounded-lg text-[8px] font-bold outline-none cursor-pointer hover:scale-105 transition-all"
                        >
                           <option value="">+ TAMBAH EWALLET</option>
                           {INDONESIAN_EWALLETS.filter(w => !paymentSettings.ewallets.find(pw => pw.name === w)).map(w => (
                             <option key={w} value={w}>{w}</option>
                           ))}
                        </select>
                     </div>
                     <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {paymentSettings.ewallets.map((wallet, index) => (
                           <div key={wallet.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 relative group">
                              <button 
                                onClick={() => {
                                  const newWallets = [...paymentSettings.ewallets];
                                  newWallets.splice(index, 1);
                                  setPaymentSettings({...paymentSettings, ewallets: newWallets});
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                              >
                                 <XCircle className="w-3 h-3" />
                              </button>
                              <select 
                                value={wallet.name}
                                onChange={(e) => {
                                   const newWallets = [...paymentSettings.ewallets];
                                   newWallets[index].name = e.target.value;
                                   setPaymentSettings({...paymentSettings, ewallets: newWallets});
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-brand-accent cursor-pointer"
                              >
                                 <option value="">PILIH EWALLET...</option>
                                 {INDONESIAN_EWALLETS.map(w => <option key={w} value={w}>{w}</option>)}
                              </select>
                              <input 
                                type="text" 
                                placeholder="Nomor HP"
                                value={wallet.number}
                                onChange={(e) => {
                                   const newWallets = [...paymentSettings.ewallets];
                                   newWallets[index].number = e.target.value;
                                   setPaymentSettings({...paymentSettings, ewallets: newWallets});
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-brand-accent"
                              />
                           </div>
                        ))}
                        {paymentSettings.ewallets.length === 0 && (
                           <p className="text-[10px] text-slate-400 italic text-center py-4">Belum ada akun e-wallet.</p>
                        )}
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
                       className="w-full bg-white border border-slate-200 rounded-xl p-4 text-[11px] font-bold outline-none focus:border-brand-accent h-[200px] resize-none leading-relaxed"
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
          </>
        )}

        {activeTab === 'feedbacks' && (
          <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-sidebar">
                      <MessageCircle className="w-8 h-8" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black italic uppercase tracking-tighter text-brand-sidebar">Feedback & <span className="text-brand-accent">Survey</span></h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Monitor kritik, saran & tingkat kepuasan sekolah</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Kemudahan Penggunaan", key: "kemudahan" },
                  { label: "Kelengkapan Fitur", key: "fitur" },
                  { label: "Kualitas Pelayanan", key: "pelayanan" }
                ].map(metric => {
                  const avg = feedbacks.length > 0 
                    ? feedbacks.reduce((acc, curr) => acc + (curr.ratings?.[metric.key as keyof typeof curr.ratings] || 0), 0) / feedbacks.length
                    : 0;
                  
                  return (
                    <div key={metric.key} className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{metric.label}</p>
                          <p className="text-2xl font-black text-brand-sidebar italic">{avg.toFixed(1)} <span className="text-sm text-slate-400">/ 5.0</span></p>
                       </div>
                       <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-brand-sidebar">
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                       </div>
                    </div>
                  );
                })}
             </div>

             <div className="bg-white border border-brand-border rounded-[2rem] p-8 shadow-sm">
               <h3 className="text-lg font-black italic uppercase text-brand-sidebar tracking-tighter mb-6 border-b border-slate-100 pb-4">
                  Daftar M<span className="text-brand-accent">asukan</span>
               </h3>
               <div className="space-y-6">
                 {feedbacks.length === 0 ? (
                    <div className="text-center py-10">
                      <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-xs font-black uppercase text-slate-300 tracking-widest italic">Belum ada feedback masuk</p>
                    </div>
                 ) : (
                    feedbacks.map(f => (
                      <div key={f.id} className="border-b border-slate-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
                         <div className="flex justify-between items-start mb-3">
                           <div>
                             <h4 className="font-black text-brand-sidebar italic">{f.schoolName}</h4>
                             <p className="text-[10px] font-bold text-slate-400">Oleh: {f.name} ({f.role})</p>
                           </div>
                           <span className="text-[10px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded">
                             {f.createdAt ? format(f.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '-'}
                           </span>
                         </div>
                         <div className="flex gap-4 mb-3">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 flex items-center gap-1 rounded"><svg className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg> UI: {f.ratings?.kemudahan || 0}</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 flex items-center gap-1 rounded"><svg className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg> Fitur: {f.ratings?.fitur || 0}</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 flex items-center gap-1 rounded"><svg className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg> CS: {f.ratings?.pelayanan || 0}</span>
                         </div>
                         <p className="text-[11px] font-medium text-slate-600 bg-slate-50 p-4 rounded-xl italic">
                           "{f.feedback}"
                         </p>
                      </div>
                    ))
                 )}
               </div>
             </div>
          </div>
        )}

        {/* Payment Modal */}
        {isAddingPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-sidebar/80 backdrop-blur-sm">
             <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative shadow-2xl">
                <button onClick={() => setIsAddingPayment(false)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors">
                   <XCircle className="w-6 h-6" />
                </button>

                <div className="mb-8 flex items-center gap-4">
                   <div className="p-3 bg-brand-accent/10 rounded-2xl text-brand-sidebar">
                      <DollarSign className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="font-black text-brand-sidebar uppercase italic tracking-widest">CATAT <span className="text-brand-accent">PEMBAYARAN</span></h3>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Input transaksi manual sekolah</p>
                   </div>
                </div>

                <form onSubmit={handleAddPayment} className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Sekolah Pendaftar</label>
                      <select 
                        required
                        value={newPayment.schoolId}
                        onChange={(e) => setNewPayment({...newPayment, schoolId: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar"
                      >
                         <option value="">Pilih Sekolah...</option>
                         {registrations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.adminEmail})</option>)}
                      </select>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Jumlah Pembayaran</label>
                         <input 
                           type="number" 
                           required
                           placeholder="850000"
                           value={newPayment.amount}
                           onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Tanggal</label>
                         <input 
                           type="date" 
                           required
                           value={newPayment.date}
                           onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Metode</label>
                         <select 
                           value={newPayment.method}
                           onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar"
                         >
                            <option value="Transfer Bank">Transfer Bank</option>
                            <option value="E-Wallet">E-Wallet</option>
                            <option value="Virtual Account">Virtual Account</option>
                            <option value="Tunai">Tunai</option>
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Kategori</label>
                         <select 
                           value={newPayment.category}
                           onChange={(e) => setNewPayment({...newPayment, category: e.target.value as any})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar"
                         >
                            <option value="Subscription">Subscription</option>
                            <option value="Setup">Setup Fee</option>
                            <option value="Extra">Extra Quota</option>
                            <option value="Other">Lainnya</option>
                         </select>
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Catatan</label>
                      <textarea 
                        value={newPayment.notes}
                        onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                        placeholder="Contoh: Pembayaran Paket PRO 1 Tahun"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar h-24 resize-none"
                      />
                   </div>

                   <button 
                     type="submit"
                     disabled={isAddingPayment || !newPayment.schoolId}
                     className="w-full bg-brand-sidebar text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand-sidebar/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group mt-4 italic disabled:opacity-50"
                   >
                     SIMPAN TRANSAKSI <Plus className="w-4 h-4 text-brand-accent group-hover:rotate-90 transition-transform" />
                   </button>
                </form>
             </div>
          </div>
        )}

        {/* School Config Modal */}
        {selectedSchoolForConfig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-sidebar/80 backdrop-blur-sm">
             <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative shadow-2xl">
                <button onClick={() => setSelectedSchoolForConfig(null)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors">
                   <XCircle className="w-6 h-6" />
                </button>

                <div className="mb-8 flex items-center gap-4">
                   <div className="p-3 bg-brand-accent/10 rounded-2xl text-brand-sidebar">
                      <Settings className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="font-black text-brand-sidebar uppercase italic tracking-widest">LIMIT <span className="text-brand-accent">SEKOLAH</span></h3>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{selectedSchoolForConfig.name}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Custom Domain</label>
                      <input 
                        type="text" 
                        placeholder="lms.sekolah.com"
                        defaultValue={selectedSchoolForConfig.custom_domain || ''}
                        onChange={(e) => {
                          setSelectedSchoolForConfig({...selectedSchoolForConfig, custom_domain: e.target.value});
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar outline-none focus:border-brand-accent"
                      />
                      <p className="text-[9px] text-slate-400 font-medium italic mt-1 px-2">Kosongkan jika hanya menggunakan subdomain.</p>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Subdomain Slug</label>
                      <input 
                        type="text" 
                        defaultValue={selectedSchoolForConfig.slug}
                        onChange={(e) => {
                          setSelectedSchoolForConfig({...selectedSchoolForConfig, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')});
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar outline-none focus:border-brand-accent"
                      />
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Masa Aktif Sekolah</label>
                      <input 
                        type="date" 
                        defaultValue={selectedSchoolForConfig.expiryDate || format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => {
                          const date = e.target.value;
                          setSelectedSchoolForConfig({...selectedSchoolForConfig, expiryDate: date});
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar outline-none focus:border-brand-accent"
                      />
                      <p className="text-[9px] text-slate-400 font-medium italic mt-1 px-2">Akses akan ditutup otomatis pada tanggal ini.</p>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Limit Kuota Siswa Terdaftar</label>
                      <input 
                        type="number" 
                        defaultValue={selectedSchoolForConfig.studentLimit || 100}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSelectedSchoolForConfig({...selectedSchoolForConfig, studentLimit: val});
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-brand-sidebar outline-none focus:border-brand-accent"
                      />
                      <p className="text-[9px] text-slate-400 font-medium italic mt-1 px-2">Jumlah maksimal siswa yang bisa didaftarkan.</p>
                   </div>

                   <button 
                     onClick={() => handleUpdateSchoolConfig(selectedSchoolForConfig.id, {
                        expiryDate: selectedSchoolForConfig.expiryDate,
                        studentLimit: Number(selectedSchoolForConfig.studentLimit),
                        slug: selectedSchoolForConfig.slug,
                        custom_domain: selectedSchoolForConfig.custom_domain
                     })}
                     className="w-full bg-brand-sidebar text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand-sidebar/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group mt-4 italic"
                   >
                     UPDATE KONFIGURASI <ShieldCheck className="w-4 h-4 text-brand-accent" />
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
