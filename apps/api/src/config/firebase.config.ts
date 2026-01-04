import * as admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase(): void {
  if (firebaseApp) {
    return;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is required');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export function getFirebaseApp(): admin.app.App {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp!;
}

