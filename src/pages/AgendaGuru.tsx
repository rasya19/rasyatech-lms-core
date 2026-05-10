import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, BookOpen, Clock, Calendar, 
  Plus, Search, Save, Loader2, Book,
  CheckCircle2, RefreshCcw, AlertCircle, ChevronRight,
  TrendingUp, FileText, Send
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

type AgendaStatus = 'Selesai' | 'Berlangsung' | 'Review';

interface AgendaEntry {
  id: string;
  date: string;
  subject: string;
  class_name: string;
  material: string;
  assignments: string;
  notes: string;
  status: AgendaStatus;
  created_at: string;
}

export default function AgendaGuru() {
  const [agendas, setAgendas] = useState<AgendaEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    class_name: '',
    material: '',
    assignments: '',
    notes: '',
    status: 'Selesai' as AgendaStatus,
    date: new Date().toISOString().split('T')[0]
  });

  const [subjects, setSubjects] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    fetchAgendas();
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    try {
      const { data: subjectData } = await supabase.from('mata_pelajaran').select('nama');
      const { data: classData } = await supabase.from('kelas').select('nama_kelas');
      
      setSubjects(subjectData?.map(s => s.nama) || ['Matematika', 'B. Indonesia', 'B. Inggris', 'IPA', 'IPS']);
      setClasses(classData?.map(c => c.nama_kelas) || ['10A', '10B', '11A', '11B', '12A', '12B']);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAgendas = async () => {
    try {
      setIsLoading(true);
      // Simulating fetch since table might not exist yet
      const { data, error } = await supabase
        .from('agenda_guru')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.warn('Using mock data for agenda');
        setAgendas([]);
      } else {
        setAgendas(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.class_name || !formData.material) {
      toast.error('Mohon lengkapi data yang wajib diisi.');
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase.from('agenda_guru').insert([formData]);

      if (error) {
        // Fallback for demo
        const newEntry = { ...formData, id: Math.random().toString(36), created_at: new Date().toISOString() };
        setAgendas([newEntry, ...agendas]);
        toast.success('Agenda berhasil dicatat (Mode Demo)');
      } else {
        toast.success('Agenda berhasil disimpan ke database.');
        fetchAgendas();
      }

      setFormData({
        ...formData,
        material: '',
        assignments: '',
        notes: '',
        status: 'Selesai'
      });
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAgendas = agendas.filter(a => 
    a.material?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Dynamic Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl border border-slate-700/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-20 -mb-20" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                <ClipboardList className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Agenda <span className="text-emerald-400">Pembelajaran</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Sistem Dokumentasi Aktivitas Belajar Mengajar RI-1</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                 <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Sesi</p>
                 <p className="text-2xl font-black text-white italic">{agendas.length}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                 <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Minggu Ini</p>
                 <p className="text-2xl font-black text-white italic">12</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                 <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Materi Selesai</p>
                 <p className="text-2xl font-black text-white italic">85%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col justify-center gap-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Inspirasi Hari Ini</h3>
          </div>
          <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
            "Mengajar bukan hanya mentransfer ilmu, tapi menumbuhkan rasa ingin tahu dalam setiap jiwa siswa."
          </p>
          <div className="flex items-center gap-2 pt-2">
            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PKBM Digital Team</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Form: Catat Agenda */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                 <Plus className="w-5 h-5" />
               </div>
               <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">Catat Sesi Baru</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mata Pelajaran</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  >
                    <option value="">Pilih Mapel</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kelas</label>
                  <select 
                    value={formData.class_name}
                    onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Materi Yang Diajarkan</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea 
                    rows={2}
                    placeholder="Apa yang dipelajari hari ini?"
                    value={formData.material}
                    onChange={(e) => setFormData({...formData, material: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tugas / PR (Opsional)</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea 
                    rows={2}
                    placeholder="Instruksi tugas siswa..."
                    value={formData.assignments}
                    onChange={(e) => setFormData({...formData, assignments: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Status & Tanggal</label>
                <div className="flex gap-4">
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as AgendaStatus})}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-700"
                  >
                    <option value="Selesai">Selesai</option>
                    <option value="Berlangsung">Berlangsung</option>
                    <option value="Review">Review</option>
                  </select>
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-[10px] font-bold text-slate-700"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-slate-900 border border-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-600 hover:border-emerald-500 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publish Agenda Mengajar
              </button>
            </form>
          </div>
        </div>

        {/* Right Section: Timeline & Catatan */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm min-h-[600px]">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Clock className="w-5 h-5" />
                   </div>
                   <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">Timeline Aktifitas</h2>
                </div>

                <div className="relative w-full sm:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Cari materi / mapel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                   />
                </div>
             </div>

             <div className="space-y-8 relative">
                {/* Vertical Line */}
                <div className="absolute left-[20px] top-4 bottom-4 w-px bg-slate-100" />

                {isLoading ? (
                  <div className="flex flex-col items-center py-20">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Agenda...</p>
                  </div>
                ) : filteredAgendas.length === 0 ? (
                  <div className="flex flex-col items-center py-32 opacity-20">
                     <Book className="w-16 h-16 text-slate-300 mb-4" />
                     <p className="text-xs font-black uppercase tracking-widest text-slate-400">Belum ada agenda tercatat</p>
                  </div>
                ) : (
                  filteredAgendas.map((item, idx) => (
                    <div key={item.id || idx} className="relative pl-12 group">
                       {/* Indicator Circle */}
                       <div className={cn(
                         "absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110",
                         item.status === 'Selesai' ? "bg-emerald-500" : item.status === 'Review' ? "bg-amber-500" : "bg-blue-500"
                       )}>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                       </div>

                       <div className="bg-slate-50 border border-slate-100/50 p-6 rounded-3xl hover:border-emerald-500/20 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                   <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase italic tracking-tight">{item.material}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.15em] italic">{item.subject}</span>
                                  <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-bold">Kelas {item.class_name}</span>
                                </div>
                             </div>
                             
                             <div className={cn(
                               "px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.1em]",
                               item.status === 'Selesai' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : item.status === 'Review' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                             )}>
                               {item.status}
                             </div>
                          </div>

                          {item.assignments && (
                            <div className="mt-4 p-4 bg-white/60 border border-slate-100 rounded-2xl">
                               <div className="flex items-center gap-2 mb-2">
                                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tugas Utama:</span>
                               </div>
                               <p className="text-xs font-semibold text-slate-700">{item.assignments}</p>
                            </div>
                          )}

                          {item.notes && (
                            <div className="mt-4 flex items-start gap-3">
                               <div className="w-1 h-8 bg-slate-300 rounded-full mt-1" />
                               <p className="text-xs text-slate-500 italic leading-relaxed">" {item.notes} "</p>
                            </div>
                          )}

                          <button className="mt-6 flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:gap-3">
                             Lihat Detail Sesi <ChevronRight className="w-3 h-3" />
                          </button>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
