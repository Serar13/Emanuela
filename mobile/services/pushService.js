import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from './collections';

export const sendPushNotification = async ({ title, body, category = 'general', targetScreen = 'Offers', sentBy = 'mobile_admin' }) => {
  if (!title || !body) throw new Error('Titlul și mesajul sunt obligatorii.');

  // 1. Fetch registered tokens
  const tokens = new Set();
  try {
    const snapTokens = await getDocs(collection(db, COLLECTIONS.PUSH_TOKENS));
    snapTokens.docs.forEach((d) => {
      const token = d.data()?.token || d.id;
      if (token && typeof token === 'string' && token.startsWith('ExponentPushToken')) {
        tokens.add(token);
      }
    });

    const snapUsers = await getDocs(collection(db, COLLECTIONS.USERS));
    snapUsers.docs.forEach((d) => {
      const token = d.data()?.pushToken;
      if (token && typeof token === 'string' && token.startsWith('ExponentPushToken')) {
        tokens.add(token);
      }
    });
  } catch (err) {
    console.warn('Could not query push tokens in mobile:', err);
  }

  const tokenList = Array.from(tokens);
  let expoResult = null;

  // 2. Dispatch via Expo Push API if tokens exist
  if (tokenList.length > 0) {
    try {
      const messages = tokenList.map((token) => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: { screen: targetScreen, category }
      }));

      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messages)
      });
      expoResult = await res.json();
    } catch (err) {
      console.error('Expo push dispatch error from mobile:', err);
    }
  }

  // 3. Save to Firestore
  const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    title,
    body,
    category,
    targetScreen,
    sentBy,
    recipientsCount: tokenList.length,
    expoResult: expoResult ? JSON.stringify(expoResult) : null,
    status: 'sent',
    createdAt: serverTimestamp()
  });

  return { id: docRef.id, recipientsCount: tokenList.length };
};
