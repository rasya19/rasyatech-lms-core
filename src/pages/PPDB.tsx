import React, { useState } from 'react';
import { UserPlus, Sparkles, MoveRight, HelpCircle, X, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function PPDB() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    nik: '',
    noAkta: '',
    email: '',
    whatsapp: '',
    paket: 'Paket C',
    jk: 'Laki-Laki',
    tempatLahir: '',
    tanggalLahir: '',
    agama: 'Islam',
    alamat: '',
    anakKe: 1,
    namaAyah: '',
    pekerjaanAyah: '',
    penghasilanAyah: '0 - 500.000',
    namaIbu: '',
    pekerjaanIbu: '',
    penghasilanIbu: '0 - 500.000',
    alasan: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setIsSubmitted(false);
    setFormData({
      name: '',
      nisn: '',
      nik: '',
      noAkta: '',
      email: '',
      whatsapp: '',
      paket: 'Paket C',
      jk: 'Laki-Laki',
      tempatLahir: '',
      tanggalLahir: '',
      agama: 'Islam',
      alamat: '',
      anakKe: 1,
      namaAyah: '',
      pekerjaanAyah: '',
      penghasilanAyah: '0 - 500.000',
      namaIbu: '',
      pekerjaanIbu: '',
      penghasilanIbu: '0 - 500.000',
      alasan: ''
    });
  };

  return (
    <div className="max-w-5xl space-y-8">
       <div className="bg-brand-sidebar rounded-2xl p-8 md:p-12 text-white relative overflow-hidden group">
          <div className="relative z-10 max-w-2xl">
             <div className="inline-flex items-center gap-2 bg-brand-accent/20 border border-brand-accent/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest italic text-brand-accent mb-6">
                <Sparkles className="w-3 h-3" /> Penerimaan Siswa Baru 2026/2027
             </div>
             <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-none italic mb-6">
                MASA DEPAN <span className="text-brand-accent">CERAH</span> DIMULAI DARI SINI.
             </h1>
             <p className="text-sm md:text-lg text-slate-400 font-medium italic mb-8 max-w-lg leading-relaxed">
                Bergabunglah bersama PKBM Armilla Nusa. Menyediakan jalur pendidikan Paket A, B, dan C dengan fleksibilitas tinggi.
             </p>
             <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="bg-brand-accent text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-accent/20 hover:scale-105 transition-all flex items-center gap-2 group/btn"
                >
                   Daftar Sekarang <MoveRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
                <button className="bg-white/5 border border-white/10 hover:bg-white/10 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all italic">
                   Brosur Digital
                </button>
             </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-accent/10 to-transparent pointer-none" />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-accent/10 rounded-full blur-3xl" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-[0.2em] italic border-l-4 border-brand-accent pl-4">Kenapa Memilih Kami?</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Ijazah Resmi', desc: 'Sertifikat kelulusan sah dan diakui oleh Kemendikbudristek.' },
                  { title: 'Belajar Fleksibel', desc: 'Cocok bagi yang bekerja maupun anak usia sekolah (Drop Out).' },
                  { title: 'Berbasis Digital', desc: 'Akses materi dan ujian kapan saja melalui LMS Terpadu.' },
                  { title: 'Tutor Ahli', desc: 'Dibimbing oleh pendidik profesional di bidangnya.' },
                ].map((f, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-brand-border group hover:border-brand-accent transition-all cursor-default">
                    <h4 className="font-bold text-xs text-brand-text-main uppercase italic mb-2 group-hover:text-brand-accent">{f.title}</h4>
                    <p className="text-[11px] text-slate-500 italic leading-relaxed">{f.desc}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-50 border border-brand-border rounded-xl p-6 flex flex-col">
             <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest italic mb-6">Status Pendaftaran</h3>
             <div className="space-y-4">
                <div className="p-4 bg-white border border-brand-border rounded-xl flex items-center justify-center text-center italic">
                   <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Gelombang Saat Ini</p>
                      <h4 className="font-bold text-brand-accent text-lg">Gelombang I</h4>
                      <p className="text-[9px] text-emerald-500 font-bold uppercase">Terbuka s/d 30 Mei 2026</p>
                   </div>
                </div>
                
                <Link to="/" className="w-full py-4 border-2 border-dashed border-brand-border rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-brand-accent hover:border-brand-accent transition-all group">
                   <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                   <span className="text-xs font-bold uppercase tracking-widest italic">Cek Status Registrasi</span>
                </Link>
             </div>

             <div className="mt-auto pt-8 border-t border-brand-border">
                <div className="flex gap-4 items-center mb-4">
                   <div className="p-3 bg-brand-accent/10 rounded-full">
                      <HelpCircle className="w-5 h-5 text-brand-accent" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-brand-text-main italic">Butuh Informasi?</p>
                      <p className="text-[10px] text-brand-accent font-bold">WA: +62 852-2502-5555</p>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-brand-sidebar/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-brand-border"
            >
              {!isSubmitted ? (
                <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-xl font-black text-brand-sidebar uppercase italic tracking-widest leading-none">FORMULIR <span className="text-brand-accent">PENDAFTARAN</span></h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-2">Lengkapi data untuk bergabung bersama kami</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-2xl transition-colors">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Data Pribadi */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-brand-sidebar uppercase tracking-[0.2em] italic flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full" /> 1. Data Pribadi Calon Siswa
                        <div className="h-[1px] bg-brand-border flex-1" />
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nama Lengkap Sesuai Ijazah</label>
                          <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nama lengkap..." className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nomor NIK (KTP/KK)</label>
                          <input type="text" required value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} placeholder="16 digit NIK..." className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">NISN (Jika Ada)</label>
                          <input type="text" value={formData.nisn} onChange={(e) => setFormData({...formData, nisn: e.target.value})} placeholder="10 digit NISN..." className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">No Akta Lahir</label>
                          <input type="text" value={formData.noAkta} onChange={(e) => setFormData({...formData, noAkta: e.target.value})} placeholder="No. Registrasi Akta..." className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Jenis Kelamin</label>
                          <select value={formData.jk} onChange={(e) => setFormData({...formData, jk: e.target.value})} className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold outline-none">
                            <option value="Laki-Laki">Laki-Laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Agama</label>
                          <select value={formData.agama} onChange={(e) => setFormData({...formData, agama: e.target.value})} className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold outline-none">
                            <option value="Islam">Islam</option>
                            <option value="Kristen">Kristen</option>
                            <option value="Katolik">Katolik</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Budha">Budha</option>
                          </select>
                        </div>
                        <div className="space-y-2 col-span-2 md:col-span-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Anak Ke</label>
                          <input type="number" value={formData.anakKe} onChange={(e) => setFormData({...formData, anakKe: parseInt(e.target.value) || 1})} className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Tempat Lahir</label>
                          <input type="text" value={formData.tempatLahir} onChange={(e) => setFormData({...formData, tempatLahir: e.target.value})} placeholder="Kabupaten/Kota..." className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Tanggal Lahir</label>
                          <input type="date" value={formData.tanggalLahir} onChange={(e) => setFormData({...formData, tanggalLahir: e.target.value})} className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Kontak & Alamat */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-brand-sidebar uppercase tracking-[0.2em] italic flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full" /> 2. Kontak & Alamat
                        <div className="h-[1px] bg-brand-border flex-1" />
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Email Aktif</label>
                          <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="contoh@email.com" className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nomor WhatsApp</label>
                          <input type="text" required value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} placeholder="0812..." className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Alamat Lengkap</label>
                        <textarea value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} placeholder="Nama jalan, Desa, Kec, Kab/Kota..." className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none h-24 resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Program yang Dipilih</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Paket A', 'Paket B', 'Paket C'].map((p) => (
                            <button key={p} type="button" onClick={() => setFormData({...formData, paket: p})} className={cn("p-4 rounded-2xl text-[10px] font-black uppercase border-2 transition-all", formData.paket === p ? "bg-brand-sidebar text-white border-brand-sidebar shadow-lg" : "bg-white border-brand-border text-slate-400 hover:border-brand-accent")}>{p}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Data Orang Tua */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-brand-sidebar uppercase tracking-[0.2em] italic flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full" /> 3. Data Orang Tua
                        <div className="h-[1px] bg-brand-border flex-1" />
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4 p-4 border border-brand-border rounded-2xl bg-slate-50/50">
                           <h5 className="text-[9px] font-black text-brand-accent uppercase tracking-widest italic border-b border-brand-border pb-1">Data Ayah</h5>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nama Ayah</label>
                              <input type="text" value={formData.namaAyah} onChange={(e) => setFormData({...formData, namaAyah: e.target.value})} placeholder="Nama lengkap ayah..." className="w-full bg-white border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Pekerjaan Ayah</label>
                              <input type="text" value={formData.pekerjaanAyah} onChange={(e) => setFormData({...formData, pekerjaanAyah: e.target.value})} placeholder="Pekerjaan..." className="w-full bg-white border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Penghasilan Ayah</label>
                              <select value={formData.penghasilanAyah} onChange={(e) => setFormData({...formData, penghasilanAyah: e.target.value})} className="w-full bg-white border border-brand-border rounded-xl p-3 text-xs font-bold outline-none">
                                <option value="0 - 500.000">Rp 0 - Rp 500.000</option>
                                <option value="500.000 - 1.000.000">Rp 500.000 - Rp 1.000.000</option>
                                <option value="1.000.000 - 2.000.000">Rp 1.000.000 - Rp 2.000.000</option>
                                <option value="2.000.000 - 5.000.000">Rp 2.000.000 - Rp 5.000.000</option>
                                <option value="> 5.000.000">&gt; Rp 5.000.000</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-4 p-4 border border-brand-border rounded-2xl bg-slate-50/50">
                           <h5 className="text-[9px] font-black text-brand-accent uppercase tracking-widest italic border-b border-brand-border pb-1">Data Ibu</h5>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nama Ibu</label>
                              <input type="text" value={formData.namaIbu} onChange={(e) => setFormData({...formData, namaIbu: e.target.value})} placeholder="Nama lengkap ibu..." className="w-full bg-white border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Pekerjaan Ibu</label>
                              <input type="text" value={formData.pekerjaanIbu} onChange={(e) => setFormData({...formData, pekerjaanIbu: e.target.value})} placeholder="Pekerjaan..." className="w-full bg-white border border-brand-border rounded-xl p-3 text-xs font-bold outline-none focus:border-brand-accent" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Penghasilan Ibu</label>
                              <select value={formData.penghasilanIbu} onChange={(e) => setFormData({...formData, penghasilanIbu: e.target.value})} className="w-full bg-white border border-brand-border rounded-xl p-3 text-xs font-bold outline-none">
                                <option value="0 - 500.000">Rp 0 - Rp 500.000</option>
                                <option value="500.000 - 1.000.000">Rp 500.000 - Rp 1.000.000</option>
                                <option value="1.000.000 - 2.000.000">Rp 1.000.000 - Rp 2.000.000</option>
                                <option value="2.000.000 - 5.000.000">Rp 2.000.000 - Rp 5.000.000</option>
                                <option value="> 5.000.000">&gt; Rp 5.000.000</option>
                              </select>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Alasan Mendaftar / Catatan Tambahan</label>
                      <textarea value={formData.alasan} onChange={(e) => setFormData({...formData, alasan: e.target.value})} placeholder="Berikan alasan singkat..." className="w-full bg-slate-50 border border-brand-border rounded-2xl p-4 text-xs font-bold focus:border-brand-accent outline-none h-24 resize-none" />
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-brand-sidebar text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-sidebar/20 italic">
                      {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Kirim Pendaftaran <Check className="w-4 h-4" /></>}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-brand-sidebar mb-2 italic uppercase">Pendaftaran Terkirim!</h3>
                  <p className="text-xs text-slate-500 italic max-w-sm mx-auto mb-8">
                    Terima kasih telah mendaftar di PKBM Armilla Nusa. Administrasi kami akan segera menghubungi Anda melalui WhatsApp untuk proses verifikasi.
                  </p>
                  <button 
                    onClick={handleClose}
                    className="bg-brand-sidebar text-white px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-sidebar/20"
                  >
                    Tutup & Kembali
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
       </AnimatePresence>
    </div>
  );
}

