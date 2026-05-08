import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, AlertCircle, Scan, CheckCircle2, Maximize, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../lib/utils';

let aiClient: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
  if (!aiClient) {
    // Check if process is defined to avoid reference errors on Vercel
    const key = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '';
    if (!key) {
      throw new Error('Konfigurasi API Key tidak ditemukan. Pastikan environment variable sudah diatur.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

interface DeteksiResult {
  nama: string;
  skor: number;
}

export default function DeteksiObjek() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<DeteksiResult[]>([]);
  const [errorPrompt, setErrorPrompt] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorPrompt('File harus berupa gambar (JPG, PNG, dll).');
      return;
    }

    // Reset states
    setResults([]);
    setErrorPrompt(null);
    setImagePreview(URL.createObjectURL(file));
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Extract just the base64 string
      const base64String = result.split(',')[1];
      setBase64Data(base64String);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!base64Data || !mimeType) {
      setErrorPrompt('Pilih gambar terlebih dahulu.');
      return;
    }
    
    setIsProcessing(true);
    setErrorPrompt(null);
    
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
             inlineData: {
                data: base64Data,
                mimeType: mimeType
             }
          },
          "Tolong identifikasi objek-objek signifikan yang ada di dalam gambar ini. Untuk setiap objek, berikan estimasi kepercayaan (skor 0 sampai 100) mengenai kepastian prediksi."
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nama: {
                  type: Type.STRING,
                  description: "Nama objek yang terdeteksi dalam bahasa Indonesia.",
                },
                skor: {
                  type: Type.NUMBER,
                  description: "Skor kepercayaan bahwa objek ini ada (antara 0 hingga 100).",
                },
              },
            },
          },
        },
      });

      const output = response.text;
      if (output) {
        const parsed = JSON.parse(output) as DeteksiResult[];
        setResults(parsed.sort((a, b) => b.skor - a.skor));
      } else {
        setErrorPrompt('Tidak ada objek yang terdeteksi.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorPrompt(err.message || 'Terjadi kesalahan saat mendeteksi objek.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 text-white p-8 rounded-3xl relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <BrainCircuit className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Deteksi <span className="text-emerald-400 italic">Objek</span></h1>
          </div>
          <p className="text-[11px] text-emerald-400/60 font-bold uppercase tracking-widest pl-1">Analisis Gambar Berbasis AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6 flex flex-col h-[500px]">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-500" />
            Unggah Gambar
          </h2>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group",
              imagePreview ? "border-emerald-200 bg-slate-50" : "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50"
            )}
          >
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-slate-800 shadow-xl flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Ganti Gambar
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center px-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                   <Upload className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
                <p className="text-sm font-bold text-slate-700 mb-1">Klik untuk unggah gambar</p>
                <p className="text-xs text-slate-400">Atau tarik dan lepas file di sini (JPG, PNG)</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col pt-4 border-t border-slate-100">
            {errorPrompt && (
              <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-medium">{errorPrompt}</p>
              </div>
            )}
            
            <button
              onClick={processImage}
              disabled={isProcessing || !base64Data}
              className="w-full bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 h-[52px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menganalisis...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" /> Deteksi Objek
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-sm p-6 flex flex-col h-[500px] overflow-hidden relative">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none" />
          
          <h2 className="text-sm font-black text-slate-50 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
            <Maximize className="w-4 h-4 text-emerald-400" />
            Hasil Analisis
          </h2>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 space-y-3">
            <AnimatePresence>
              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4"
                >
                  <div className="relative">
                     <div className="w-12 h-12 border-4 border-slate-800 rounded-full"></div>
                     <div className="w-12 h-12 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Memindai Objek...</p>
                </motion.div>
              )}

              {!isProcessing && results.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {results.map((result, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-200 capitalize">{result.nama}</p>
                        
                        <div className="mt-2 flex items-center gap-3">
                           <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${result.skor}%` }}
                                transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                                className={cn(
                                   "h-full rounded-full",
                                   result.skor > 80 ? "bg-emerald-500" :
                                   result.skor > 50 ? "bg-amber-500" : "bg-red-500"
                                )}
                              />
                           </div>
                           <span className={cn(
                              "text-[10px] font-black w-8 text-right",
                              result.skor > 80 ? "text-emerald-400" :
                              result.skor > 50 ? "text-amber-400" : "text-red-400"
                           )}>
                             {result.skor.toFixed(0)}%
                           </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!isProcessing && results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-6">
                   <Scan className="w-12 h-12 text-slate-700 mb-4 opacity-50" />
                   <p className="text-sm font-bold text-slate-400">Belum Ada Deteksi</p>
                   <p className="text-xs text-slate-600 mt-2">Pilih gambar lalu klik tombol Deteksi Objek untuk mulai memindai gambar.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
