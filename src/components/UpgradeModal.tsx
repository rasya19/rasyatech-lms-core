import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, ShieldCheck, Zap, ArrowRight, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function UpgradeModal({ isOpen, onClose, featureName = 'Fitur Eksklusif' }: UpgradeModalProps) {
  const whatsappUrl = "https://wa.me/6281918226387?text=Halo%20Rasyatech,%20saya%20tertarik%20untuk%20upgrade%20ke%20Paket%20Platinum%20untuk%20sekolah%20saya.";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#1a1a1a] rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(212,175,55,0.15)] overflow-hidden"
          >
            {/* Premium Gold Accent Top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />
            
            {/* Background Decorative Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-[80px] -ml-24 -mb-24" />

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-10 relative z-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_15px_30px_rgba(212,175,55,0.3)] rotate-3">
                <Trophy className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-black text-white italic uppercase tracking-tight leading-tight mb-4">
                Fitur Eksklusif <span className="text-[#D4AF37]">Platinum 🚀</span>
              </h2>

              <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed">
                Maaf, fitur <span className="text-white font-bold">[{featureName}]</span> hanya tersedia untuk pengguna Paket Platinum. 
                Tingkatkan kualitas layanan digital sekolah Anda dengan fitur QR Card, Statistik Real-time, dan Support Prioritas.
              </p>

              <div className="grid grid-cols-1 gap-4 mb-10 text-left">
                {[
                  { icon: ShieldCheck, text: "Digital Student Card with QR Authentication" },
                  { icon: Zap, text: "Executive Dashboard & Professional Analytics" },
                  { icon: Trophy, text: "Priority Support & Strategic Consulting" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="p-2 bg-[#D4AF37]/20 rounded-xl">
                      <item.icon className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                >
                  <MessageCircle className="w-4 h-4" /> Hubungi Admin Rasyatech <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                
                <button 
                  onClick={onClose}
                  className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
                >
                  Mungkin Nanti, Saya Masih Ingin Menjelajah
                </button>
              </div>
            </div>

            {/* Footer Gold Texture */}
            <div className="h-2 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-center overflow-hidden">
               <div className="flex -space-x-1 opacity-20">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-[#D4AF37] blur-[1px]" />
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
