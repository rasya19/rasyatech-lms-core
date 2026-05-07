import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Video, Send, Users, Shield, BookOpen, Clock, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Diskusi() {
  const [activeTab, setActiveTab] = useState<'chat' | 'video'>('chat');
  const [activeRoom, setActiveRoom] = useState('Umum');
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [allMessages, setAllMessages] = useState<Record<string, { sender: string; text: string; time: string; isGuru?: boolean }[]>>({
    'Umum': [
      { sender: 'Rasyid', text: 'Halo semuanya, ada yang bingung dengan materi Paket C tadi pagi?', time: '10:15 AM' },
      { sender: 'Ibu Armilla', text: 'Silahkan ditanyakan bagian yang kurang jelas, bagian Ekonomi ya?', time: '10:16 AM', isGuru: true }
    ],
    'Matematika': [
      { sender: 'Budi', text: 'Bu, rumus pitagoras ini dipakai di soal nomor 5 ya?', time: '09:00 AM' },
      { sender: 'Ibu Armilla', text: 'Betul Budi, perhatikan sisi miringnya.', time: '09:05 AM', isGuru: true }
    ],
    'Bhs. Indonesia': [
      { sender: 'Siti', text: 'Kapan batas akhir pengumpulan tugas resensi buku?', time: '11:20 AM' },
      { sender: 'Ibu Armilla', text: 'Hari Jumat paling lambat jam 12 siang ya Siti.', time: '11:25 AM', isGuru: true }
    ],
    'Kewirausahaan': [
      { sender: 'Andi', text: 'Ide bisnis cuci sepatu kira-kira prospeknya bagus gak ya?', time: '14:30 AM' },
      { sender: 'Ibu Armilla', text: 'Bagus Andi, apalagi kalau targetnya anak muda.', time: '14:35 AM', isGuru: true }
    ]
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeRoom, allMessages, activeTab]);

  const [rooms, setRooms] = useState([
    { name: 'Umum', students: 12 },
    { name: 'Matematika', students: 8 },
    { name: 'Bhs. Indonesia', students: 5 },
    { name: 'Kewirausahaan', students: 15 }
  ]);

  const activeMessages = allMessages[activeRoom] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      sender: 'Saya',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAllMessages(prev => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), newMessage]
    }));
    
    setMessage('');
  };

  const handleAddTopic = () => {
    const topicName = prompt('Masukkan Judul Topik Baru:');
    if (topicName && topicName.trim()) {
      const name = topicName.trim();
      if (!rooms.find(r => r.name === name)) {
        setRooms([...rooms, { name, students: 0 }]);
        setAllMessages(prev => ({ ...prev, [name]: [] }));
        setActiveRoom(name);
      } else {
        alert('Topik ini sudah ada!');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-brand-sidebar uppercase italic tracking-tighter">Ruang <span className="text-brand-accent">Diskusi</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Chat Interaktif & Video Conference Siswa-Guru</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
               onClick={() => setActiveTab('chat')}
               className={cn(
                 "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all italic",
                 activeTab === 'chat' ? "bg-white text-brand-sidebar shadow-sm" : "text-slate-400 hover:text-slate-600"
               )}
             >
               <MessageSquare className="w-3.5 h-3.5" /> Group Chat
             </button>
             <button 
               onClick={() => setActiveTab('video')}
               className={cn(
                 "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all italic",
                 activeTab === 'video' ? "bg-white text-brand-sidebar shadow-sm" : "text-slate-400 hover:text-slate-600"
               )}
             >
               <Video className="w-3.5 h-3.5" /> Video Call
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Chat Rooms / Active Mentors */}
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-white border border-brand-border rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Topik Aktif
                 </h3>
                 <button 
                  onClick={handleAddTopic}
                  className="p-1 px-2 bg-brand-sidebar text-white text-[8px] font-black uppercase rounded-lg hover:bg-brand-accent transition-all italic shadow-lg shadow-brand-sidebar/10"
                 >
                  + Baru
                 </button>
              </div>
              <div className="space-y-2">
                 {rooms.map((room) => (
                   <button 
                    key={room.name} 
                    onClick={() => setActiveRoom(room.name)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all group",
                      activeRoom === room.name 
                        ? "bg-brand-accent/10 border-brand-accent/30 shadow-sm" 
                        : "bg-slate-50 border-transparent hover:border-brand-accent/20"
                    )}
                   >
                      <p className={cn(
                        "text-xs font-bold transition-colors italic",
                        activeRoom === room.name ? "text-brand-accent" : "text-brand-sidebar group-hover:text-brand-accent"
                      )}># {room.name}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{room.students} Siswa Online</p>
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-brand-sidebar rounded-2xl p-4 text-white">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Shield className="w-3.5 h-3.5 text-brand-accent" /> Mentor Piket
              </h3>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-brand-accent rounded-full border-2 border-white/20 flex items-center justify-center font-black">IB</div>
                 <div>
                    <p className="text-xs font-bold italic">Ibu Armilla</p>
                    <div className="flex items-center gap-1.5 mt-1">
                       <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                       <span className="text-[8px] font-bold text-slate-400 uppercase uppercase">Siap Menjawab</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Content - Chat / Video Area */}
        <div className="lg:col-span-3">
           {activeTab === 'chat' ? (
             <div className="bg-white border border-brand-border rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-sm">
                <div className="p-4 border-b border-brand-border flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-brand-accent flex items-center justify-center text-white rounded-lg font-black text-xs">#</div>
                       <p className="text-sm font-black text-brand-sidebar uppercase italic tracking-tighter">Forum <span className="text-brand-accent">{activeRoom}</span></p>
                    </div>
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => <div key={i} className="w-6 h-6 border-2 border-white bg-slate-200 rounded-full" />)}
                       <div className="w-6 h-6 border-2 border-white bg-brand-accent rounded-full flex items-center justify-center text-[7px] font-black text-white">+12</div>
                    </div>
                </div>

                <div 
                  ref={scrollRef}
                  className="flex-1 p-6 overflow-y-auto space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5"
                >
                   {activeMessages.map((msg, idx) => (
                      <div key={idx} className={cn("flex items-start gap-3", msg.isGuru && "flex-row-reverse")}>
                         <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px]",
                            msg.isGuru ? "bg-brand-accent/20 text-brand-accent" : "bg-slate-100 text-brand-sidebar"
                         )}>
                            {msg.sender.substring(0, 2).toUpperCase()}
                         </div>
                         <div className={cn("max-w-[70%]", msg.isGuru && "flex flex-col items-end")}>
                            <div className={cn(
                               "p-3 rounded-2xl",
                               msg.isGuru 
                                  ? "bg-brand-sidebar text-white shadow-lg shadow-brand-sidebar/10 rounded-tr-none" 
                                  : "bg-slate-50 border border-brand-border rounded-tl-none"
                            )}>
                               <p className="text-xs font-bold leading-relaxed italic">{msg.text}</p>
                            </div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{msg.sender} {msg.isGuru && '(Guru)'} • {msg.time}</p>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="p-4 border-t border-brand-border bg-slate-50">
                   <form 
                     onSubmit={handleSendMessage}
                     className="flex items-center gap-3 bg-white border border-brand-border p-2 rounded-2xl focus-within:border-brand-accent transition-all pl-4"
                   >
                      <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tulis pesan..." 
                        className="flex-1 bg-transparent text-xs font-bold outline-none"
                      />
                      <button className="bg-brand-sidebar text-white p-2.5 rounded-xl hover:bg-brand-accent transition-all shadow-lg shadow-brand-sidebar/10">
                         <Send className="w-4 h-4" />
                      </button>
                   </form>
                </div>
             </div>
           ) : (
             <div className="bg-slate-900 border border-brand-border rounded-3xl overflow-hidden h-[600px] flex flex-col relative">
                <div className="absolute inset-0 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&auto=format&fit=crop')] bg-cover opacity-20" />
                <div className="flex-1 flex items-center justify-center relative z-10">
                   <div className="text-center">
                      <div className="w-24 h-24 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-brand-accent/30">
                         <Video className="w-10 h-10 text-brand-accent animate-pulse" />
                      </div>
                      <h2 className="text-2xl font-bold text-white italic tracking-tighter uppercase mb-2">Video Conferencing</h2>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ruang Kelas Digital Sedang Dipersiapkan...</p>
                      <a 
                        href={`https://meet.jit.si/PKBMArmilla_${activeRoom.replace(/\s+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 inline-block bg-brand-accent text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] italic shadow-2xl shadow-brand-accent/20 hover:scale-105 transition-all text-center"
                      >
                         Masuk ke Ruang Virtual
                      </a>
                   </div>
                </div>

                <div className="p-6 bg-black/40 backdrop-blur-xl border-t border-white/10 relative z-10">
                   <div className="flex flex-wrap justify-center gap-8">
                      <div className="text-center">
                         <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Materi Berikutnya</p>
                         <p className="text-xs font-bold text-white italic">Literasi Digital</p>
                      </div>
                      <div className="text-center border-x border-white/10 px-8">
                         <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Status Server</p>
                         <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                             <p className="text-[10px] font-bold text-emerald-500 uppercase">Optimal</p>
                         </div>
                      </div>
                      <div className="text-center">
                         <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Terhubung Ke</p>
                         <p className="text-xs font-bold text-brand-accent italic">Cloud Rasyacomp</p>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Rules & Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-5 bg-white border border-brand-border rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-brand-sidebar"><BookOpen className="w-5 h-5" /></div>
            <div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Etika Diskusi</p>
               <p className="text-[10px] font-bold text-brand-sidebar italic uppercase">Gunakan Bahasa Sopan & Santun</p>
            </div>
         </div>
         <div className="p-5 bg-white border border-brand-border rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-brand-sidebar"><Clock className="w-5 h-5" /></div>
            <div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Aktif</p>
               <p className="text-[10px] font-bold text-brand-sidebar italic uppercase">Respon Mentor: 08:00 - 16:00</p>
            </div>
         </div>
         <div className="p-5 bg-white border border-brand-border rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-brand-sidebar"><Heart className="w-5 h-5 text-brand-accent" /></div>
            <div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Suasana Belajar</p>
               <p className="text-[10px] font-bold text-brand-sidebar italic uppercase">Saling Menghargai Sesama Siswa</p>
            </div>
         </div>
      </div>
    </div>
  );
}
