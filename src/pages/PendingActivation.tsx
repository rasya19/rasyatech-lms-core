import React from 'react';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { useSchool } from '../contexts/SchoolContext';

export default function PendingActivation() {
  const { school } = useSchool();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-12 h-12 text-orange-500" />
      </div>
      <h1 className="text-3xl font-black text-brand-sidebar uppercase italic tracking-tighter mb-4">Aktivasi Diperlukan</h1>
      <p className="text-sm text-slate-500 mb-8 max-w-md">
        Akun Anda sedang dalam status pending. Silakan hubungi Customer Service Rasyatech untuk proses aktivasi dan informasi pembayaran.
      </p>
      <a 
        href={getWhatsAppLink(school?.name, school?.npsn)} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
      >
        <MessageCircle className="w-5 h-5" /> Hubungi WhatsApp CS
      </a>
    </div>
  );
}

const getWhatsAppLink = (schoolName: string = 'Sekolah', npsn: string = 'NPSN') => {
  const message = `Halo Rasyatech, saya Admin dari ${schoolName} ingin mengaktifkan akun LMS dengan NPSN ${npsn}. Mohon panduannya.`;
  return `https://wa.me/6281918226387?text=${encodeURIComponent(message)}`;
};
