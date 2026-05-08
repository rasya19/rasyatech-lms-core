import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSchool } from '../contexts/SchoolContext';
import { Star, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Feedback() {
  const { school } = useSchool();
  const adminName = localStorage.getItem('adminName') || 'Administrator';

  const [jabatan, setJabatan] = useState('Kepala Sekolah');
  const [feedback, setFeedback] = useState('');
  const [ratings, setRatings] = useState({
    kemudahan: 5,
    fitur: 5,
    pelayanan: 5,
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        schoolId: school?.id || 'unknown',
        schoolName: school?.name || 'Unknown',
        name: adminName,
        role: jabatan,
        feedback: feedback,
        ratings: ratings,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Terjadi kesalahan saat mengirim feedback.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (category: keyof typeof ratings, label: string) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-black uppercase text-slate-500 tracking-widest italic">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRatings(prev => ({ ...prev, [category]: star }))}
            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={cn(
                "w-8 h-8",
                 star <= ratings[category] ? "fill-brand-accent text-brand-accent" : "text-slate-300"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic uppercase text-brand-sidebar tracking-tighter">
          Kritik, Saran & <span className="text-brand-accent">Survey</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium italic mt-2">
          Masukan Anda sangat berarti untuk peningkatan kualitas layanan Armilla LMS.
        </p>
      </div>

      {submitted ? (
        <div className="bg-[#E8F5E9] border-2 border-[#4CAF50] rounded-[2rem] p-10 text-center shadow-xl">
           <div className="w-20 h-20 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-white" />
           </div>
           <h2 className="text-2xl font-black italic uppercase text-[#2E7D32]">Terima kasih atas masukan Anda</h2>
           <p className="text-sm font-medium text-[#4CAF50] italic mt-2 max-w-md mx-auto">
             Kritik, saran, dan penilaian Anda telah kami terima dan akan segera kami tindaklanjuti.
           </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-brand-border rounded-[2rem] p-8 shadow-sm">
          {/* Survey Section */}
          <div>
            <h3 className="text-lg font-black uppercase italic text-brand-sidebar mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              1. Survey Kepuasan
            </h3>
            
            <div className="space-y-6">
              {renderStars('kemudahan', 'Kemudahan Penggunaan')}
              {renderStars('fitur', 'Kelengkapan Fitur')}
              {renderStars('pelayanan', 'Kualitas Pelayanan Rasyacomp')}
            </div>
          </div>

          {/* Feedback Form Section */}
          <div className="pt-6">
            <h3 className="text-lg font-black uppercase italic text-brand-sidebar mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              2. Kritik & Saran
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic ml-1">Nama</label>
                <input
                  type="text"
                  value={adminName}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-600 outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic ml-1">Jabatan</label>
                <select
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 text-sm font-bold text-brand-sidebar outline-none focus:border-brand-accent transition-all cursor-pointer"
                >
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                  <option value="Guru">Guru</option>
                  <option value="Operator">Operator</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic ml-1">Kritik & Saran Detail</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                rows={5}
                placeholder="Bagaimana pengalaman Anda menggunakan Armilla LMS? Apa yang perlu kami perbaiki?"
                className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 text-sm font-medium text-brand-sidebar outline-none focus:border-brand-accent transition-all resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-sidebar text-white py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-brand-accent hover:scale-[1.02] active:scale-95 transition-all italic flex items-center justify-center gap-2"
          >
             {loading ? 'Mengirim...' : 'Kirim Feedback'}
          </button>
        </form>
      )}
    </div>
  );
}
