import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Flag, MonitorPlay, Check, Rocket } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

// Interfaces for mock data
interface Opsi {
  id: string;
  teks: string;
}

interface Soal {
  id: string;
  no: number;
  pertanyaan: string;
  opsi: Opsi[];
}

// Generate 50 mock questions
const MOCK_SOAL: Soal[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `S${i + 1}`,
  no: i + 1,
  pertanyaan: `Ini adalah contoh pertanyaan untuk soal nomor ${i + 1}. Pilihlah jawaban yang paling tepat menurut Anda dari opsi di bawah ini.`,
  opsi: [
    { id: 'A', teks: `Pilihan Jawaban A untuk soal ${i + 1}` },
    { id: 'B', teks: `Pilihan Jawaban B untuk soal ${i + 1}` },
    { id: 'C', teks: `Pilihan Jawaban C untuk soal ${i + 1}` },
    { id: 'D', teks: `Pilihan Jawaban D untuk soal ${i + 1}` },
    { id: 'E', teks: `Pilihan Jawaban E untuk soal ${i + 1}` },
  ],
}));

export default function UjianSiswa() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [raguRagu, setRaguRagu] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 minutes in seconds
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeSoal = MOCK_SOAL[currentIdx];

  // Timer Countdown
  useEffect(() => {
    if (!hasStarted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit logic
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (opsiId: string) => {
    setAnswers({ ...answers, [activeSoal.no]: opsiId });
    if (raguRagu[activeSoal.no]) {
      setRaguRagu({ ...raguRagu, [activeSoal.no]: false });
    }
  };

  const toggleRagu = () => {
    setRaguRagu({ ...raguRagu, [activeSoal.no]: !raguRagu[activeSoal.no] });
  };

  const handleNext = () => {
    if (currentIdx < MOCK_SOAL.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const jumpTo = (index: number) => {
    setCurrentIdx(index);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Error attempting to enable full-screen mode:", err.message);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const startExam = () => {
    toggleFullscreen();
    setHasStarted(true);
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleSubmit = () => {
    if (window.confirm('Yakin ingin menyelesaikan ujian? Anda tidak dapat kembali lagi.')) {
      // Logic for submit
      alert('Ujian berhasil diselesaikan!');
      if (document.fullscreenElement && document.exitFullscreen) {
         document.exitFullscreen();
      }
      navigate(-1);
    }
  };

  // Pre-Start Overlay
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
         <div className="max-w-md w-full bg-slate-800 p-10 rounded-[3rem] border border-slate-700 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
               <MonitorPlay className="w-10 h-10 ml-1" />
            </div>
            <h1 className="text-3xl font-black italic tracking-tighter mb-4">Persiapan Ujian</h1>
            <p className="text-sm text-slate-400 mb-10 font-medium">Ujian ini mewajibkan mode layar penuh (Full Screen) untuk mencegah kecurangan. Klik tombol di bawah untuk masuk ke mode layar penuh dan memulai waktu Anda.</p>
            
            <button 
              onClick={startExam}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
            >
              <Rocket className="w-5 h-5" /> Mulai Ujian Sekarang
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-full mt-4 text-slate-400 hover:text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
            >
              Kembali
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="bg-slate-950 border-b border-emerald-900 h-16 shrink-0 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <MonitorPlay className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-white leading-tight">Ujian Akhir Semester</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/80">Ilmu Pengetahuan Alam - XII IPA</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peserta Ujian</p>
            <p className="text-sm font-bold text-white">Budi Santoso (19201001)</p>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          <div className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-xl border text-xl font-mono font-black",
            timeLeft < 300 
              ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse" 
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          )}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>

          <button 
            onClick={toggleFullscreen}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors tooltip tooltip-left"
            data-tip="Toggle Fullscreen"
          >
            <MonitorPlay className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Area - Question */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-y-auto custom-scrollbar relative p-6 lg:p-10 hide-scrollbar">
          <div className="max-w-4xl w-full mx-auto pb-32">
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white">Soal Nomor {activeSoal.no}</h2>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-slate-800 text-slate-400 border-slate-700">
                Pilihan Ganda
              </span>
            </div>

            <div className="text-lg md:text-xl font-medium text-slate-300 leading-relaxed mb-10">
              {activeSoal.pertanyaan}
            </div>

            <div className="space-y-4">
              {activeSoal.opsi.map((opsi) => {
                const isSelected = answers[activeSoal.no] === opsi.id;
                return (
                  <label 
                    key={opsi.id}
                    className={cn(
                      "flex items-start gap-5 p-5 rounded-2xl border-2 transition-all cursor-pointer group",
                      isSelected 
                        ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                        : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800"
                    )}
                  >
                    <input 
                      type="radio" 
                      name={`soal-${activeSoal.no}`}
                      value={opsi.id}
                      checked={isSelected}
                      onChange={() => handleAnswer(opsi.id)}
                      className="peer sr-only"
                    />
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all text-sm font-black",
                      isSelected 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "border-slate-500 text-slate-400 group-hover:border-slate-400"
                    )}>
                      {isSelected ? <Check className="w-4 h-4" /> : opsi.id}
                    </div>
                    <div className={cn(
                      "text-base md:text-lg pt-1 transition-colors",
                      isSelected ? "text-emerald-100 font-bold" : "text-slate-300 font-medium"
                    )}>
                      {opsi.teks}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </main>

        {/* Right Area - Grid Navigation */}
        <aside className="w-full lg:w-80 shrink-0 bg-slate-950 border-t lg:border-t-0 lg:border-l border-emerald-900/50 flex flex-col h-[300px] lg:h-auto">
          <div className="p-4 border-b border-emerald-900/50 bg-slate-900/50 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Navigasi Soal</h3>
            <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
              {Object.keys(answers).length} / {MOCK_SOAL.length} Terjawab
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 hide-scrollbar">
            <div className="grid grid-cols-5 gap-2">
              {MOCK_SOAL.map((s, idx) => {
                const isAnswered = !!answers[s.no];
                const isRagu = !!raguRagu[s.no];
                const isActive = currentIdx === idx;

                return (
                  <button
                    key={s.id}
                    onClick={() => jumpTo(idx)}
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center text-xs font-black relative overflow-hidden transition-all",
                      isActive && !isAnswered && !isRagu ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950" : "",
                      isAnswered && !isRagu ? "bg-emerald-500 text-white" : "",
                      isRagu ? "bg-amber-500 text-white" : "",
                      !isAnswered && !isRagu && !isActive ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "",
                      isActive && (isAnswered || isRagu) ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950" : ""
                    )}
                  >
                    {s.no}
                    {/* Small dot for answered option if we want to show it, or keep it clean */}
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="p-4 border-t border-emerald-900/50 bg-slate-900/50 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <div className="w-3 h-3 rounded bg-emerald-500" /> Sudah Dijawab
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <div className="w-3 h-3 rounded bg-amber-500" /> Ragu-ragu
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <div className="w-3 h-3 rounded border border-slate-700 bg-slate-800" /> Belum Dijawab
            </div>
          </div>
        </aside>

      </div>

      {/* Footer Navigation */}
      <footer className="bg-slate-950 border-t border-emerald-900 h-20 shrink-0 flex items-center justify-between px-6 lg:px-10 z-50">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
        </button>

        <button
          onClick={toggleRagu}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2",
            raguRagu[activeSoal.no] 
              ? "bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30" 
              : "bg-transparent text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
          )}
        >
          <Flag className={cn("w-4 h-4", raguRagu[activeSoal.no] ? "fill-amber-400" : "")} /> 
          Ragu-ragu
        </button>

        {currentIdx === MOCK_SOAL.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4" /> Selesai Ujian
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-slate-200 text-slate-900 hover:bg-white"
          >
            Soal Selanjutnya <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </footer>

    </div>
  );
}
