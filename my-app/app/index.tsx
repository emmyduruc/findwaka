import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/stores/useAppStore';

/**
 * Root redirect screen
 * 
 * Routes based on app state:
 * - If onboarding not seen -> /(onboarding)/welcome
 * - If not logged in -> can continue as guest or login
 * - If logged in:
 *   - Driver without onboarding -> /(driver-onboarding)/step-1
 *   - Otherwise -> /(tabs)/nearby
 */
const Index = observer(() => {
  const store = useAppStore();

  // Wait for store to hydrate
  useEffect(() => {
    store.hydrate();
  }, []);

  // Show onboarding if not seen
  if (!store.onboardingSeen) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // If logged in as driver without onboarding, go to driver onboarding
  if (store.authStatus === 'loggedIn' && store.role === 'driver' && !store.driverOnboardingComplete) {
    return <Redirect href="/(driver-onboarding)/step-1" />;
  }

  // Otherwise go to main tabs
  return <Redirect href="/(tabs)/nearby" />;
});

export default Index;
