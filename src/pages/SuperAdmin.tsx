import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Rocket, Zap, Search, 
  Plus, Edit2, Trash2, ShieldCheck, 
  Loader2, CheckCircle2, Globe, DollarSign
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<'schools' | 'registrations' | 'affiliates'>('schools');
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);

  const handleGenerateDemoAccounts = async () => {
    setIsGeneratingDemo(true);
    try {
      const response = await fetch('/api/seed-demo', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error('Gagal: ' + result.message);
      }
    } catch (error: any) {
      toast.error('Terjadi kesalahan sistem.');
    } finally {
      setIsGeneratingDemo(false);
    }
  };
  const [schools, setSchools] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [visitorCount, setVisitorCount] = useState<number>(0);
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
    subscription_plan: 'Silver',
    status: 'active',
    expiryDate: ''
  });

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const fetchAllData = async () => {
    console.log('fetchAllData called for:', activeTab);
    setIsLoading(true);
    try {
      if (activeTab === 'schools') {
        console.log('Fetching schools...');
        const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
        if (error) {
          console.error('Error fetching schools:', error);
          throw error;
        }
        console.log('Fetched schools:', data);
        setSchools(data || []);
      } else if (activeTab === 'registrations') {
        console.log('Fetching registrations...');
        const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
        
        console.log('DEBUG [SuperAdmin] Result:', { data, error });
        
        if (error) {
          console.error('Error fetching registrations:', error);
          throw error;
        }
        
        setRegistrations(data?.map(d => ({
          id: d.id,
          name: d.school_name,
          npsn: d.npsn,
          adminName: d.admin_name,
          adminEmail: d.admin_email,
          whatsapp: d.whatsapp,
          status: d.status,
          packageId: d.packageId || 'basic',
          subscription_plan: d.subscription_plan || 'Silver'
        })) || []);
      } else if (activeTab === 'affiliates') {
        console.log('Fetching affiliates...');
        const { data, error } = await supabase.from('affiliates').select('*').order('created_at', { ascending: false });
        if (error) {
          console.error('Error fetching affiliates:', error);
          throw error;
        }
        console.log('Fetched affiliates:', data);
        setAffiliates(data || []);
      }

      // Always fetch visitor count
      const { data: stats, error: statsError } = await supabase.from('settings').select('value').eq('key', 'visitor_count').single();
      if (!statsError && stats) {
        setVisitorCount(parseInt(stats.value) || 0);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRegistration = async (reg: any) => {
    if (!window.confirm(`Aktifkan sekolah "${reg.name}"?`)) return;
    try {
      const slug = reg.name.toLowerCase().replace(/\s+/g, '-');
      
      const { error: schoolError } = await supabase.from('schools').insert([{
        name: reg.name,
        slug: slug,
        npsn: reg.npsn,
        admin_email: reg.adminEmail,
        status: 'active',
        is_approved: true,
        created_at: new Date().toISOString()
      }]);
      if (schoolError) throw schoolError;

      const { error: regError } = await supabase.from('registrations').update({ status: 'approved', is_approved: true }).eq('id', reg.id);
      if (regError) throw regError;
      
      toast.success('Sekolah berhasil diaktifkan!');
      fetchAllData();
    } catch (error: any) {
      toast.error('Gagal mengaktifkan: ' + error.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const schoolData = {
        name: formData.name,
        slug: formData.slug,
        npsn: formData.npsn,
        admin_email: formData.adminEmail,
        status: formData.status,
        subscription_plan: formData.subscription_plan,
        expiry_date: formData.expiryDate || null
      };

      if (editingSchool) {
        const { error } = await supabase.from('schools').update(schoolData).eq('id', editingSchool.id);
        if (error) throw error;
        toast.success('Institusi berhasil diperbarui');
      } else {
        const { error } = await supabase.from('schools').insert([{
            ...schoolData,
            is_approved: true,
            created_at: new Date().toISOString()
        }]);
        if (error) throw error;
        toast.success('Institusi baru berhasil didaftarkan');
      }
      
      setIsModalOpen(false);
      setEditingSchool(null);
      fetchAllData();
    } catch (error: any) {
      toast.error('Gagal menyimpan: ' + error.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus institusi "${name}"? Seluruh data terkait akan hilang.`)) return;
    try {
      const { error } = await supabase.from('schools').delete().eq('id', id);
      if (error) throw error;
      toast.success('Institusi berhasil dihapus');
      fetchAllData();
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
        
        <div className="relative z-10 flex flex-wrap gap-4 w-full md:w-auto">
           <button 
             onClick={handleGenerateDemoAccounts}
             disabled={isGeneratingDemo}
             className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest italic flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 disabled:grayscale"
           >
             {isGeneratingDemo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
             Generate 3 Demo Accounts
           </button>
           <button 
             onClick={() => {
               setEditingSchool(null);
               setFormData({ name: '', slug: '', npsn: '', adminEmail: '', packageId: 'basic', subscription_plan: 'Silver', status: 'active', expiryDate: '' });
               setIsModalOpen(true);
             }}
             className="flex-1 md:flex-none bg-brand-accent text-brand-sidebar px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest italic flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-accent/20"
           >
             <Plus className="w-5 h-5" /> Daftarkan Sekolah Baru
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
         {[
           { label: 'Total Sekolah', value: schools.length, icon: Building2, color: 'text-brand-accent' },
           { label: 'Pendaftar Baru', value: registrations.filter(r => r.status === 'pending').length, icon: Rocket, color: 'text-orange-400' },
           { label: 'Total Affiliate', value: affiliates.length, icon: Users, color: 'text-blue-400' },
           { label: 'Web Visitors', value: visitorCount.toLocaleString(), icon: Zap, color: 'text-amber-400' },
           { label: 'Estimasi Revenue', value: 'Rp 45.2M', icon: DollarSign, color: 'text-emerald-400' }
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

      {/* Tabs Selection */}
      <div className="flex gap-4 bg-slate-100 p-2 rounded-2xl w-fit">
         {[
           { id: 'schools', label: 'Network Sekolah', icon: Globe },
           { id: 'registrations', label: 'Pendaftar Baru', icon: Rocket },
           { id: 'affiliates', label: 'Manajemen Affiliate', icon: Users }
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={cn(
               "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
               activeTab === tab.id 
                 ? "bg-brand-sidebar text-brand-accent shadow-lg" 
                 : "text-slate-500 hover:bg-white hover:text-brand-sidebar"
             )}
           >
             <tab.icon className="w-4 h-4" /> {tab.label}
           </button>
         ))}
      </div>

      {/* Database View */}
      <div className="bg-white border border-brand-border rounded-[3rem] p-8 shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-sm font-black text-brand-sidebar uppercase italic tracking-widest flex items-center gap-3">
               {activeTab === 'schools' && <Globe className="w-5 h-5 text-brand-accent" />}
               {activeTab === 'registrations' && <Rocket className="w-5 h-5 text-orange-400" />}
               {activeTab === 'affiliates' && <Users className="w-5 h-5 text-blue-400" />}
               {activeTab === 'schools' ? 'Network Directory' : activeTab === 'registrations' ? 'Pending Registrations' : 'Partner Network'}
            </h2>
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search entries..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-brand-border rounded-xl text-[10px] font-bold outline-none focus:border-brand-accent transition-all"
               />
            </div>
         </div>

         <div className="overflow-x-auto custom-scrollbar">
            {activeTab === 'schools' && (
               <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                     <tr className="border-b border-brand-border">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Info Institusi</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Endpoint / Slug</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Paket & Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {isLoading ? (
                       <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-brand-accent mx-auto" /></td></tr>
                     ) : filteredSchools.map((school) => (
                       <tr key={school.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-brand-sidebar text-xl italic group-hover:bg-brand-accent group-hover:text-white transition-all">{school.name?.[0]}</div>
                                <div>
                                   <p className="text-xs font-black text-brand-sidebar uppercase italic tracking-tight">{school.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NPSN: {school.npsn || '-'}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-6">
                             <code className="text-xs font-black text-brand-accent bg-brand-accent/5 px-2 py-1 rounded">/{school.slug}</code>
                          </td>
                          <td className="px-6 py-6">
                             <div className="flex items-center gap-1.5"><div className={cn("w-1.5 h-1.5 rounded-full", school.status === 'active' ? 'bg-emerald-500' : 'bg-red-500')} /><span className={cn("text-[11px] font-black uppercase tracking-widest", school.status === 'active' ? 'text-emerald-500' : 'text-red-500')}>{school.status}</span></div>
                             <div className="mt-1">
                                <span className={cn(
                                  "text-[7px] font-black px-1.5 py-0.5 rounded uppercase",
                                  school.subscription_plan === 'Platinum' ? "bg-brand-accent text-white" :
                                  school.subscription_plan === 'Gold' ? "bg-amber-400 text-slate-900" :
                                  "bg-slate-200 text-slate-600"
                                )}>
                                  {school.subscription_plan || 'SILVER'}
                                </span>
                             </div>
                          </td>
                          <td className="px-6 py-6 text-right">
                             <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingSchool(school);
                                    setFormData({
                                      name: school.name,
                                      slug: school.slug,
                                      npsn: school.npsn,
                                      adminEmail: school.admin_email,
                                      packageId: 'basic',
                                      subscription_plan: school.subscription_plan || 'Silver',
                                      status: school.status,
                                      expiryDate: school.expiry_date || ''
                                    });
                                    setIsModalOpen(true);
                                  }}
                                  className="p-2.5 bg-white border border-brand-border rounded-xl text-slate-400 hover:text-brand-accent transition-all"
                                >
                                   <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(school.id, school.name)} className="p-2.5 bg-white border border-brand-border rounded-xl text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            )}

            {activeTab === 'registrations' && (
               <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                     <tr className="border-b border-brand-border">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Nama Sekolah</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Admin</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Kontak (WhatsApp)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Aksi Konfirmasi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {isLoading ? (
                       <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-brand-accent mx-auto" /></td></tr>
                     ) : registrations.map((reg) => (
                       <tr key={reg.id} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-6">
                                 <p className="text-xs font-black text-brand-sidebar uppercase italic tracking-tight">{reg.name}</p>
                                 <div className="flex items-center gap-2 mt-1">
                                   <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest italic">{reg.packageId} Plan</p>
                                   <span className="text-[9px] bg-slate-900 text-slate-100 px-1.5 py-0.5 rounded font-bold uppercase">{reg.subscription_plan || 'Silver'}</span>
                                 </div>
                              </td>
                          <td className="px-6 py-6">
                             <p className="text-[10px] font-bold text-slate-500 uppercase">{reg.adminName}</p>
                             <p className="text-[10px] font-bold text-slate-400">{reg.adminEmail}</p>
                          </td>
                          <td className="px-6 py-6 font-mono text-[11px] font-black text-brand-sidebar">{reg.whatsapp}</td>
                          <td className="px-6 py-6 text-right">
                             {reg.status !== 'approved' && (
                               <button 
                                 onClick={() => handleApproveRegistration(reg)}
                                 className="bg-brand-accent text-brand-sidebar px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest italic hover:scale-105 transition-all shadow-lg shadow-brand-accent/20"
                               >
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Aktifkan Sekolah
                               </button>
                             )}
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            )}

            {activeTab === 'affiliates' && (
               <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                     <tr className="border-b border-brand-border">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Nama Affiliate</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Kode Referral</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Total Referral</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {isLoading ? (
                       <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-brand-accent mx-auto" /></td></tr>
                     ) : affiliates.map((aff) => (
                       <tr key={aff.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-6">
                             <p className="text-xs font-black text-brand-sidebar uppercase italic tracking-tight">{aff.name}</p>
                             <p className="text-[10px] font-bold text-slate-400">{aff.email}</p>
                          </td>
                          <td className="px-6 py-6"><code className="text-xs font-black text-brand-accent">{aff.referralCode}</code></td>
                          <td className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{aff.totalReferrals || 0} SEKOALAH</td>
                          <td className="px-6 py-6 text-right">
                             <span className="text-[9px] font-black bg-brand-bg text-brand-sidebar px-3 py-1 rounded-full uppercase tracking-widest">Partner Aktif</span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            )}
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
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Subscription Plan</label>
                          <select 
                            value={formData.subscription_plan} 
                            onChange={(e) => setFormData({...formData, subscription_plan: e.target.value})}
                            className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold outline-none"
                          >
                             <option value="Silver">SILVER</option>
                             <option value="Gold">GOLD</option>
                             <option value="Platinum">PLATINUM</option>
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
