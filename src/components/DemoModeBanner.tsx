import React from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';

export default function DemoModeBanner() {
  const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
  if (!isDemoMode) return null;

  return (
    <div className="bg-amber-500 border-b border-amber-600 px-4 py-3 flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-slate-900 shrink-0" />
      <div className="flex flex-col">
        <span className="text-xs font-black text-slate-900 uppercase tracking-widest italic">Mode Simulasi (Read-Only)</span>
        <span className="text-[10px] text-slate-800 font-bold">Data demo tidak akan disimpan. Perubahan permanen tidak didukung.</span>
      </div>
    </div>
  );
}
