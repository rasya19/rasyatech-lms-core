import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { Rocket, Loader2 } from 'lucide-react';

export default function RegisterSchool() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    npsn: '',
    adminName: '',
    adminEmail: '',
    whatsapp: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        ...formData,
        status: 'pending',
        is_approved: false,
        createdAt: serverTimestamp()
      });
      toast.success('Pendaftaran sekolah berhasil! Mohon tunggu verifikasi.');
      navigate('/');
    } catch (error) {
      toast.error('Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg p-10 rounded-[2.5rem] shadow-xl border border-brand-border">
        <h2 className="text-2xl font-black text-brand-sidebar uppercase italic tracking-tighter mb-8">Daftar Sekolah Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" placeholder="Nama Sekolah" required className="w-full p-4 rounded-xl border border-brand-border text-sm" onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="NPSN" required className="w-full p-4 rounded-xl border border-brand-border text-sm" onChange={e => setFormData({...formData, npsn: e.target.value})} />
          <input type="text" placeholder="Nama Admin" required className="w-full p-4 rounded-xl border border-brand-border text-sm" onChange={e => setFormData({...formData, adminName: e.target.value})} />
          <input type="email" placeholder="Email Admin" required className="w-full p-4 rounded-xl border border-brand-border text-sm" onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
          <input type="text" placeholder="WhatsApp (08...)" required className="w-full p-4 rounded-xl border border-brand-border text-sm" onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
          <button disabled={loading} className="w-full bg-brand-sidebar text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <Rocket />} Kirim Pendaftaran
          </button>
        </form>
      </div>
    </div>
  );
}
