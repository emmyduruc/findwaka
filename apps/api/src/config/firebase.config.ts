import * as admin from 'firebase-admin';
import serviceAccount from '../../service-account.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully');
}

export function getFirebaseApp(): admin.app.App {
  return admin.apps[0];
}
