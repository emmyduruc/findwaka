import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { colors } from '@/theme/colors';

/**
 * Welcome / Onboarding screen
 * 
 * First screen shown when user opens app for the first time.
 * Options:
 * - Continue as guest (passenger mode, goes to tabs)
 * - Sign in as passenger (goes to login)
 * - Sign in as driver (goes to driver login)
 */
const WelcomeScreen = observer(() => {
  const store = useAppStore();

  const handleContinueAsGuest = async () => {
    await store.continueAsGuest();
    router.replace('/(tabs)/nearby');
  };

  const handleSignInPassenger = async () => {
    await store.setOnboardingSeen(true);
    router.push('/(auth)/passenger-login');
  };

  const handleSignInDriver = async () => {
    await store.setOnboardingSeen(true);
    router.push('/(auth)/driver-login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
            {/* Title */}
            <Text variant="h1" weight="700" style={{ marginBottom: 12, textAlign: 'center' }}>
              Find a ride in seconds
            </Text>

            {/* Subtitle */}
            <Text
              variant="body"
              color="muted"
              weight="400"
              style={{ marginBottom: 48, textAlign: 'center', paddingHorizontal: 20 }}
            >
              Bikes, keke, and cars near you
            </Text>

            {/* Buttons */}
            <View style={{ gap: 16 }}>
              <Button
                label="Continue as guest"
                onPress={handleContinueAsGuest}
                variant="primary"
                size="lg"
                fullWidth
              />
              <Button
                label="Sign in as passenger"
                onPress={handleSignInPassenger}
                variant="outline"
                size="lg"
                fullWidth
              />
              <Button
                label="Sign in as driver"
                onPress={handleSignInDriver}
                variant="outline"
                size="lg"
                fullWidth
              />
            </View>

            {/* Footer */}
            <Text
              variant="caption"
              color="muted"
              style={{ marginTop: 32, textAlign: 'center' }}
            >
              Cash rides. Call drivers directly.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

export default WelcomeScreen;
