import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface School {
  id: string;
  name: string;
  slug: string;
  npsn?: string;
  accreditation?: string;
  address?: string;
  whatsapp?: string;
  adminEmail?: string;
  logoUrl?: string;
  themeColor?: string;
  status: string;
  expiryDate?: string;
  studentLimit?: number;
  custom_domain?: string;
  subscription_plan?: 'Silver' | 'Gold' | 'Platinum';
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
  
  // Use a ref to keep track of the current school slug to avoid unnecessary fetches
  // and dependency loops in useEffects that use setSchoolBySlug
  const currentSchoolSlugRef = React.useRef<string | null>(null);

  useEffect(() => {
    currentSchoolSlugRef.current = school?.slug || null;
  }, [school]);

  useEffect(() => {
    const resolveByHostname = async () => {
      const hostname = window.location.hostname;
      // You can define your production base domain here
      const baseDomain = 'armillalms.id'; 
      
      let slug = '';
      let customDomain = '';

      if (hostname.endsWith(`.${baseDomain}`)) {
        slug = hostname.replace(`.${baseDomain}`, '');
      } else if (hostname !== baseDomain && !hostname.includes('localhost') && !hostname.includes('run.app')) {
        // Assume it might be a custom domain if it's not the base domain and not a dev environment
        customDomain = hostname;
      }

      if (slug) {
        setSchoolBySlug(slug);
      } else if (customDomain) {
        setLoading(true);
        try {
          const q = query(collection(db, 'schools'), where('custom_domain', '==', customDomain));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            setSchool({ id: querySnapshot.docs[0].id, ...data } as School);
          }
        } catch (err) {
          console.error('Custom domain resolution error:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    resolveByHostname();
  }, []);

  const setSchoolBySlug = useCallback(async (slug: string) => {
    const normalizedSlug = slug.toLowerCase();
    
    // If already loaded and matches slug, do nothing. 
    // We use the ref to check the latest value without triggering dependency changes.
    if (currentSchoolSlugRef.current === normalizedSlug) return;
    
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
