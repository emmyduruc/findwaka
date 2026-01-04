import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Input } from '@/ui/Input';
import { Icon } from '@/ui/Icon';
import { colors } from '@/theme/colors';

/**
 * Driver login screen
 * 
 * TODO: When connecting Firebase OTP:
 * - Replace mock login with Firebase phone auth
 * - Add OTP verification screen
 * - Handle Firebase auth state changes
 * - Store Firebase user ID in app store
 */
const DriverLoginScreen = observer(() => {
  const store = useAppStore();
  const [phone, setPhone] = useState('');

  const handleMockLogin = async () => {
    await store.mockDriverLogin();
    router.replace('/(driver-onboarding)/step-1');
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
            <Text variant="h2" weight="600" style={{ marginBottom: 48 }}>
              Driver sign in
            </Text>

            {/* Phone Input */}
            <Input
              label="Phone number"
              placeholder="+234 800 000 0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              leftIcon={<Icon name="call-outline" size={20} color={colors.textMuted} />}
              containerClassName="mb-6"
            />

            {/* Buttons */}
            <View style={{ gap: 16 }}>
              <Button
                label="Mock login"
                onPress={handleMockLogin}
                variant="primary"
                size="lg"
                fullWidth
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

export default DriverLoginScreen;
