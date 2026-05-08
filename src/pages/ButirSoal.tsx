import React, { useState } from 'react';
import { 
  FileText, Plus, Save, ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Edit2, Trash2, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface OpsiJawaban {
  id: string;
  teks: string;
}

interface ButirSoalModel {
  id: string;
  pertanyaan: string;
  opsi: OpsiJawaban[];
  kunciJawabanId: string;
  tingkatKesulitan: 'Mudah' | 'Sedang' | 'Sulit';
}

const DUMMY_BUTIR_SOAL: ButirSoalModel[] = [
  {
    id: 'Q-001',
    pertanyaan: 'Siapakah presiden pertama Republik Indonesia?',
    opsi: [
      { id: 'A', teks: 'B.J. Habibie' },
      { id: 'B', teks: 'Soekarno' },
      { id: 'C', teks: 'Suharto' },
      { id: 'D', teks: 'Megawati Sukarnoputri' },
      { id: 'E', teks: 'Joko Widodo' }
    ],
    kunciJawabanId: 'B',
    tingkatKesulitan: 'Mudah'
  },
  {
    id: 'Q-002',
    pertanyaan: 'Sila ke-3 dari Pancasila berbunyi...',
    opsi: [
      { id: 'A', teks: 'Ketuhanan Yang Maha Esa' },
      { id: 'B', teks: 'Kemanusiaan yang Adil dan Beradab' },
      { id: 'C', teks: 'Persatuan Indonesia' },
      { id: 'D', teks: 'Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan' },
      { id: 'E', teks: 'Keadilan Sosial bagi Seluruh Rakyat Indonesia' }
    ],
    kunciJawabanId: 'C',
    tingkatKesulitan: 'Sedang'
  }
];

export default function ButirSoal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [soals, setSoals] = useState<ButirSoalModel[]>(DUMMY_BUTIR_SOAL);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [pertanyaan, setPertanyaan] = useState('');
  const [opsi, setOpsi] = useState<OpsiJawaban[]>([
    { id: 'A', teks: '' },
    { id: 'B', teks: '' },
    { id: 'C', teks: '' },
    { id: 'D', teks: '' },
    { id: 'E', teks: '' }
  ]);
  const [kunciJawaban, setKunciJawaban] = useState<string>('A');
  const [tingkatKesulitan, setTingkatKesulitan] = useState<'Mudah' | 'Sedang' | 'Sulit'>('Sedang');

  const resetForm = () => {
    setPertanyaan('');
    setOpsi([
      { id: 'A', teks: '' },
      { id: 'B', teks: '' },
      { id: 'C', teks: '' },
      { id: 'D', teks: '' },
      { id: 'E', teks: '' }
    ]);
    setKunciJawaban('A');
    setTingkatKesulitan('Sedang');
    setIsEditing(false);
    setEditId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pertanyaan.trim()) return alert('Pertanyaan tidak boleh kosong.');
    if (opsi.some(o => !o.teks.trim())) return alert('Semua opsi jawaban harus diisi.');

    if (isEditing && editId) {
      setSoals(soals.map(s => s.id === editId ? { id: editId, pertanyaan, opsi, kunciJawabanId: kunciJawaban, tingkatKesulitan } : s));
    } else {
      const newSoal: ButirSoalModel = {
        id: `Q-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        pertanyaan,
        opsi,
        kunciJawabanId: kunciJawaban,
        tingkatKesulitan
      };
      setSoals([newSoal, ...soals]);
    }
    resetForm();
  };

  const handleEdit = (soal: ButirSoalModel) => {
    setPertanyaan(soal.pertanyaan);
    setOpsi(soal.opsi);
    setKunciJawaban(soal.kunciJawabanId);
    setTingkatKesulitan(soal.tingkatKesulitan);
    setIsEditing(true);
    setEditId(soal.id);
    setExpandedId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus butir soal ini?')) {
      setSoals(soals.filter(s => s.id !== id));
    }
  };

  const handleOpsiChange = (id: string, value: string) => {
    setOpsi(opsi.map(o => o.id === id ? { ...o, teks: value } : o));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 text-white p-8 rounded-3xl relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10 flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black uppercase tracking-tight">Editor <span className="text-emerald-400 italic">Butir Soal</span></h1>
            </div>
            <p className="text-[11px] text-emerald-400/60 font-bold uppercase tracking-widest">Bank Soal ID: {id || 'BS-000'}</p>
          </div>
        </div>
        
        <div className="relative z-10">
          <button className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600/30 transition-all">
            <Upload className="w-4 h-4" /> Import Excel
          </button>
        </div>
      </div>

      {/* Editor Form */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
             <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
             <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{isEditing ? 'Edit Soal' : 'Buat Soal Baru'}</h2>
             <p className="text-xs text-slate-500 font-medium">Lengkapi pertanyaan dan opsi jawaban di bawah ini.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pertanyaan */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pertanyaan Soal</label>
            <textarea 
              required
              rows={4}
              value={pertanyaan}
              onChange={e => setPertanyaan(e.target.value)}
              placeholder="Tuliskan pertanyaan soal di sini..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-y custom-scrollbar"
            />
          </div>

          {/* Tingkat Kesulitan */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tingkat Kesulitan</label>
            <select
              value={tingkatKesulitan}
              onChange={e => setTingkatKesulitan(e.target.value as 'Mudah' | 'Sedang' | 'Sulit')}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
            >
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="Sulit">Sulit</option>
            </select>
          </div>

          {/* Opsi Jawaban */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilihan Jawaban & Kunci</label>
            
            <div className="grid grid-cols-1 gap-3">
              {opsi.map((o) => (
                <div 
                  key={o.id} 
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-xl border transition-all",
                    kunciJawaban === o.id 
                      ? "bg-emerald-50 border-emerald-300 shadow-sm" 
                      : "bg-white border-slate-200 hover:border-emerald-200"
                  )}
                >
                  <label className="flex items-center justify-center shrink-0 w-10 h-10 cursor-pointer relative group">
                    <input 
                      type="radio" 
                      name="kunciJawaban" 
                      value={o.id} 
                      checked={kunciJawaban === o.id}
                      onChange={() => setKunciJawaban(o.id)}
                      className="peer sr-only"
                    />
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      kunciJawaban === o.id 
                        ? "border-emerald-500 bg-emerald-500 text-white" 
                        : "border-slate-300 group-hover:border-emerald-300 text-slate-400"
                    )}>
                      {kunciJawaban === o.id ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{o.id}</span>}
                    </div>
                  </label>
                  
                  <div className="flex-1">
                    <input 
                      type="text" 
                      required
                      value={o.teks}
                      onChange={e => handleOpsiChange(o.id, e.target.value)}
                      placeholder={`Opsi Jawaban ${o.id}`}
                      className={cn(
                        "w-full bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-300",
                        kunciJawaban === o.id ? "text-emerald-800" : "text-slate-700"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
            )}
            <button 
              type="submit"
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isEditing ? 'Simpan Perubahan' : 'Tambah Soal'}
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Soal */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h3 className="text-sm font-black text-slate-50 uppercase tracking-widest">Daftar Soal Tersimpan</h3>
            <p className="text-xs text-emerald-400 font-medium mt-1">Total: {soals.length} Butir Soal</p>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <AnimatePresence>
            {soals.map((soal, idx) => (
              <motion.div 
                key={soal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "border rounded-2xl overflow-hidden transition-all duration-300",
                  expandedId === soal.id ? "bg-slate-900 border-emerald-500/30" : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                )}
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => setExpandedId(expandedId === soal.id ? null : soal.id)}
                  className="p-4 flex items-start gap-4 cursor-pointer select-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400 font-black text-xs">
                    {soals.length - idx}
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 flex flex-col items-start gap-1">
                    <p className="text-sm font-bold text-slate-200 line-clamp-2 leading-snug">
                      {soal.pertanyaan}
                    </p>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                      soal.tingkatKesulitan === 'Mudah' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      soal.tingkatKesulitan === 'Sedang' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {soal.tingkatKesulitan}
                    </span>
                  </div>
                  <div className="shrink-0 pt-1.5 text-slate-500">
                    {expandedId === soal.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Accordion Body */}
                <AnimatePresence>
                  {expandedId === soal.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 ml-12 border-t border-slate-800/50 mt-2">
                        <div className="space-y-2 mt-4">
                          {soal.opsi.map(o => (
                            <div 
                              key={o.id}
                              className={cn(
                                "flex items-center gap-3 p-2.5 rounded-xl border text-sm font-bold",
                                soal.kunciJawabanId === o.id 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                                  : "bg-slate-800/50 text-slate-400 border-slate-700/50"
                              )}
                            >
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0",
                                soal.kunciJawabanId === o.id ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"
                              )}>
                                {o.id}
                              </div>
                              <span className="flex-1">{o.teks}</span>
                              {soal.kunciJawabanId === o.id && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-end gap-2 mt-6">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(soal); }}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(soal.id); }}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {soals.length === 0 && (
            <div className="py-12 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center">
              <FileText className="w-8 h-8 text-slate-600 mb-3" />
              <p className="text-sm font-bold text-slate-400">Belum ada butir soal.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
