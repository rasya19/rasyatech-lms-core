import { TrendingUp, Award, BookOpen, PlayCircle, Clock, ChevronRight, AlertCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { Course } from '@/src/types';
import AdBanner from '@/src/components/AdBanner';
import { useSchool } from '../contexts/SchoolContext';

const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Bahasa Indonesia - Paket C',
    instructor: 'Dra. Siti Aminah',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60',
    progress: 65,
    category: 'Akademik',
    duration: '24 Jam',
    modules: []
  },
  {
    id: '2',
    title: 'Keterampilan Menjahit Dasar',
    instructor: 'Ibu Ratna',
    thumbnail: 'https://images.unsplash.com/photo-1528476513691-07e6f563d97f?w=800&auto=format&fit=crop&q=60',
    progress: 42,
    category: 'Vokasi',
    duration: '16 Jam',
    modules: []
  }
];

export default function Dashboard() {
  const { school } = useSchool();
  const adminName = localStorage.getItem('adminName') || 'Administrator';

  const isExpired = school?.expiryDate ? new Date(school.expiryDate) < new Date() : false;
  const isExpiringSoon = school?.expiryDate ? (new Date(school.expiryDate).getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000) : false;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Expiry Warning */}
      {isExpired ? (
        <div className="bg-red-600 text-white p-6 rounded-[2rem] shadow-xl shadow-red-600/20 flex items-center justify-between gap-6 border-4 border-red-400">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                 <XCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                 <h3 className="text-lg font-black uppercase italic italic leading-tight">Masa Aktif Berakhir!</h3>
                 <p className="text-xs font-bold text-white/80 italic">Akses dashboard Anda telah dibatasi. Segera hubungi pusat untuk perpanjangan.</p>
              </div>
           </div>
           <a href="https://wa.me/6285225025555" target="_blank" className="bg-white text-red-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all italic">Layanan Pusat</a>
        </div>
      ) : isExpiringSoon ? (
        <div className="bg-orange-500 text-white p-5 rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-between gap-4 border-2 border-orange-300">
           <div className="flex items-center gap-4">
              <Clock className="w-6 h-6 animate-pulse" />
              <div>
                 <h3 className="text-xs font-black uppercase italic italic leading-none">Peringatan Masa Aktif</h3>
                 <p className="text-[10px] font-bold text-white/80 italic mt-1">Masa aktif sekolah akan berakhir pada {school?.expiryDate}. Segera perpanjang layanan Anda.</p>
              </div>
           </div>
           <a href="https://wa.me/6285225025555" target="_blank" className="bg-white text-orange-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest italic shrink-0">Beli Paket</a>
        </div>
      ) : null}

      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold text-brand-text-main">Dashboard Utama</h2>
          <p className="text-xs text-brand-text-muted">Selamat datang kembali, {adminName}</p>
        </div>
      </section>

      {/* Urgent Exam Notice */}
      <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-red-900 uppercase italic leading-none">Ujian Sedang Berlangsung!</h4>
            <p className="text-[10px] text-red-700 italic mt-0.5">Segera kerjakan ujian STS s/d Minggu sebelum pendaftaran ditutup.</p>
          </div>
        </div>
        <Link 
          to="/dashboard/ujian" 
          className="w-full md:w-auto bg-red-600 text-white px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all text-center shadow-lg shadow-red-600/20"
        >
          Kerjakan Sekarang
        </Link>
      </div>

      {/* Compact Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'KURSUS AKTIF', value: '12', icon: BookOpen },
          { label: 'PROGRES', value: '68%', icon: PlayCircle },
          { label: 'JAM BELAJAR', value: '156j', icon: Clock },
          { label: 'SERTIFIKAT', value: '04', icon: Award },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-lg border border-brand-border flex flex-col justify-between"
          >
            <span className="text-[10px] font-bold text-brand-text-muted tracking-widest">{stat.label}</span>
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-xl font-bold text-brand-text-main">{stat.value}</h3>
              <stat.icon className="w-4 h-4 text-brand-accent opacity-50" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-brand-text-main">Kursus Saya</h3>
          <button className="text-brand-accent font-bold text-[11px] hover:underline flex items-center gap-1">
            Lihat Semua <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Dense Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_COURSES.map((course) => (
            <Link 
              to={`/dashboard/course/${course.id}`} 
              key={course.id} 
              className="bg-white rounded-xl border border-brand-border overflow-hidden group hover:border-brand-accent transition-all flex h-36"
            >
              <div className="w-32 bg-slate-100 relative overflow-hidden shrink-0">
                <img 
                  src={course.thumbnail || undefined} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-90"
                />
                <div className="absolute top-2 left-2 bg-white/90 px-1.5 py-0.5 rounded text-[8px] font-bold text-brand-accent uppercase">
                  {course.category}
                </div>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <h4 className="font-bold text-xs text-brand-text-main leading-tight line-clamp-1">
                    {course.title}
                  </h4>
                  <p className="text-[10px] text-brand-text-muted mt-1 truncate">Oleh {course.instructor}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-brand-text-muted">{course.progress}% Selesai</span>
                    <span className="text-brand-accent">{course.duration}</span>
                  </div>
                  <div className="h-1.5 bg-brand-border rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      className="h-full bg-brand-accent"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity Chart Section - Keeping it but theme-aligned */}
      <div className="bg-white p-5 rounded-xl border border-brand-border">
         <h3 className="text-xs font-bold text-brand-text-main mb-6 uppercase tracking-wider">Aktivitas Mingguan</h3>
         <div className="flex items-end gap-2 h-24 px-2">
           {[30, 50, 40, 95, 60, 75, 45].map((height, i) => (
             <div key={i} className="group relative flex-1">
               <motion.div
                 initial={{ height: 0 }}
                 animate={{ height: `${height}%` }}
                 className={cn(
                   "w-full rounded-t-sm transition-all cursor-crosshair",
                   i === 3 ? "bg-brand-accent" : "bg-slate-200 group-hover:bg-brand-accent/30"
                 )}
               />
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-sidebar text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                 {Math.round(height/10)}j
               </div>
             </div>
           ))}
         </div>
         <div className="flex justify-between mt-3 text-[9px] text-brand-text-muted font-bold px-1">
           {['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'].map(d => <span key={d}>{d}</span>)}
         </div>
      </div>

      <AdBanner slot="dashboard_footer" className="mt-8" />
    </div>
  );
}
