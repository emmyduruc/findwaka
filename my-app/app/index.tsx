import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/stores/useAppStore';
import { UserRole } from '@/models/user.model';

const Index = observer(() => {
  const store = useAppStore();

  useEffect(() => {
    store.hydrate();
  }, []);

  if (!store.isHydrated) {
    return null;
  }

  if (!store.onboardingSeen) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (store.authStatus === 'loggedOut') {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (store.authStatus === 'loggedIn' && store.role === UserRole.DRIVER && !store.driverOnboardingComplete) {
    return <Redirect href="/(driver-onboarding)/step-1" />;
  }

  return <Redirect href="/(tabs)/nearby" />;
});

export default Index;
