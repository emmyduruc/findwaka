import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Card } from '@/ui/Card';
import { ListRow } from '@/ui/ListRow';
import { Icon } from '@/ui/Icon';
import { colors } from '@/theme/colors';

/**
 * Profile screen
 * 
 * Shows:
 * - Current mode (Guest/Passenger/Driver)
 * - Role switch buttons
 * - Log out button
 * - Reset onboarding (dev)
 */
const ProfileScreen = observer(() => {
  const store = useAppStore();

  const getCurrentMode = () => {
    if (store.authStatus === 'guest') return 'Guest';
    if (store.authStatus === 'loggedIn' && store.role === 'driver') return 'Driver';
    if (store.authStatus === 'loggedIn' && store.role === 'passenger') return 'Passenger';
    return 'Logged out';
  };

  const handleSwitchToPassenger = async () => {
    await store.setRole('passenger');
    if (store.authStatus === 'loggedOut') {
      await store.continueAsGuest();
    }
    router.replace('/(tabs)/nearby');
  };

  const handleSwitchToDriver = () => {
    router.push('/(auth)/driver-login');
  };

  const handleLogout = async () => {
    await store.logout();
    router.replace('/(onboarding)/welcome');
  };

  const handleResetOnboarding = async () => {
    await store.resetOnboarding();
    router.replace('/(onboarding)/welcome');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text variant="h2" weight="600" style={{ marginBottom: 24 }}>
          Profile
        </Text>

        {/* Current Mode Card */}
        <Card style={{ marginBottom: 24 }}>
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="body" weight="500">
                Current mode
              </Text>
              <Text variant="body" weight="600" style={{ color: colors.accentPrimary }}>
                {getCurrentMode()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={{ gap: 16, marginBottom: 24 }}>
          <Button
            label="Switch to passenger"
            onPress={handleSwitchToPassenger}
            variant="outline"
            size="lg"
            fullWidth
          />
          <Button
            label="Switch to driver"
            onPress={handleSwitchToDriver}
            variant="outline"
            size="lg"
            fullWidth
          />
          {store.authStatus !== 'loggedOut' && (
            <Button
              label="Log out"
              onPress={handleLogout}
              variant="ghost"
              size="lg"
              fullWidth
            />
          )}
        </View>

        {/* Dev Actions */}
        <Card>
          <View style={{ gap: 16 }}>
            <Text variant="label" weight="500" color="muted">
              Developer
            </Text>
            <Button
              label="Reset onboarding"
              onPress={handleResetOnboarding}
              variant="ghost"
              size="md"
              fullWidth
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
});

export default ProfileScreen;
