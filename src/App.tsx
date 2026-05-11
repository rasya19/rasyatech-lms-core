/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Outlet, Navigate, useLocation } from 'react-router-dom';
import { SchoolProvider, useSchool } from './contexts/SchoolContext';
import Layout from './components/Layout';
import AutoLogout from './components/AutoLogout';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DataSiswa from './pages/DataSiswa';
import BankSoal from './pages/BankSoal';
import ButirSoal from './pages/ButirSoal';
import HasilUjian from './pages/HasilUjian';
import Guru from './pages/Guru';
import MataPelajaran from './pages/MataPelajaran';
import DeteksiObjek from './pages/DeteksiObjek';
import UjianSiswa from './pages/UjianSiswa';
import Akademik from './pages/Akademik';
import Alumni from './pages/Alumni';
import Materi from './pages/Materi';
import Ujian from './pages/Ujian';
import Nilai from './pages/Nilai';
import Raport from './pages/Raport';
import Kelas from './pages/Kelas';
import KenaikanKelas from './pages/KenaikanKelas';
import SKL from './pages/SKL';
import PPDB from './pages/PPDB';
import Pengumuman from './pages/Pengumuman';
import Site from './pages/Site';
import Relasi from './pages/Relasi';
import Keuangan from './pages/Keuangan';
import Tagihan from './pages/Tagihan';
import Diskusi from './pages/Diskusi';
import AiAsisten from './pages/AiAsisten';
import Purchase from './pages/Purchase';
import Feedback from './pages/Feedback';
import Analitik from './pages/Analitik';
import Settings from './pages/Settings';
import Presensi from './pages/Presensi';
import AgendaGuru from './pages/AgendaGuru';
import PresensiSiswa from './pages/PresensiSiswa';
import SuperAdmin from './pages/SuperAdmin';
import AffiliateDashboard from './pages/AffiliateDashboard';
import { Toaster } from 'sonner';

function SchoolLoader() {
  const { schoolSlug } = useParams();
  const { setSchoolBySlug, school, loading, error } = useSchool();

  useEffect(() => {
    if (schoolSlug) {
      setSchoolBySlug(schoolSlug);
    }
  }, [schoolSlug, setSchoolBySlug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-brand-sidebar rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Memuat Institusi...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 flex-col gap-6 p-6 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <div className="text-4xl font-black text-red-500 italic uppercase">404</div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-brand-sidebar italic uppercase leading-tight">Sekolah <span className="text-red-500">Tidak Ditemukan</span></h2>
        <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] max-w-xs mx-auto">Kami tidak dapat menemukan institusi dengan alamat: <span className="text-brand-sidebar underline italic">{schoolSlug}</span></p>
      </div>
      <a href="/" className="bg-brand-sidebar text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-sidebar/20 hover:scale-105 active:scale-95 transition-all italic">Kembali ke Beranda</a>
    </div>
  );

  if (!school && !loading && !error) return null;

  return <Outlet />;
}

function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Coming Soon</h2>
      <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">
        Halaman ini masih dalam tahap pengembangan. Silakan kembali lagi nanti.
      </p>
    </div>
  );
}

function AppContent() {
  const { school, loading } = useSchool();
  const location = useLocation();
  const isSubroutePath = location.pathname.startsWith('/s/') || location.pathname.startsWith('/dashboard');

  if (loading && !isSubroutePath) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-accent border-t-brand-sidebar rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Menghubungkan Institusi...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root Path - Portal Web */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/preview" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Login />} />
      <Route path="/ujian/:id" element={<UjianSiswa />} />
      <Route path="/purchase" element={<Purchase />} />
      <Route path="/super-admin" element={<SuperAdmin />} />
      <Route path="/affiliate" element={<AffiliateDashboard />} />
      
      {/* If subdomain/custom domain is detected, allow accessing dashboard routes at root */}
      {school && (
        <>
          <Route path="login" element={<Login />} />
          <Route path="ujian/:id" element={<UjianSiswa />} />
          <Route path="dashboard" element={<Layout />}>
             <Route index element={<Dashboard />} />
             <Route path="course/:id" element={<CourseDetail />} />
             <Route path="data-siswa" element={<DataSiswa />} />
             <Route path="soal" element={<BankSoal />} />
             <Route path="soal/:id/detail" element={<ButirSoal />} />
             <Route path="hasil-ujian" element={<HasilUjian />} />
             <Route path="data-guru" element={<Guru />} />
             <Route path="mata-pelajaran" element={<MataPelajaran />} />
             <Route path="akademik" element={<Akademik />} />
             <Route path="presensi" element={<PresensiWrapper />} />
             <Route path="agenda" element={<AgendaGuru />} />
             <Route path="deteksi-objek" element={<DeteksiObjek />} />
             <Route path="relasi" element={<Relasi />} />
             <Route path="alumni" element={<Alumni />} />
             <Route path="materi" element={<Materi />} />
             <Route path="ujian" element={<Ujian />} />
             <Route path="nilai" element={<Nilai />} />
             <Route path="raport" element={<Raport />} />
             <Route path="kelas" element={<Kelas />} />
             <Route path="kenaikan" element={<KenaikanKelas />} />
             <Route path="skl" element={<SKL />} />
             <Route path="ppdb" element={<PPDB />} />
             <Route path="pengumuman" element={<Pengumuman />} />
             <Route path="site" element={<Site />} />
             <Route path="keuangan" element={<Keuangan />} />
             <Route path="tagihan" element={<Tagihan />} />
             <Route path="analitik" element={<Analitik />} />
             <Route path="diskusi" element={<Diskusi />} />
             <Route path="ai-asisten" element={<AiAsisten />} />
             <Route path="feedback" element={<Feedback />} />
             <Route path="settings" element={<Settings />} />
          </Route>
        </>
      )}

      {/* Multi-tenancy Routes (Legacy/Fallback) */}
      <Route path="/s/:schoolSlug" element={<SchoolLoader />}>
         <Route index element={<LandingPage />} />
         <Route path="login" element={<Login />} />
         <Route path="ujian/:id" element={<UjianSiswa />} />
         <Route path="dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            {/* ... other child routes ... */}
            <Route path="course/:id" element={<CourseDetail />} />
            <Route path="data-siswa" element={<DataSiswa />} />
            <Route path="soal" element={<BankSoal />} />
            <Route path="soal/:id/detail" element={<ButirSoal />} />
            <Route path="hasil-ujian" element={<HasilUjian />} />
            <Route path="data-guru" element={<Guru />} />
            <Route path="mata-pelajaran" element={<MataPelajaran />} />
            <Route path="akademik" element={<Akademik />} />
            <Route path="presensi" element={<PresensiWrapper />} />
            <Route path="agenda" element={<AgendaGuru />} />
            <Route path="relasi" element={<Relasi />} />
            <Route path="alumni" element={<Alumni />} />
            <Route path="materi" element={<Materi />} />
            <Route path="ujian" element={<Ujian />} />
            <Route path="nilai" element={<Nilai />} />
            <Route path="raport" element={<Raport />} />
            <Route path="kelas" element={<Kelas />} />
            <Route path="kenaikan" element={<KenaikanKelas />} />
            <Route path="skl" element={<SKL />} />
            <Route path="ppdb" element={<PPDB />} />
            <Route path="pengumuman" element={<Pengumuman />} />
            <Route path="site" element={<Site />} />
            <Route path="keuangan" element={<Keuangan />} />
            <Route path="tagihan" element={<Tagihan />} />
            <Route path="analitik" element={<Analitik />} />
            <Route path="diskusi" element={<Diskusi />} />
            <Route path="ai-asisten" element={<AiAsisten />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="settings" element={<Settings />} />
         </Route>
      </Route>

      <Route element={<Layout />}>
        <Route path="/data-siswa" element={<DataSiswa />} />
        <Route path="/data-guru" element={<Guru />} />
        <Route path="/keuangan/tagihan" element={<Tagihan />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>

      <Route path="/dashboard" element={<Layout />}>
        {/* These might be global dashboard or school dashboard if context exists */}
        <Route index element={<Dashboard />} />
        {/* ... */}
        <Route path="course/:id" element={<CourseDetail />} />
        <Route path="data-siswa" element={<DataSiswa />} />
        <Route path="soal" element={<BankSoal />} />
        <Route path="soal/:id/detail" element={<ButirSoal />} />
        <Route path="hasil-ujian" element={<HasilUjian />} />
        <Route path="data-guru" element={<Guru />} />
        <Route path="mata-pelajaran" element={<MataPelajaran />} />
        <Route path="akademik" element={<Akademik />} />
        <Route path="presensi" element={<PresensiWrapper />} />
        <Route path="agenda" element={<AgendaGuru />} />
        <Route path="relasi" element={<Relasi />} />
        <Route path="alumni" element={<Alumni />} />
        <Route path="materi" element={<Materi />} />
        <Route path="ujian" element={<Ujian />} />
        <Route path="nilai" element={<Nilai />} />
        <Route path="raport" element={<Raport />} />
        <Route path="kelas" element={<Kelas />} />
        <Route path="kenaikan" element={<KenaikanKelas />} />
        <Route path="skl" element={<SKL />} />
        <Route path="ppdb" element={<PPDB />} />
        <Route path="pengumuman" element={<Pengumuman />} />
        <Route path="site" element={<Site />} />
        <Route path="keuangan" element={<Keuangan />} />
        <Route path="tagihan" element={<Tagihan />} />
        <Route path="analitik" element={<Analitik />} />
        <Route path="diskusi" element={<Diskusi />} />
        <Route path="ai-asisten" element={<AiAsisten />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}

function PresensiWrapper() {
  const role = localStorage.getItem('userRole') || 'Siswa';
  return role === 'Siswa' ? <PresensiSiswa /> : <Presensi />;
}

function ReferralTracker() {
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      sessionStorage.setItem('rasya_ref', ref);
    }
  }, [location]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <SchoolProvider>
        <AutoLogout />
        <ReferralTracker />
        <AppContent />
      </SchoolProvider>
    </BrowserRouter>
  );
}
