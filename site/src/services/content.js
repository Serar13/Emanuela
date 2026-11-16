import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from './collections';

export async function getSiteContent(id) {
  try {
    const snapshot = await getDoc(doc(db, COLLECTIONS.SITE_CONTENT, id));
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    console.error(`getSiteContent(${id}) failed:`, error);
    return null;
  }
}

export async function getPublishedArticles() {
  try {
    const snapshot = await getDocs(query(collection(db, COLLECTIONS.ARTICLES), where('published', '==', true)));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  } catch (error) {
    console.error('getPublishedArticles failed:', error);
    return [];
  }
}

export async function getArticle(slug) {
  try {
    const snapshot = await getDoc(doc(db, COLLECTIONS.ARTICLES, slug));
    if (!snapshot.exists() || !snapshot.data().published) return null;
    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    console.error(`getArticle(${slug}) failed:`, error);
    return null;
  }
}

export async function getCandyBarItems() {
  try {
    const snapshot = await getDocs(query(collection(db, COLLECTIONS.CANDY_BAR_ITEMS), where('active', '==', true)));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  } catch (error) {
    console.error('getCandyBarItems failed:', error);
    return [];
  }
}
