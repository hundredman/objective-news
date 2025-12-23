import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { ObjectiveNews } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function getCachedNews(category: string = 'all'): Promise<ObjectiveNews[] | null> {
  try {
    const now = new Date();
    const cacheThreshold = new Date(now.getTime() - CACHE_DURATION_MS);

    const newsQuery = query(
      collection(db, 'news'),
      where('category', '==', category),
      where('cachedAt', '>', Timestamp.fromDate(cacheThreshold)),
      orderBy('cachedAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(newsQuery);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return doc.data().articles as ObjectiveNews[];
  } catch (error) {
    console.error('Error fetching cached news:', error);
    return null;
  }
}

export async function cacheNews(category: string, articles: ObjectiveNews[]): Promise<void> {
  try {
    await addDoc(collection(db, 'news'), {
      category,
      articles,
      cachedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error caching news:', error);
    // Don't throw - caching failure shouldn't break the app
  }
}

export { app, db };
