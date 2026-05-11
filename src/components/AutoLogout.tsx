import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

export default function AutoLogout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { schoolSlug } = useParams();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    // Only logout if not already on public/login pages and user is logged in
    const isLoggedIn = localStorage.getItem('userRole');
    const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname.endsWith('/login') || location.pathname.includes('/ppdb');
    
    if (!isLoggedIn || isPublicPage) return;

    try {
      const studentId = localStorage.getItem('studentId');
      if (studentId) {
        await supabase.from('profiles_siswa').update({ is_online: false }).eq('id', studentId);
      }
      await supabase.auth.signOut().catch(() => {});
    } catch (err) {
      console.warn('Auto logout error:', err);
    }

    const keysToRemove = [
      'userRole', 
      'isDemoMode', 
      'adminName', 
      'teacherName', 
      'studentName', 
      'studentId', 
      'studentNisn', 
      'studentClass',
      'sb-access-token',
      'sb-refresh-token'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    toast.info('Sesi Anda telah berakhir karena tidak ada aktivitas.');
    
    // Use window.location.replace to ensure full reload and clear state
    const redirectPath = schoolSlug ? `/s/${schoolSlug}/login` : '/login';
    window.location.replace(redirectPath);
  }, [schoolSlug, location.pathname]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Only set timer if user is logged in
    const isLoggedIn = localStorage.getItem('userRole');
    if (isLoggedIn) {
      timerRef.current = setTimeout(() => {
        handleLogout();
      }, AUTO_LOGOUT_TIME);
    }
  }, [handleLogout]);

  useEffect(() => {
    // List of events to listen for
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resetTimer]);

  return null; // This component doesn't render anything
}
