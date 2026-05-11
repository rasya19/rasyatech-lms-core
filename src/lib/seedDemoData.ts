import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export async function seedDemoData() {
  try {
    const demoSchools = [
      {
        id: 'demo-silver',
        name: 'Demo Silver School',
        slug: 'demo-silver',
        npsn: '12345678',
        subscription_plan: 'Silver',
        status: 'active',
        adminEmail: 'demo.silver@example.com',
        createdAt: serverTimestamp()
      },
      {
        id: 'demo-gold',
        name: 'Demo Gold School',
        slug: 'demo-gold',
        npsn: '87654321',
        subscription_plan: 'Gold',
        status: 'active',
        adminEmail: 'demo.gold@example.com',
        createdAt: serverTimestamp()
      },
      {
        id: 'demo-platinum',
        name: 'Demo Platinum School',
        slug: 'demo-platinum',
        npsn: '11223344',
        subscription_plan: 'Platinum',
        status: 'active',
        adminEmail: 'demo.platinum@example.com',
        createdAt: serverTimestamp()
      }
    ];

    for (const school of demoSchools) {
      await setDoc(doc(db, 'schools', school.id), school);
    }
    
    toast.success('Data demo berhasil di-seeding!');
  } catch (error: any) {
    console.error('Seed error:', error);
    toast.error('Gagal seeding data: ' + error.message);
  }
}
