
import { initializeApp, getApp, getApps, type FirebaseOptions, type FirebaseApp } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import type { RemoteConfig } from 'firebase/remote-config';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Helper function to check if essential config values are present
function validateFirebaseConfig(config: FirebaseOptions): boolean {
  const requiredKeys: (keyof FirebaseOptions)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !config[key]);

  if (missingKeys.length > 0) {
    console.error(
      `Firebase SDK Configuration Error: The following required Firebase config values are missing or undefined: ${missingKeys.join(', ')}. ` +
      `Please ensure they are correctly set in your .env.local file and prefixed with NEXT_PUBLIC_. ` +
      `For example, NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.projectId || 'YOUR_PROJECT_ID'}. ` +
      `After creating or updating .env.local, you MUST restart your Next.js development server.`
    );
    return false;
  }
  return true;
}


function createFirebaseApp(config: FirebaseOptions): FirebaseApp | null {
  if (!validateFirebaseConfig(config)) {
    // If config is invalid, attempting to initialize Firebase will fail.
    // We've already logged the error.
    return null;
  }
  if (!getApps().length) {
    try {
      return initializeApp(config);
    } catch (e) {
      console.error("Error initializing Firebase app:", e);
      return null;
    }
  }
  return getApp();
}

const app = createFirebaseApp(firebaseConfig);
let remoteConfigInstance: RemoteConfig | null = null;

// Check if app was successfully initialized before trying to use it for Remote Config
if (app && app.options && app.options.projectId && typeof window !== 'undefined') {
  try {
    remoteConfigInstance = getRemoteConfig(app);
    remoteConfigInstance.settings.minimumFetchIntervalMillis = process.env.NODE_ENV === 'development' ? 10000 : 3600000; // 10 seconds in dev, 1 hour in prod

    remoteConfigInstance.defaultConfig = {
      'heroConfig': JSON.stringify({
        headline: "Ensure Your Family's Financial Security",
        subHeadline: "(even when you can't be there for them)",
        ctaText: "Secure My Family's Future Now",
      }),
    };
    // It's good practice to fetch and activate here or early in your app lifecycle
    // if you need the values immediately.
    // fetchAndActivate(remoteConfigInstance).catch(err => console.error('Remote Config: fetchAndActivate failed', err));
  } catch (error) {
    console.error("Failed to initialize Firebase Remote Config:", error);
    // remoteConfigInstance will remain null, and useRemoteConfigValue will use defaults
  }
} else if (typeof window !== 'undefined' && firebaseConfig.projectId /* Check original config to avoid false warning if createFirebaseApp returned null due to validation */) {
  // This warning applies if createFirebaseApp didn't return null due to missing config,
  // but app.options.projectId is still somehow missing (less likely but good to cover).
  console.warn(
    "Firebase app was not properly initialized (likely due to missing or invalid configuration in .env.local). " +
    "Remote Config will not be available, and default values will be used. " +
    "Please check your Firebase setup and .env.local file, then restart the dev server."
  );
}


export { app, remoteConfigInstance, fetchAndActivate, getValue };
