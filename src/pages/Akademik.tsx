import React, { useState } from 'react';
import { 
  Calendar, Clock, Users, Book, ChevronRight, Plus, Filter, CalendarDays, Edit2, Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DUMMY_MAPEL } from './MataPelajaran';

// Menggunakan data mapel yang sudah ada dan membuat jadwal dummy
const DUMMY_SCHEDULE = [
  {
    id: 'J001',
    hari: 'Senin',
    mulai: '08:00',
    selesai: '09:30',
    kelas: 'Kelas 10 - Paket C',
    mapelId: 'M001',
    guru: 'Budi Santoso, S.Pd'
  },
  {
    id: 'J002',
    hari: 'Senin',
    mulai: '09:45',
    selesai: '11:15',
    kelas: 'Kelas 10 - Paket C',
    mapelId: 'M002',
    guru: 'Ahmad Yani, S.S'
  },
  {
    id: 'J003',
    hari: 'Senin',
    mulai: '08:00',
    selesai: '09:30',
    kelas: 'Kelas 11 - Paket C',
    mapelId: 'M003',
    guru: 'Drs. Joko Widodo'
  },
  {
    id: 'J004',
    hari: 'Selasa',
    mulai: '08:00',
    selesai: '09:30',
    kelas: 'Kelas 10 - Paket C',
    mapelId: 'M004',
    guru: 'Budi Santoso, S.Pd'
  }
];

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function Akademik() {
  const [activeDay, setActiveDay] = useState('Senin');
  const [schedules, setSchedules] = useState(DUMMY_SCHEDULE);

  const filteredSchedules = schedules
    .filter(s => s.hari === activeDay)
    .sort((a, b) => a.mulai.localeCompare(b.mulai));

  const getMapel = (id: string) => DUMMY_MAPEL.find(m => m.id === id);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <CalendarDays className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Jadwal <span className="text-emerald-400 italic">Pelajaran</span></h1>
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest pl-1">Manajemen Waktu dan Kelas Akademik</p>
        </div>
        
        <div className="relative z-10 flex gap-4">
          <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
            <Plus className="w-4 h-4" /> Tambah Jadwal
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
        {/* Day Selector */}
        <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-100 bg-slate-50/50">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                "flex-1 min-w-[120px] py-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative",
                activeDay === day 
                  ? "text-emerald-600 bg-emerald-50/50" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              {day}
              {activeDay === day && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Jadwal Hari {activeDay}</h2>
            <button className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 uppercase hover:bg-slate-200 transition-colors">
              <Filter className="w-3 h-3" /> Filter Kelas
            </button>
          </div>

          <div className="space-y-4">
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule) => {
                const mapel = getMapel(schedule.mapelId);
                return (
                  <div key={schedule.id} className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-5 overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-4 min-w-[140px] shrink-0">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100 group-hover:scale-110 transition-transform">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 font-mono tracking-tighter">{schedule.mulai}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">s/d {schedule.selesai}</p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Book className="w-3 h-3" /> Mata Pelajaran</p>
                        <p className="text-sm font-bold text-emerald-700">{mapel?.nama || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Kelas / Rombel</p>
                        <p className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md inline-block border border-slate-200">{schedule.kelas}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Guru Pengampu</p>
                        <p className="text-xs font-medium text-slate-600">{schedule.guru}</p>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 md:static">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip tooltip-left" data-tip="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip tooltip-left" data-tip="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm mb-4">
                  <CalendarDays className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Kosong</h3>
                <p className="text-xs text-slate-500 mt-1">Belum ada jadwal pelajaran untuk hari ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
