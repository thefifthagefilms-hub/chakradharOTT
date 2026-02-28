import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey,
};

if (!getApps().length && privateKey) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminDb = getFirestore();