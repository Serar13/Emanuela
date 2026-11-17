import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from './collections';

/**
 * Registers the current device's push token securely in Firestore.
 * Each user/device only writes its own token.
 */
export const registerDevicePushToken = async (token, userId = null) => {
  if (!token || typeof token !== 'string') return;
  try {
    const cleanTokenId = token.replace(/[^a-zA-Z0-9_-]/g, '_');
    await setDoc(doc(db, COLLECTIONS.PUSH_TOKENS, cleanTokenId), {
      token,
      userId: userId || null,
      platform: 'mobile',
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to register device push token:', err);
  }
};

/**
 * Unregisters device push token when user signs out or disables notifications.
 */
export const unregisterDevicePushToken = async (token) => {
  if (!token || typeof token !== 'string') return;
  try {
    const cleanTokenId = token.replace(/[^a-zA-Z0-9_-]/g, '_');
    await deleteDoc(doc(db, COLLECTIONS.PUSH_TOKENS, cleanTokenId));
  } catch (err) {
    console.warn('Failed to unregister device push token:', err);
  }
};
