import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "emanuela-da572";
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const displayName = process.env.ADMIN_NAME?.trim() || "Rareș Simon";

if (!email || !password) {
  console.error("Setează ADMIN_EMAIL și ADMIN_PASSWORD înainte de rulare.");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Parola trebuie să conțină minimum 8 caractere.");
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId });

const auth = getAuth();
const db = getFirestore();

let user;
try {
  user = await auth.getUserByEmail(email);
  user = await auth.updateUser(user.uid, { password, displayName, disabled: false });
  console.log(`Cont Firebase Auth actualizat: ${email}`);
} catch (error) {
  if (error.code !== "auth/user-not-found") throw error;
  user = await auth.createUser({ email, password, displayName, disabled: false });
  console.log(`Cont Firebase Auth creat: ${email}`);
}

await auth.setCustomUserClaims(user.uid, {
  ...(user.customClaims || {}),
  admin: true,
});

await db.collection("users").doc(user.uid).set(
  {
    email,
    name: displayName,
    role: "admin",
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);

console.log(`Rol admin configurat în Firestore pentru UID: ${user.uid}`);
