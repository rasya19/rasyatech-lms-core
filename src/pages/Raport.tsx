import React from 'react';
import { FileText, Download, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const MOCK_RAPORT = {
  semester: 'Genap 2025/2026',
  status: 'Sudah Disahkan',
  catatan: 'Pertahankan prestasi di bidang keterampilan.',
  nilai: [
    { mapel: 'Bahasa Indonesia', kkm: 75, angka: 88, huruf: 'A', deskripsi: 'Sangat baik dalam memahami teks laporan.' },
    { mapel: 'Matematika', kkm: 70, angka: 82, huruf: 'B', deskripsi: 'Baik dalam pemahaman logika matematika dasar.' },
    { mapel: 'Sosiologi', kkm: 75, angka: 90, huruf: 'A', deskripsi: 'Sangat aktif dalam diskusi fenomena sosial.' },
    { mapel: 'Keterampilan', kkm: 75, angka: 96, huruf: 'A', deskripsi: 'Karya menjahit sangat rapi dan kreatif.' },
  ]
};

export default function Raport() {
  const [studentData] = React.useState(() => {
    const userId = localStorage.getItem('currentUserId');
    const savedSiswa = localStorage.getItem('school_siswa_list');
    if (savedSiswa && userId) {
      const siswaList = JSON.parse(savedSiswa);
      return siswaList.find((s: any) => s.id === userId) || { name: 'BUDI SANTOSO', nisn: '0012345678' };
    }
    return { name: 'BUDI SANTOSO', nisn: '0012345678' };
  });

  const [nilaiList] = React.useState(() => {
    const saved = localStorage.getItem('school_nilai_list');
    if (saved) return JSON.parse(saved);
    return [
      { mapel: 'Bahasa Indonesia', uts: 85, uas: 88, tugas: 90, rata: 87.6 },
      { mapel: 'Matematika', uts: 78, uas: 80, tugas: 85, rata: 81.0 },
      { mapel: 'Sosiologi', uts: 92, uas: 90, tugas: 95, rata: 92.3 },
      { mapel: 'Keterampilan', uts: 95, uas: 98, tugas: 100, rata: 97.6 },
    ];
  });

  const [catatan] = React.useState(localStorage.getItem('school_catatan_wali') || "Budi menunjukkan progres yang sangat baik pada mata pelajaran produktif (Keterampilan). Terus tingkatkan kehadiran pada sesi tutorial online Bahasa Inggris.");

  React.useEffect(() => {
    if (sessionStorage.getItem('trigger_print') === 'true') {
      sessionStorage.removeItem('trigger_print');
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const validationUrl = `${window.location.origin}/dashboard/skl?verify=${studentData.name.replace(/\s+/g, '-')}-${studentData.nisn}`;

  const getHuruf = (nilai: number) => {
    if (nilai >= 90) return 'A';
    if (nilai >= 80) return 'B';
    if (nilai >= 70) return 'C';
    return 'D';
  };

  return (
    <div className="space-y-6 max-w-5xl print:m-0 print:p-0">
      <div className="flex justify-between items-center px-1 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-brand-text-main tracking-tight uppercase italic underline decoration-brand-accent decoration-2">RAPORT <span className="text-brand-accent">DIGITAL</span></h2>
          <p className="text-[10px] text-brand-text-muted font-bold tracking-widest mt-1 uppercase">Sistem Informasi Akademik Armilla</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-brand-border text-brand-text-main px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-all uppercase tracking-widest"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-brand-accent/90 transition-all uppercase tracking-widest shadow-lg shadow-brand-accent/20"
          >
            <Download className="w-3.5 h-3.5" /> Unduh PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-xl p-8 shadow-sm relative overflow-hidden print:shadow-none print:border-none print:p-0">
        {/* Certification Stamp for Visuals */}
        <div className="absolute top-8 right-8 border-4 border-emerald-500/20 rounded-full w-24 h-24 flex items-center justify-center -rotate-12 pointer-events-none">
           <div className="text-emerald-500 font-black text-[10px] uppercase text-center leading-none">
             PKBM<br/>ARMILLA<br/>DISAHKAN
           </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-brand-border">
          <div className="space-y-1">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Siswa</p>
             <p className="text-sm font-bold text-brand-text-main uppercase">{studentData.name}</p>
             <p className="text-[10px] text-slate-500">NISN: {studentData.nisn}</p>
          </div>
          <div className="text-right space-y-1">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester</p>
             <p className="text-sm font-bold text-brand-text-main uppercase">Genap 2025/2026</p>
             <p className="text-[10px] text-emerald-600 font-bold uppercase flex items-center justify-end gap-1">
               <CheckCircle2 className="w-3 h-3" /> Sudah Disahkan
             </p>
          </div>
        </div>

        <table className="w-full text-left mb-10">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border border-brand-border uppercase italic">Mata Pelajaran</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border border-brand-border text-center uppercase italic">KKM</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border border-brand-border text-center uppercase italic">Angka</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border border-brand-border text-center uppercase italic">Huruf</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border border-brand-border uppercase italic">Capaian Kompetensi</th>
            </tr>
          </thead>
          <tbody>
            {nilaiList.map((n: any, i: number) => (
              <tr key={i} className="text-[11px]">
                <td className="px-4 py-3 border border-brand-border font-bold text-brand-text-main">{n.mapel}</td>
                <td className="px-4 py-3 border border-brand-border text-center font-bold text-slate-400">75</td>
                <td className="px-4 py-3 border border-brand-border text-center font-black text-brand-text-main">{n.rata}</td>
                <td className="px-4 py-3 border border-brand-border text-center font-black text-brand-accent">{getHuruf(n.rata)}</td>
                <td className="px-4 py-3 border border-brand-border italic text-slate-500 leading-relaxed">
                   {n.rata >= 90 ? 'Sangat baik dalam menguasai capaian kompetensi pembelajaran.' : n.rata >= 75 ? 'Sudah menguasai capaian kompetensi dengan baik.' : 'Perlu bimbingan lebih lanjut pada kompetensi ini.'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
           <div className="bg-slate-50 p-6 rounded-xl border border-brand-border">
              <p className="text-[10px] font-bold text-brand-text-main uppercase mb-3 italic flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-brand-accent" /> Catatan Wali Kelas
              </p>
              <p className="text-[11px] text-slate-600 italic leading-relaxed">"{catatan}"</p>
           </div>
           
           <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-border rounded-xl">
              <div className="flex gap-2 items-center mb-1 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Terverifikasi Digital</span>
              </div>
              <p className="text-[9px] text-slate-400 uppercase italic mb-4">Scan QR untuk validasi keaslian berkas</p>
              <div className="bg-white p-2 rounded-lg shadow-sm border border-brand-border">
                <QRCodeCanvas 
                  value={validationUrl}
                  size={80}
                  level="H"
                  includeMargin={false}
                />
              </div>
           </div>
        </div>
      </div>

      <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3 print:hidden">
         <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
         <p className="text-[10px] text-orange-700 italic">Raport asli (hardcopy) berstempel resmi sekolah hanya dapat diambil di kantor PKBM oleh orang tua/wali siswa pada jam kerja.</p>
      </div>
    </div>
  );
}


