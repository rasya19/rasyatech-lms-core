/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Siswa from './pages/Siswa';
import Guru from './pages/Guru';
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
import Diskusi from './pages/Diskusi';
import AiAsisten from './pages/AiAsisten';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/preview" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="course/:id" element={<CourseDetail />} />
          <Route path="siswa" element={<Siswa />} />
          <Route path="guru" element={<Guru />} />
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
          <Route path="diskusi" element={<Diskusi />} />
          <Route path="ai-asisten" element={<AiAsisten />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
