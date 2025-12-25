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

// In-memory cache to reduce Firebase queries
interface CacheEntry {
  articles: ObjectiveNews[];
  cachedAt: string;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();

function getMemoryCache(key: string): { articles: ObjectiveNews[]; cachedAt: string } | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION_MS) {
    memoryCache.delete(key);
    return null;
  }

  return { articles: entry.articles, cachedAt: entry.cachedAt };
}

function setMemoryCache(key: string, articles: ObjectiveNews[], cachedAt: string): void {
  memoryCache.set(key, {
    articles,
    cachedAt,
    timestamp: Date.now(),
  });
}

export async function getCachedNews(category: string = 'all'): Promise<{ articles: ObjectiveNews[]; cachedAt: string } | null> {
  try {
    // Check memory cache first
    const memCached = getMemoryCache(category);
    if (memCached) {
      console.log(`[Cache Hit] Memory cache for ${category}`);
      return memCached;
    }

    // Then check Firebase
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
    const data = doc.data();
    const articles = data.articles as ObjectiveNews[];
    const cachedAt = data.cachedAtISO as string || new Date().toISOString();

    // Store in memory cache
    setMemoryCache(category, articles, cachedAt);
    console.log(`[Cache Hit] Firebase cache for ${category}`);

    return { articles, cachedAt };
  } catch (error) {
    console.error('Error fetching cached news:', error);
    return null;
  }
}

export async function cacheNews(category: string, articles: ObjectiveNews[], cachedAtISO: string): Promise<void> {
  try {
    // Store in memory cache first for immediate access
    setMemoryCache(category, articles, cachedAtISO);

    // Then store in Firebase for persistence
    await addDoc(collection(db, 'news'), {
      category,
      articles,
      cachedAt: Timestamp.now(),
      cachedAtISO,
    });
  } catch (error) {
    console.error('Error caching news:', error);
    // Don't throw - caching failure shouldn't break the app
  }
}

export { app, db };
