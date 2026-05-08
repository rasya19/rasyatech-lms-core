import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useSchool } from '../contexts/SchoolContext';
import { db, auth } from '../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { 
  ShieldCheck, 
  UserCheck, 
  Users, 
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

type PortalType = 'siswa' | 'guru' | 'admin';

export default function Login() {
  const navigate = useNavigate();
  const { schoolSlug } = useParams();
  const { school } = useSchool();
  const [selectedPortal, setSelectedPortal] = useState<PortalType | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  const schoolName = school?.name || 'PKBM Armilla Nusa Terpadu';
  const prefix = schoolSlug ? `/s/${schoolSlug}` : '';

  const portals = [
    { 
      id: 'siswa' as PortalType, 
      title: 'Portal Siswa', 
      desc: 'Akses materi, tugas, dan ujian harian.', 
      icon: Users,
      color: 'hover:border-emerald-500 group-hover:text-emerald-500',
      bg: 'group-hover:bg-emerald-50',
      dummy: { user: '1234567890', pass: 'siswa123' }
    },
    { 
      id: 'guru' as PortalType, 
      title: 'Portal Guru', 
      desc: 'Kelola kurikulum, nilai, dan sesi tutorial.', 
      icon: UserCheck,
      color: 'hover:border-brand-accent group-hover:text-brand-accent',
      bg: 'group-hover:bg-blue-50',
      dummy: { user: 'guru@armilla.com', pass: 'guru123' }
    },
    { 
      id: 'admin' as PortalType, 
      title: 'Administrator', 
      desc: 'Manajemen data pusat dan laporan sistem.', 
      icon: ShieldCheck, 
      color: 'hover:border-brand-sidebar group-hover:text-brand-sidebar',
      bg: 'group-hover:bg-slate-100',
      dummy: { 
        user: import.meta.env.VITE_ADMIN_USER || 'pkbmarmillanusa@gmail.com', 
        pass: import.meta.env.VITE_ADMIN_PASS || 'admin123' 
      },
      demo: {
        user: 'demo_admin',
        pass: 'demo123'
      }
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const portal = portals.find(p => p.id === selectedPortal);
      if (!portal) return;

      // Handle Admin Login (Real Auth or Demo)
      if (selectedPortal === 'admin') {
        const isDemoAdmin = formData.username === 'demo_admin' && formData.password === 'demo123';
        
        if (isDemoAdmin) {
          localStorage.setItem('userRole', 'Admin');
          localStorage.setItem('isDemoMode', 'true');
          localStorage.setItem('adminName', 'Admin Demo');
          navigate(`${prefix}/dashboard`);
          return;
        }

        // Try real Firebase authentication
        try {
          const userCredential = await signInWithEmailAndPassword(auth, formData.username, formData.password);
          const user = userCredential.user;

          // If we are in a specific school context, make sure this user is the admin for THIS school
          if (schoolSlug && school) {
            if (user.email !== school.adminEmail && user.uid !== school.ownerUid) {
              await auth.signOut();
              throw new Error('Anda tidak memiliki akses ke sekolah ini.');
            }
          }

          localStorage.setItem('userRole', 'Admin');
          localStorage.setItem('isDemoMode', 'false');
          localStorage.setItem('adminName', school?.adminName || user.email?.split('@')[0] || 'Admin');
          navigate(`${prefix}/dashboard`);
          return;
        } catch (authError: any) {
          console.error('Auth error:', authError);
          // Only throw if it's not a dummy check failure below
          if (formData.username !== portal.dummy.user) {
             throw new Error('Email atau password salah.');
          }
        }
      }

      // Handle Guru/Siswa portal (Current mock/localStorage implementation)
      if (selectedPortal === 'siswa') {
        const savedSiswa = localStorage.getItem('school_siswa_list');
        const siswaList = savedSiswa ? JSON.parse(savedSiswa) : [];
        const foundSiswa = siswaList.find((s: any) => s.nisn === formData.username && (s.password === formData.password || (!s.password && formData.password === '12345')));
        
        if (foundSiswa) {
          localStorage.setItem('userRole', 'Siswa');
          localStorage.setItem('currentUserId', foundSiswa.id);
          localStorage.setItem('isDemoMode', 'false');
          if (foundSiswa.mustChangePassword || !foundSiswa.password || foundSiswa.password === '12345') {
            setIsChangingPassword(true);
          } else {
            navigate(`${prefix}/dashboard`);
          }
          return;
        }
      }

      // Standard Mock Users (Guru/Legacy Admin)
      const isStandardUser = formData.username === portal.dummy.user && formData.password === portal.dummy.pass;
      if (isStandardUser) {
        const roleMap: Record<PortalType, string> = {
          siswa: 'Siswa',
          guru: 'Guru',
          admin: 'Admin'
        };
        localStorage.setItem('userRole', roleMap[selectedPortal]);
        localStorage.setItem('isDemoMode', 'false');
        localStorage.setItem('adminName', 'Administrator Utama');
        navigate(`${prefix}/dashboard`);
        return;
      }

      alert('Login gagal. Periksa kembali email dan password Anda.');
    } catch (error: any) {
      alert(`Login Gagal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Password konfirmasi tidak cocok!');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      // If student, update their password in localStorage
      if (localStorage.getItem('userRole') === 'Siswa') {
        const studentId = localStorage.getItem('currentUserId');
        const savedSiswa = localStorage.getItem('school_siswa_list');
        if (savedSiswa && studentId) {
          const siswaList = JSON.parse(savedSiswa);
          const updated = siswaList.map((s: any) => 
            s.id === studentId ? { ...s, password: formData.newPassword, mustChangePassword: false } : s
          );
          localStorage.setItem('school_siswa_list', JSON.stringify(updated));
        }
      }

      alert(`Password berhasil diperbarui! Selamat datang di Portal ${schoolName}.`);
      navigate(`${prefix}/dashboard`);
    }, 1200);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      alert('Silakan masukkan email Anda.');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert(`Instruksi reset password telah dikirim ke ${resetEmail}. Silakan cek kotak masuk atau folder spam Anda.`);
      setIsResettingPassword(false);
    } catch (error: any) {
      console.error('Reset password error:', error);
      alert(`Gagal mengirim email reset: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="w-full max-w-4xl space-y-12">
        
        {/* Top Header */}
        <div className="flex justify-between items-end">
           <button 
             onClick={() => {
               if (isResettingPassword) {
                 setIsResettingPassword(false);
               } else if (selectedPortal) {
                 setSelectedPortal(null);
               } else {
                 navigate('/');
               }
             }}
             className="flex items-center gap-2 p-3 text-slate-500 hover:text-brand-sidebar transition-all font-bold text-xs uppercase tracking-widest"
           >
              <ArrowLeft className="w-4 h-4" /> {(selectedPortal || isResettingPassword) ? 'Kembali' : 'Kembali ke Web'}
           </button>
           <div className="text-right">
              <h2 className="text-2xl font-bold text-brand-sidebar italic uppercase tracking-tighter">
                Portal <span className="text-brand-accent">{(selectedPortal || isResettingPassword) ? (isResettingPassword ? 'Recovery' : 'Login') : 'Layanan'}</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {isResettingPassword ? 'Reset Password' : (selectedPortal ? `Akses ${selectedPortal.toUpperCase()}` : schoolName)}
              </p>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {!selectedPortal ? (
            <motion.div 
              key="portals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {portals.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedPortal(p.id)}
                  className={cn(
                    "group bg-white p-8 rounded-[2rem] border border-brand-border flex flex-col items-center text-center transition-all shadow-sm hover:shadow-xl hover:-translate-y-2",
                    p.color
                  )}
                >
                   <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors", p.bg)}>
                      <p.icon className="w-8 h-8" />
                   </div>
                   <h3 className="font-bold text-sm text-brand-sidebar uppercase italic mb-2 tracking-widest">{p.title}</h3>
                   <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic mb-8">
                      {p.desc}
                   </p>
                   <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">
                      Pilih Portal <ArrowRight className="w-3 h-3" />
                   </div>
                </motion.button>
              ))}
            </motion.div>
          ) : isResettingPassword ? (
            <motion.div 
              key="reset-password"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto w-full bg-white rounded-[2.5rem] border border-brand-border p-10 shadow-2xl relative"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-brand-bg rounded-2xl border border-brand-border text-brand-sidebar">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-brand-sidebar uppercase italic tracking-widest text-lg">LUPA <span className="text-brand-accent">PASSWORD</span></h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Email pemulihan akan dikirimkan</p>
                  </div>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">Email Akun Anda</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input 
                        type="email" 
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-slate-50 border border-brand-border rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-brand-sidebar focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading || !resetEmail}
                    className="w-full bg-brand-sidebar text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand-sidebar/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Kirim Link Reset <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setIsResettingPassword(false)}
                    className="w-full text-center text-[10px] font-black text-slate-400 hover:text-brand-sidebar uppercase tracking-[0.2em] transition-colors italic"
                  >
                    Batal & Kembali Login
                  </button>
                </form>
              </div>
            </motion.div>
          ) : isChangingPassword ? (
            <motion.div 
              key="change-password"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto w-full bg-white rounded-[2.5rem] border border-brand-border p-10 shadow-2xl relative"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100 text-orange-600">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-brand-sidebar uppercase italic tracking-widest text-lg">GANTI <span className="text-orange-500">PASSWORD</span></h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Wajib saat login pertama kali</p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-5">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">Password Baru</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input 
                        type="password" 
                        required
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-brand-border rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-brand-sidebar focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">Konfirmasi Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input 
                        type="password" 
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-brand-border rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-brand-sidebar focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
                    className="w-full bg-brand-sidebar text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand-sidebar/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-50"
                  >
                    Update & Masuk <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="login-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto w-full bg-white rounded-[2.5rem] border border-brand-border p-10 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-brand-bg rounded-2xl border border-brand-border text-brand-sidebar">
                    {selectedPortal === 'siswa' && <Users className="w-6 h-6" />}
                    {selectedPortal === 'guru' && <UserCheck className="w-6 h-6" />}
                    {selectedPortal === 'admin' && <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-black text-brand-sidebar uppercase italic tracking-widest text-lg">LOG<span className="text-brand-accent">IN</span></h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Gunakan akun yang terdaftar</p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">
                      {selectedPortal === 'siswa' ? 'NISN (Username)' : selectedPortal === 'guru' ? 'Email Terdaftar' : 'Akun Administrator'}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-brand-accent transition-colors text-slate-400">
                        {selectedPortal === 'guru' ? <Mail className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      </div>
                      <input 
                        type="text" 
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        placeholder={selectedPortal === 'siswa' ? 'Masukkan 10 digit NISN' : selectedPortal === 'guru' ? 'nama@email.com' : 'ID Admin'}
                        className="w-full bg-slate-50 border border-brand-border rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-brand-sidebar focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">Kata Sandi</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-brand-accent transition-colors text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-brand-border rounded-2xl py-4 pl-12 pr-12 text-xs font-bold text-brand-sidebar focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand-accent transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Tampilkan info demo untuk memudahkan promosi/uji coba */}
                  {selectedPortal && (
                     <div className="bg-slate-50 border border-brand-border rounded-xl p-4 mt-2 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                         <ShieldAlert className="w-3 h-3 text-brand-accent" />
                         <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 italic">Informasi Akun Demo</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                              {selectedPortal === 'siswa' ? 'Nomor NISN' : 'Username/Email'}
                            </p>
                            <code className="text-[10px] font-black text-brand-sidebar">
                              {selectedPortal === 'admin' ? 'demo_admin' : portals.find(p => p.id === selectedPortal)?.dummy.user}
                            </code>
                         </div>
                         <div>
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Password</p>
                            <code className="text-[10px] font-black text-brand-sidebar">
                              {selectedPortal === 'admin' ? 'demo123' : portals.find(p => p.id === selectedPortal)?.dummy.pass}
                            </code>
                         </div>
                      </div>
                      <p className="text-[7px] text-slate-400 mt-2 italic font-bold uppercase tracking-tighter">
                        {selectedPortal === 'admin' 
                          ? '* Gunakan akun demo di atas untuk promosi. Akun utama Anda tetap rahasia.' 
                          : `* Gunakan Akun Diatas Untuk Uji Coba ${selectedPortal?.toUpperCase()}`}
                      </p>
                    </div>
                   )}

                  <div className="flex justify-end pt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsResettingPassword(true)}
                      className="text-[10px] font-bold text-slate-400 hover:text-brand-accent uppercase tracking-widest transition-colors italic"
                    >
                      Lupa Password?
                    </button>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-sidebar text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand-sidebar/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Masuk Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-accent/30 group-hover:bg-brand-accent transition-all" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Help */}
        <div className="pt-8 border-t border-brand-border text-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
              Bermasalah dengan akun? <button className="text-brand-accent hover:underline decoration-2 underline-offset-4">Hubungi Operator Sekolah</button>
           </p>
           <div className="mt-12 flex justify-center items-center gap-4 text-slate-300">
              <div className="h-[1px] w-12 bg-current" />
              <div className="w-2 h-2 rounded-full bg-current" />
              <div className="h-[1px] w-12 bg-current" />
           </div>
        </div>

        {/* Super Admin Access Discrete Entry */}
        <div className="text-center">
           <Link 
             to="/super-admin"
             className="text-[9px] font-black uppercase text-slate-300 hover:text-brand-accent transition-colors tracking-[0.2em] italic"
           >
             Super Admin Central Access
           </Link>
        </div>

      </div>
    </div>
  );
}
