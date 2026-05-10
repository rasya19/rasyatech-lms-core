import { SCHOOL_NAME, getSchoolParts } from '../constants';
import React, { useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useSchool } from '../contexts/SchoolContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  GraduationCap, 
  BookOpen,
  Book, 
  ClipboardCheck, 
  FileBarChart, 
  ScrollText, 
  UserPlus, 
  Megaphone,
  LogOut,
  Bell,
  Search,
  Calendar,
  Clock,
  ChevronDown,
  FileText,
  Layers,
  ArrowUpCircle,
  Globe,
  Check,
  Link2,
  Wallet,
  Settings,
  MessageSquare,
  Sparkles,
  Menu,
  X,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  ScanFace,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { supabase } from '../lib/supabase';

type Role = 'Admin' | 'Guru' | 'Siswa';

export default function Layout() {
  const { schoolSlug } = useParams();
  const { school } = useSchool();
  const [role, setRole] = useState<Role>((localStorage.getItem('userRole') as Role) || 'Siswa');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Master Data': false,
    'Akademik': false,
    'Ujian Online': false,
    'Keuangan': false
  });

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Use school data from context if available, fallback to constants
  // @ts-ignore
  const schoolDisplayName = school?.name || SCHOOL_NAME;
  const parts = school?.name 
    ? { first: school.name.split(' ')[0], rest: school.name.split(' ').slice(1).join(' ') }
    : getSchoolParts();

  const schoolFirst = parts.first;
  const schoolRest = parts.rest;

  // Sync role to localStorage if changed (for demo purposes)
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem('userRole', newRole);
    setIsRoleMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const studentId = localStorage.getItem('studentId');
      if (studentId) {
        await supabase.from('profiles_siswa').update({ is_online: false }).eq('id', studentId);
      }
      // Attempt sign out but don't strictly await it to prevent "stuck" redirects
      supabase.auth.signOut().catch(e => console.warn('Sign out error:', e));
    } catch (err) {
      console.warn('Logout try/catch error:', err);
    }

    // Clear storage first for immediate session termination in the browser
    const keysToRemove = [
      'userRole', 
      'isDemoMode', 
      'adminName', 
      'teacherName', 
      'studentName', 
      'studentId', 
      'studentNisn', 
      'studentClass'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    // Redirect immediately
    window.location.href = schoolSlug ? `/s/${schoolSlug}/login` : '/login';
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      alert('Password konfirmasi tidak cocok!');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsPasswordModalOpen(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      alert('Password berhasil diperbarui! Gunakan password baru untuk login berikutnya.');
    }, 1500);
  };

  const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
  const adminName = localStorage.getItem('adminName') || localStorage.getItem('teacherName') || localStorage.getItem('studentName') || (role === 'Admin' ? 'Administrator' : role);

  const getNavItems = (): (any & { isExternal?: boolean })[] => {
    const prefix = schoolSlug ? `/s/${schoolSlug}` : '';
    switch (role) {
      case 'Admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: `${prefix}/dashboard` },
          { 
            icon: FolderOpen, 
            label: 'Master Data', 
            subItems: [
              { icon: Users, label: 'Data Siswa', path: `${prefix}/data-siswa` },
              { icon: UserCheck, label: 'Data Guru', path: `${prefix}/data-guru` },
              { icon: Book, label: 'Mata Pelajaran', path: `${prefix}/dashboard/mata-pelajaran` },
              { icon: Layers, label: 'Kelola Kelas', path: `${prefix}/dashboard/kelas` },
              { icon: GraduationCap, label: 'Data Alumni', path: `${prefix}/dashboard/alumni` },
              { icon: UserPlus, label: 'Data Pendaftar', path: `${prefix}/dashboard/ppdb` },
            ]
          },
          {
            icon: BookOpen,
            label: 'Akademik',
            subItems: [
              { icon: Calendar, label: 'Jadwal Pelajaran', path: `${prefix}/dashboard/akademik` },
              { icon: Link2, label: 'Relasi Mengajar', path: `${prefix}/dashboard/relasi` },
              { icon: ArrowUpCircle, label: 'Kenaikan Kelas', path: `${prefix}/dashboard/kenaikan` },
              { icon: FileText, label: 'Cek Raport', path: `${prefix}/dashboard/raport` },
              { icon: FileBarChart, label: 'Analitik e-Rapor', path: `${prefix}/dashboard/analitik` },
              { icon: ScanFace, label: 'Deteksi Objek AI', path: `${prefix}/dashboard/deteksi-objek` },
            ]
          },
          {
            icon: ClipboardCheck,
            label: 'Ujian Online',
            subItems: [
              { icon: FileBarChart, label: 'Kelola Ujian', path: `${prefix}/dashboard/soal` },
              { icon: ClipboardCheck, label: 'Jadwal Ujian', path: `${prefix}/dashboard/ujian` },
              { icon: Eye, label: 'Monitoring Live', path: `${prefix}/dashboard/hasil-ujian` },
              { icon: Check, label: 'Riwayat Ujian', path: `${prefix}/dashboard/nilai` },
              { icon: Settings, label: 'Pengaturan', path: `${prefix}/dashboard/settings` },
            ]
          },
          {
            icon: Wallet,
            label: 'Keuangan',
            subItems: [
              { icon: Wallet, label: 'Pembayaran', path: `${prefix}/dashboard/keuangan` },
              { icon: FileText, label: 'Tagihan', path: `${prefix}/keuangan/tagihan` },
            ]
          },
          { icon: MessageSquare, label: 'Ruang Diskusi', path: `${prefix}/dashboard/diskusi` },
          { icon: Sparkles, label: 'Asisten AI', path: `${prefix}/dashboard/ai-asisten` },
          { icon: Settings, label: 'Manajemen Web', path: `${prefix}/dashboard/site` },
          { icon: Globe, label: 'Web Utama', path: schoolSlug ? `/s/${schoolSlug}` : '/', isExternal: true },
        ];
      case 'Guru':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: `${prefix}/dashboard` },
          { icon: Users, label: 'Data Siswa', path: `${prefix}/data-siswa` },
          { icon: BookOpen, label: 'Materi Ajar', path: `${prefix}/dashboard/materi` },
          { icon: ClipboardCheck, label: 'Kelola Ujian', path: `${prefix}/dashboard/ujian` },
          { icon: MessageSquare, label: 'Ruang Diskusi', path: `${prefix}/dashboard/diskusi` },
          { icon: Sparkles, label: 'Asisten AI', path: `${prefix}/dashboard/ai-asisten` },
          { icon: FileBarChart, label: 'Input Nilai', path: `${prefix}/dashboard/nilai` },
          { icon: FileText, label: 'Cek Raport', path: `${prefix}/dashboard/raport` },
        ];
      default: // Siswa
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: `${prefix}/dashboard` },
          { icon: BookOpen, label: 'Materi Saya', path: `${prefix}/dashboard/materi` },
          { icon: ClipboardCheck, label: 'Ikut Ujian', path: `${prefix}/dashboard/ujian` },
          { icon: MessageSquare, label: 'Ruang Diskusi', path: `${prefix}/dashboard/diskusi` },
          { icon: FileBarChart, label: 'Nilai Saya', path: `${prefix}/dashboard/nilai` },
          { icon: FileText, label: 'Raport Saya', path: `${prefix}/dashboard/raport` },
          { icon: ScrollText, label: 'SKL Digital', path: `${prefix}/dashboard/skl` },
        ];
    }
  };

  const navItems = getNavItems();

  const secondaryItems = [
    { icon: Megaphone, label: 'Pengumuman', path: `${schoolSlug ? '/s/' + schoolSlug : ''}/dashboard/pengumuman` },
    { icon: MessageSquare, label: 'Kritik & Saran', path: `${schoolSlug ? '/s/' + schoolSlug : ''}/dashboard/feedback` },
  ];

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Narrow/Darkish in HD theme */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-brand-sidebar flex flex-col transition-transform duration-300 transform lg:relative lg:translate-x-0 print:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:w-20 xl:w-64"
      )}>
        <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            {school?.logoUrl ? (
              <img 
                src={school.logoUrl} 
                alt={school.name} 
                className="w-10 h-10 object-contain bg-white rounded-xl shadow-lg shadow-brand-accent/20 p-1"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-brand-accent/20">
                {schoolFirst ? schoolFirst[0] : 'A'}
              </div>
            )}
            <div className="flex flex-col lg:hidden xl:flex">
               <h1 className="text-lg font-black text-white tracking-tighter uppercase italic leading-none">
                 {schoolFirst} <span className="text-brand-accent">{schoolRest}</span>
               </h1>
               <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mt-1.5">By <span className="text-brand-accent">Rasyacomp</span></span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold text-slate-500 px-3 py-2 uppercase tracking-widest lg:hidden xl:block">Utama</p>
          {navItems.map((item) => {
            if (item.subItems) {
              const isOpen = openMenus[item.label];
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group text-slate-400 hover:bg-white/10 hover:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span className="font-medium text-sm lg:hidden xl:block">{item.label}</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 transition-transform lg:hidden xl:block", isOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-2 lg:pl-0 xl:pl-4 space-y-1">
                          {item.subItems.map((sub: any) => (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                                isActive 
                                  ? "bg-brand-accent text-white" 
                                  : "text-slate-400 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                {sub.icon && <sub.icon className="w-4 h-4 transition-transform group-hover:scale-110" />}
                              </div>
                              <span className="font-medium text-xs lg:hidden xl:block">{sub.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return item.isExternal ? (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group justify-start text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm lg:hidden xl:block">{item.label}</span>
              </a>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group justify-start",
                  isActive 
                    ? "bg-brand-accent text-white" 
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm lg:hidden xl:block">{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/5">
            <p className="text-[10px] font-bold text-slate-500 px-3 py-2 uppercase tracking-widest lg:hidden xl:block">Informasi</p>
            {secondaryItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group justify-start",
                  isActive 
                    ? "bg-brand-accent text-white" 
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm lg:hidden xl:block">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/5 lg:hidden xl:block">
             <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Tech Ecosystem</p>
             <p className="text-[10px] font-black text-white italic tracking-tighter uppercase">RASYAC<span className="text-brand-accent">OMP</span> <span className="text-[8px] text-slate-500 font-bold not-italic">CLOUD</span></p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all justify-start"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm lg:hidden xl:block">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 flex flex-col min-w-0 bg-white lg:bg-brand-bg print:bg-white print:p-0 h-full relative">
        {/* Header - HD theme is clean/white */}
        <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-4 lg:px-8 shrink-0 print:hidden gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 lg:hidden text-brand-sidebar hover:bg-slate-100 rounded-lg transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:block">
               <h2 className="text-sm font-bold text-brand-text-main mb-0 hidden md:block">
                 {adminName} <span className="text-brand-accent italic">{role}</span>
               </h2>
               <p className="text-[10px] text-brand-text-muted uppercase tracking-wider hidden md:block">
                 {isDemoMode ? 'Sedang dalam mode uji coba publik' : (role === 'Siswa' ? 'Selamat belajar kembali' : role === 'Guru' ? 'Manajemen pembelajaran hari ini' : 'Kendali sistem pusat Rasyatech')}
               </p>
            </div>
          </div>

          <div className="flex-1 max-w-sm px-3 py-1.5 rounded-lg bg-slate-100 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari..." 
              className="bg-transparent border-none outline-none text-xs w-full focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-4">
            {role === 'Admin' && (
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="p-1.5 text-brand-text-muted hover:bg-slate-50 hover:text-brand-accent rounded-lg transition-all cursor-pointer"
                title="Ganti Password"
              >
                <Lock className="w-5 h-5" />
              </button>
            )}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-1.5 text-brand-text-muted hover:bg-slate-50 rounded-lg transition-all cursor-pointer relative"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full border-2 border-white"></span>
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-72 bg-white border border-brand-border rounded-[1.5rem] shadow-2xl z-[100] overflow-hidden"
                  >
                    <div className="p-4 border-b border-brand-border flex items-center justify-between bg-slate-50/50">
                      <h3 className="text-[10px] font-black uppercase text-brand-sidebar tracking-widest italic">Notifikasi <span className="text-brand-accent">Baru</span></h3>
                      <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-brand-sidebar">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {[
                        { title: 'Tagihan Baru', desc: 'Tagihan pendaftaran telah dibuat.', time: '2 menit yang lalu', icon: Wallet, color: 'bg-blue-500' },
                        { title: 'Update Sistem', desc: 'Pemeliharaan server selesai dilakukan.', time: '1 jam yang lalu', icon: Sparkles, color: 'bg-brand-accent' },
                        { title: 'Pendaftar Baru', desc: 'Siswa baru telah mendaftar via PPDB.', time: '3 jam yang lalu', icon: UserPlus, color: 'bg-green-500' },
                      ].map((n, i) => (
                        <div key={i} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                          <div className="flex gap-3">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm", n.color)}>
                              <n.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black text-brand-sidebar truncate group-hover:text-brand-accent transition-colors">{n.title}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{n.desc}</p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-1 italic">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-3 bg-slate-50 text-[9px] font-black uppercase text-brand-sidebar hover:bg-brand-sidebar hover:text-white transition-all tracking-widest italic">
                      Lihat Semua Notifikasi
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Role Switcher - ONLY show for Admin role to toggle between views */}
            {role === 'Admin' && (
              <div className="relative">
                <button 
                  onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                  className="flex items-center gap-2 border border-brand-border pl-3 pr-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all font-bold"
                >
                   <span className="text-[10px] font-black uppercase text-brand-accent tracking-widest">{role} VIEW</span>
                   <ChevronDown className={cn("w-3 h-3 transition-transform", isRoleMenuOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence>
                  {isRoleMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      className="absolute right-0 mt-2 w-40 bg-white border border-brand-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-2 bg-slate-50 border-b border-brand-border">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Simulasi Role</p>
                      </div>
                      {(['Admin', 'Guru', 'Siswa'] as Role[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleChange(r)}
                          className={cn(
                            "w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-between",
                            role === r ? "text-brand-accent" : "text-slate-500"
                          )}
                        >
                          {r} {role === r && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="w-8 h-8 bg-brand-border rounded-full border border-brand-accent flex items-center justify-center text-[10px] font-bold text-brand-text-main">
               {adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-brand-accent/10 border-b border-brand-accent/20 px-4 lg:px-8 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
              <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em] italic">Aktif: Mode Demo & Uji Coba</span>
            </div>
            <p className="text-[9px] text-brand-accent font-bold italic leading-none hidden md:block">
              Beberapa fitur tulis-ke-spreadsheet mungkin dibatasi untuk menjaga keamanan data utama.
            </p>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>

        {/* Password Change Modal */}
        <AnimatePresence>
          {isPasswordModalOpen && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPasswordModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[2rem] border border-brand-border p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-bg rounded-2xl border border-brand-border text-brand-accent">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-brand-sidebar uppercase italic tracking-widest text-lg">GANTI <span className="text-brand-accent">PASSWORD</span></h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">Pengamanan Akun Administrator</p>
                    </div>
                  </div>
                  <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-brand-sidebar">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Password Sekarang</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <input 
                        type="password" 
                        required
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                        className="w-full bg-slate-50 border border-brand-border rounded-xl py-4 pl-12 pr-4 text-xs font-bold text-brand-sidebar focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Password Baru</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-brand-border rounded-xl py-4 pl-12 pr-12 text-xs font-bold text-brand-sidebar focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand-accent"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Check className="w-4 h-4" />
                      </div>
                      <input 
                        type="password" 
                        required
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                        className="w-full bg-slate-50 border border-brand-border rounded-xl py-4 pl-12 pr-4 text-xs font-bold text-brand-sidebar focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-sidebar text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-sidebar/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Simpan Perubahan <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Right Panel - Dense Info (Visible on Large Screens) */}
      <aside className="w-80 bg-white border-l border-brand-border hidden xl:flex flex-col p-6 space-y-8 overflow-y-auto print:hidden">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-brand-text-main">Kalender Belajar</h3>
            <span className="text-[10px] font-bold text-brand-accent">Mei 2026</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((d, i) => (
              <span key={`${d}-${i}`} className="text-[10px] text-brand-text-muted font-bold py-1">{d}</span>
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <div 
                key={i} 
                className={cn(
                  "aspect-square flex items-center justify-center text-[11px] rounded-md transition-all cursor-pointer",
                  i === 2 ? "bg-brand-accent text-white font-bold" : "text-brand-text-main hover:bg-brand-bg"
                )}
              >
                {i + 12}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-brand-text-main">Tugas Mendatang</h3>
          {[
            { title: 'Kuis Fotografi', deadline: 'Hari ini, 23:59', color: 'bg-brand-accent' },
            { title: 'Project Akhir', deadline: 'Besok, 18:00', color: 'bg-orange-400' },
            { title: 'Review Modul 2', deadline: 'Terlambat 2 Jam', color: 'bg-red-500' },
          ].map((task, i) => (
            <div key={i} className="flex gap-3 items-start p-3 bg-brand-bg rounded-lg border-l-4" style={{ borderColor: i === 0 ? '#3b82f6' : i === 1 ? '#fbbf24' : '#ef4444' }}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-text-main truncate">{task.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-brand-text-muted" />
                  <span className="text-[10px] text-brand-text-muted">{task.deadline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-brand-sidebar rounded-xl p-4 text-white">
           <div className="flex items-center gap-2 mb-2">
             <Calendar className="w-4 h-4 text-brand-accent" />
             <span className="text-xs font-bold">Event Kampus</span>
           </div>
           <p className="text-[11px] text-slate-300">Webinar AI in Education akan dimulai dalam 2 jam.</p>
           <button className="w-full mt-3 py-1.5 bg-brand-accent rounded-lg text-[10px] font-bold">Ingatkan Saya</button>
        </div>
      </aside>
    </div>
  );
}
