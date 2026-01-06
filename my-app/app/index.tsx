import { Redirect } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { UserRole } from '@/models/user.model';
import { useStorage } from '@/stores/root';

const Index = observer(() => {
    const store = useStorage();

  if (!store.app.isHydrated) {
    return null;
  }

  if (!store.app.onboardingSeen) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (store.app.authStatus === 'loggedOut') {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (store.app.authStatus === 'loggedIn' && store.app.role === UserRole.DRIVER && !store.app.driverOnboardingComplete) {
    return <Redirect href="/(driver-onboarding)/step-1" />;
  }

  if (store.app.authStatus === 'loggedIn' && store.app.role === UserRole.DRIVER) {
    return <Redirect href="/(tabs)/drivers" />;
  }

  return <Redirect href="/(tabs)/nearby" />;
});

export default Index;
