import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import remoteConfig from '@react-native-firebase/remote-config';

/**
 * Firebase Configuration
 * 
 * React Native Firebase automatically initializes from:
 * - iOS: GoogleService-Info.plist
 * - Android: google-services.json
 * 
 * The AppDelegate.mm (iOS) and MainApplication.java (Android) already call
 * [FIRApp configure] which initializes Firebase.
 * 
 * We just need to get the default app instance - no manual initialization needed
 */

// Get the default app instance
const app = firebase.app();

// Initialize Remote Config with defaults
remoteConfig()
  .setDefaults({})
  .then(() => {
    remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: 3600000, // 1 hour
    });
  })
  .catch((error) => {
    console.warn('Remote Config initialization failed:', error);
  });

export { firebase, auth, remoteConfig, app };
export default app;
