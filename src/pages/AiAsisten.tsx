import React, { useState } from 'react';
import { Sparkles, FileText, Layout, Send, Loader2, Copy, Check, Wand2, BookOpen, GraduationCap, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn, isValidGeminiKey } from '../lib/utils';

type Mode = 'RPP' | 'RAPORT';

export default function AiAsisten() {
  const getAiClient = () => {
    // In Vite, process.env might not be available directly in all contexts.
    // Try both process.env and a fallback to provide the best compatibility.
    let apiKey = '';
    try {
      apiKey = (process.env.GEMINI_API_KEY) || '';
    } catch (e) {
      // Fallback if process is not defined
      console.warn("Process is not defined, unable to access GEMINI_API_KEY via process.env");
    }

    if (!apiKey) {
      throw new Error("API Key Gemini tidak ditemukan. Pastikan environment variable GEMINI_API_KEY sudah diatur.");
    }
    return new GoogleGenAI({ apiKey });
  };

  const [mode, setMode] = useState<Mode>('RPP');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Form states for RPP
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('Paket C (SMA)');
  const [duration, setDuration] = useState('2 x 45 Menit');

  // Form states for Raport
  const [studentName, setStudentName] = useState('');
  const [scores, setScores] = useState('');
  const [achievements, setAchievements] = useState('');
  const [behavior, setBehavior] = useState('');

  const generateRPP = async () => {
    setLoading(true);
    setResult('');
    try {
      if (!subject || !topic) {
        setResult('Mohon lengkapi Mata Pelajaran dan Topik.');
        setLoading(false);
        return;
      }

      const prompt = `Buatkan Rencana Pelaksanaan Pembelajaran (RPP) Kurikulum Merdeka untuk:
      Mata Pelajaran: ${subject}
      Materi/Topik: ${topic}
      Jenjang: ${grade}
      Alokasi Waktu: ${duration}
      
      Format output harus mencakup:
      1. Tujuan Pembelajaran
      2. Langkah-langkah Pembelajaran (Pembukaan, Inti, Penutup)
      3. Media & Sumber Belajar
      4. Asesmen/Penilaian
      
      Gunakan bahasa Indonesia yang formal dan profesional untuk guru.`;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      setResult(response.text || 'Gagal menghasilkan RPP.');
    } catch (error: any) {
      console.error('AI Error:', error);
      const msg = error.message || 'Error tidak dikenal';
      setResult(`Terjadi kesalahan saat menghubungi AI: ${msg}. Pastikan koneksi internet stabil dan kunci API valid.`);
    } finally {
      setLoading(false);
    }
  };

  const generateRaport = async () => {
    setLoading(true);
    setResult('');
    try {
      if (!studentName || !scores) {
        setResult('Mohon lengkapi Nama Siswa dan Rangkuman Nilai.');
        setLoading(false);
        return;
      }

      const prompt = `Buatkan narasi raport Kurikulum Merdeka (Capaian Kompetensi) untuk siswa berikut:
      Nama: ${studentName}
      Nilai rata-rata: ${scores}
      Prestasi Utama: ${achievements}
      Sikap/Karakter: ${behavior}
      
      Buatlah narasi yang memotivasi, objektif, dan sesuai dengan standar Kurikulum Merdeka. 
      Sebutkan kelebihan siswa dan area yang perlu ditingkatkan dengan bahasa yang santun.
      Tulis dalam 2-3 paragraf.`;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      setResult(response.text || 'Gagal menghasilkan narasi raport.');
    } catch (error: any) {
      console.error('AI Error:', error);
      const msg = error.message || 'Error tidak dikenal';
      setResult(`Terjadi kesalahan saat menghubungi AI: ${msg}. Pastikan koneksi internet stabil dan kunci API valid.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${mode}</title></head>
      <body style="font-family: 'Times New Roman', serif;">
        <h2 style="text-align: center; text-transform: uppercase;">${mode === 'RPP' ? 'Rencana Pelaksanaan Pembelajaran' : 'Narasi Raport Siswa'}</h2>
        <hr>
        <div style="white-space: pre-wrap;">${result}</div>
      </body>
      </html>
    `;
    const element = document.createElement("a");
    const file = new Blob(['\ufeff', content], {type: 'application/msword'});
    element.href = URL.createObjectURL(file);
    element.download = `${mode === 'RPP' ? 'RPP' : 'Raport'}_${subject || studentName || 'Hasil'}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-5xl space-y-8 pb-20">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-bold text-brand-text-main tracking-tight uppercase italic underline decoration-brand-accent decoration-2">ASISTEN <span className="text-brand-accent">CERDAS AI</span></h2>
          <p className="text-[10px] text-brand-text-muted font-bold tracking-widest mt-1 uppercase">Solusi Administrasi Berbasis Kurikulum Merdeka</p>
        </div>
        <div className="flex bg-white border border-brand-border rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => { setMode('RPP'); setResult(''); }}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-bold uppercase transition-all tracking-widest italic",
              mode === 'RPP' ? "bg-brand-sidebar text-white shadow-lg" : "text-slate-400 hover:text-brand-sidebar"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" /> Generator RPP
          </button>
          <button 
            onClick={() => { setMode('RAPORT'); setResult(''); }}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-bold uppercase transition-all tracking-widest italic",
              mode === 'RAPORT' ? "bg-brand-sidebar text-white shadow-lg" : "text-slate-400 hover:text-brand-sidebar"
            )}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Narasi Raport
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input Side */}
        <motion.div 
          layout
          className="bg-white border border-brand-border rounded-3xl p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-brand-accent/10 rounded-2xl">
              <Sparkles className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-sm font-black text-brand-sidebar uppercase italic tracking-widest leading-none">KONFIGURASI <span className="text-brand-accent">{mode}</span></h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-2">Lengkapi data untuk hasil terbaik</p>
            </div>
          </div>

          <div className="space-y-5">
            {mode === 'RPP' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Mata Pelajaran</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Ekonomi, Sosiologi, IPA"
                    className="w-full bg-slate-50 border border-brand-border p-4 rounded-2xl text-xs font-bold outline-none focus:border-brand-accent transition-all"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Materi / Topik Utama</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Keseimbangan Pasar, Fotosintesis"
                    className="w-full bg-slate-50 border border-brand-border p-4 rounded-2xl text-xs font-bold outline-none focus:border-brand-accent transition-all"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Jenjang</label>
                    <select 
                      className="w-full bg-slate-50 border border-brand-border p-4 rounded-2xl text-xs font-bold outline-none focus:border-brand-accent transition-all"
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                    >
                      <option>Paket A (SD)</option>
                      <option>Paket B (SMP)</option>
                      <option>Paket C (SMA)</option>
                      <option>Vokasi / Kursus</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Waktu</label>
                    <input 
                      type="text" 
                      placeholder="2 x 45 Menit"
                      className="w-full bg-slate-50 border border-brand-border p-4 rounded-2xl text-xs font-bold outline-none focus:border-brand-accent transition-all"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Nama Siswa</label>
                  <input 
                    type="text" 
                    placeholder="Nama Lengkap Siswa"
                    className="w-full bg-slate-50 border border-brand-border p-4 rounded-2xl text-xs font-bold outline-none focus:border-brand-accent transition-all"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Rangkuman Nilai</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Matematika 85, B.Indo 90"
                    className="w-full bg-slate-50 border border-brand-border p-4 rounded-2xl text-xs font-bold outline-none focus:border-brand-accent transition-all"
                    value={scores}
                    onChange={e => setScores(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Capaian / Prestasi</label>
                  <textarea 
                    placeholder="Sebutkan prestasi atau keaktifan menonjol"
                    className="w-full bg-slate-50 border border-brand-border p-4 rounded-2xl text-xs font-bold outline-none focus:border-brand-accent transition-all min-h-[80px] resize-none"
                    value={achievements}
                    onChange={e => setAchievements(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Sikap & Karakter</label>
                  <textarea 
                    placeholder="Contoh: Sopan, Disiplin, Perlu bimbingan kemandirian"
                    className="w-full bg-slate-50 border border-brand-border p-4 rounded-2xl text-xs font-bold outline-none focus:border-brand-accent transition-all min-h-[80px] resize-none"
                    value={behavior}
                    onChange={e => setBehavior(e.target.value)}
                  />
                </div>
              </>
            )}

            <button 
              onClick={mode === 'RPP' ? generateRPP : generateRaport}
              disabled={loading}
              className="w-full bg-brand-sidebar text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] italic shadow-2xl shadow-brand-sidebar/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sedang Diproses AI...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" /> Mulai Generate Dengan AI
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Result Side */}
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded-3xl p-8 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 bg-brand-accent/5 rounded-bl-3xl border-l border-b border-brand-border">
                <Sparkles className="w-4 h-4 text-brand-accent" />
             </div>
             
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-black text-brand-sidebar uppercase italic tracking-widest leading-none">HASIL <span className="text-brand-accent">GENERASI AI</span></h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-2">Draf siap pakai atau diedit kembali</p>
                </div>
                {result && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDownload}
                      className="p-2.5 bg-brand-accent text-white border border-brand-accent rounded-xl hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20"
                      title="Download as File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleCopy}
                      className="p-2.5 bg-slate-50 border border-brand-border rounded-xl hover:bg-white transition-all text-slate-400 hover:text-brand-accent"
                      title="Salin Teks"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
             </div>

             <div className="flex-1 bg-slate-50/50 rounded-2xl border border-dashed border-brand-border p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {!result && !loading ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4"
                    >
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <FileText className="w-8 h-8 text-slate-200" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-300 uppercase italic tracking-widest">Belum ada data</p>
                          <p className="text-[9px] text-slate-400 font-bold max-w-[200px] mx-auto mt-2">Isi formulir di sebelah kiri dan klik tombol generate untuk memulai.</p>
                       </div>
                    </motion.div>
                  ) : loading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-3"
                    >
                       <div className="relative">
                          <div className="w-12 h-12 border-4 border-slate-100 rounded-full" />
                          <div className="w-12 h-12 border-4 border-brand-accent rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
                       </div>
                       <p className="text-[10px] font-black text-brand-sidebar uppercase italic tracking-widest animate-pulse">Gemini sedang menyusun draf...</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="whitespace-pre-wrap text-[11px] text-brand-text-main leading-relaxed font-medium"
                    >
                      {result}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {result && (
               <div className="mt-6 flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-emerald-600">
                        <Check className="w-4 h-4" />
                     </div>
                     <p className="text-[10px] font-black text-emerald-800 uppercase italic">Draf Selesai Disusun</p>
                  </div>
                  <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest">Gunakan tombol di atas untuk unduh atau salin</p>
               </div>
             )}
          </div>

          <div className="bg-brand-sidebar rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl shadow-brand-sidebar/20">
             <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-brand-accent" />
                   <span className="text-[10px] font-black tracking-widest uppercase italic">Tips AI Mentor</span>
                </div>
                <p className="text-[11px] text-slate-300 italic leading-relaxed">
                   "Berikan konteks yang lebih detail pada kolom prestasi atau sikap untuk mendapatkan narasi raport yang lebih menyentuh hati orang tua siswa."
                </p>
             </div>
             <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
