import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface School {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  themeColor?: string;
  status: string;
}

interface SchoolContextType {
  school: School | null;
  loading: boolean;
  error: string | null;
  setSchoolBySlug: (slug: string) => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSchoolBySlug = useCallback(async (slug: string) => {
    const normalizedSlug = slug.toLowerCase();
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'schools', normalizedSlug);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSchool({ id: docSnap.id, ...docSnap.data() } as School);
      } else {
        // Fallback: try query if migration is not fully complete or for compatibility
        const q = query(collection(db, 'schools'), where('slug', '==', normalizedSlug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setSchool({ id: doc.id, ...doc.data() } as School);
        } else {
          setSchool(null);
          setError('Sekolah tidak ditemukan');
        }
      }
    } catch (err) {
      console.error('Fetch school error:', err);
      setError('Gagal memuat data sekolah');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependencies to keep the function reference stable

  return (
    <SchoolContext.Provider value={{ school, loading, error, setSchoolBySlug }}>
      {children}
    </SchoolContext.Provider>
  );
}

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
