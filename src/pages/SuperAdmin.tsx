import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Rocket, Zap, Search, 
  Plus, Edit2, Trash2, ShieldCheck, ExternalLink,
  Loader2, CheckCircle2, AlertCircle, TrendingUp,
  DollarSign, Globe, Settings, Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, setDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function SuperAdmin() {
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    npsn: '',
    adminEmail: '',
    packageId: 'basic',
    status: 'active',
    expiryDate: ''
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'schools'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setSchools(data);
    } catch (error: any) {
      console.error('Error fetching schools:', error);
      toast.error('Gagal memuat data sekolah: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const schoolData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (editingSchool) {
        await updateDoc(doc(db, 'schools', editingSchool.id), schoolData);
        toast.success('Institusi berhasil diperbarui');
      } else {
        const id = formData.slug || Math.random().toString(36).substring(7);
        await setDoc(doc(db, 'schools', id), {
          ...schoolData,
          createdAt: serverTimestamp(),
        });
        toast.success('Institusi baru berhasil didaftarkan');
      }
      
      setIsModalOpen(false);
      setEditingSchool(null);
      fetchSchools();
    } catch (error: any) {
      toast.error('Gagal menyimpan: ' + error.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus institusi "${name}"? Seluruh data terkait akan hilang.`)) return;
    try {
      await deleteDoc(doc(db, 'schools', id));
      toast.success('Institusi berhasil dihapus');
      fetchSchools();
    } catch (error: any) {
      toast.error('Gagal menghapus: ' + error.message);
    }
  };

  const filteredSchools = schools.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-brand-sidebar p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-brand-accent/20 rounded-2xl border border-brand-accent/30 text-brand-accent">
                <ShieldCheck className="w-8 h-8" />
             </div>
             <div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">CENTRAL <span className="text-brand-accent">CONTROL</span></h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Sistem Manajemen Multi-Tenant Rasyatech</p>
             </div>
          </div>
        </div>
        
        <div className="relative z-10 flex gap-4 w-full md:w-auto">
           <button 
             onClick={() => {
               setEditingSchool(null);
               setFormData({ name: '', slug: '', npsn: '', adminEmail: '', packageId: 'basic', status: 'active', expiryDate: '' });
               setIsModalOpen(true);
             }}
             className="flex-1 md:flex-none bg-brand-accent text-brand-sidebar px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest italic flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-accent/20"
           >
             <Plus className="w-5 h-5" /> Daftarkan Sekolah Baru
           </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Sekolah', value: schools.length, icon: Building2, color: 'text-brand-accent' },
           { label: 'Sekolah Aktif', value: schools.filter(s => s.status === 'active').length, icon: CheckCircle2, color: 'text-emerald-400' },
           { label: 'Pendaftar Baru', value: '12', icon: TrendingUp, color: 'text-blue-400' },
           { label: 'Estimasi Revenue', value: 'Rp 45.2M', icon: DollarSign, color: 'text-brand-accent' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[2rem] border border-brand-border shadow-sm group hover:border-brand-accent transition-all">
              <div className="flex justify-between items-start mb-4">
                 <div className={cn("p-3 rounded-2xl bg-slate-50 group-hover:bg-brand-accent/10 transition-colors", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                 </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-brand-sidebar italic uppercase tracking-tighter">{stat.value}</h3>
           </div>
         ))}
      </div>

      {/* Database View */}
      <div className="bg-white border border-brand-border rounded-[3rem] p-8 shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-sm font-black text-brand-sidebar uppercase italic tracking-widest flex items-center gap-3">
               <Globe className="w-5 h-5 text-brand-accent" /> Network Directory
            </h2>
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Cari institusi atau slug..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-brand-border rounded-xl text-[10px] font-bold outline-none focus:border-brand-accent transition-all"
               />
            </div>
         </div>

         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="border-b border-brand-border">
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Info Institusi</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Endpoint / Slug</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Paket & Status</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Masa Berlaku</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Aksi</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                       <td colSpan={5} className="py-20 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-brand-accent mx-auto mb-4" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Data Institusi...</p>
                       </td>
                    </tr>
                  ) : filteredSchools.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="py-20 text-center">
                          <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tidak ada sekolah ditemukan</p>
                       </td>
                    </tr>
                  ) : filteredSchools.map((school) => (
                    <tr key={school.id} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-brand-sidebar text-xl italic group-hover:bg-brand-accent group-hover:text-white transition-all">
                                {school.name?.[0]}
                             </div>
                             <div>
                                <p className="text-xs font-black text-brand-sidebar uppercase italic tracking-tight">{school.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NPSN: {school.npsn || '-'}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                             <code className="text-xs font-black text-brand-accent bg-brand-accent/5 px-2 py-1 rounded">/{school.slug}</code>
                             <a href={`/s/${school.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-300 hover:text-brand-accent transition-colors">
                                <ExternalLink className="w-4 h-4" />
                             </a>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <div className="space-y-1.5">
                             <span className="text-[9px] font-black bg-brand-sidebar text-white px-2.5 py-1 rounded uppercase tracking-[0.2em]">{school.packageId}</span>
                             <div className="flex items-center gap-1.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", school.status === 'active' ? 'bg-emerald-500' : 'bg-red-500')} />
                                <span className={cn("text-[9px] font-black uppercase tracking-widest", school.status === 'active' ? 'text-emerald-500' : 'text-red-500')}>
                                   {school.status === 'active' ? 'AKTIVAT' : 'SUSPEND'}
                                </span>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                             {school.expiryDate ? new Date(school.expiryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Permanent'}
                          </p>
                       </td>
                       <td className="px-6 py-6 text-right">
                          <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={() => {
                                 setEditingSchool(school);
                                 setFormData({
                                   name: school.name || '',
                                   slug: school.slug || '',
                                   npsn: school.npsn || '',
                                   adminEmail: school.adminEmail || '',
                                   packageId: school.packageId || 'basic',
                                   status: school.status || 'active',
                                   expiryDate: school.expiryDate || ''
                                 });
                                 setIsModalOpen(true);
                               }}
                               className="p-2.5 bg-white border border-brand-border rounded-xl text-slate-400 hover:text-brand-accent hover:border-brand-accent transition-all shadow-sm"
                             >
                                <Edit2 className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => handleDelete(school.id, school.name)}
                               className="p-2.5 bg-white border border-brand-border rounded-xl text-slate-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modal Recreate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-brand-sidebar/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-brand-border">
              <div className="p-8 md:p-10">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-xl font-black text-brand-sidebar uppercase italic tracking-widest leading-none">
                         {editingSchool ? 'Edit Institusi' : 'Registrasi Institusi'}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-2">Sinkronisasi Dashboard Sekolah Baru</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">×</button>
                 </div>

                 <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nama Institusi</label>
                          <input 
                            type="text" 
                            required 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            placeholder="Contoh: PKBM Armilla Nusa..."
                            className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Slug / URL (Unik)</label>
                          <input 
                            type="text" 
                            required 
                            value={formData.slug} 
                            onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                            placeholder="contoh-sekolah"
                            className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none font-mono" 
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">NPSN</label>
                          <input 
                            type="text" 
                            value={formData.npsn} 
                            onChange={(e) => setFormData({...formData, npsn: e.target.value})} 
                            className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Admin Email</label>
                          <input 
                            type="email" 
                            required 
                            value={formData.adminEmail} 
                            onChange={(e) => setFormData({...formData, adminEmail: e.target.value})} 
                            className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" 
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Tipe Paket</label>
                          <select 
                            value={formData.packageId} 
                            onChange={(e) => setFormData({...formData, packageId: e.target.value})}
                            className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold outline-none"
                          >
                             <option value="basic">Startup (Basic)</option>
                             <option value="standard">Business (Standard)</option>
                             <option value="enterprise">Enterprise (Premium)</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Tanggal Expired</label>
                          <input 
                            type="date" 
                            value={formData.expiryDate} 
                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} 
                            className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" 
                          />
                       </div>
                    </div>

                    <button type="submit" className="w-full bg-brand-sidebar text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-brand-accent transition-all shadow-xl shadow-brand-sidebar/20 italic">
                       {editingSchool ? 'Simpan Perubahan' : 'Registrasi Sekarang'} <Rocket className="w-4 h-4" />
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
