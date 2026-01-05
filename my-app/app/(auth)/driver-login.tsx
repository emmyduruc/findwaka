import { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Input } from '@/ui/Input';
import { Icon } from '@/ui/Icon';
import { BackButton } from '@/ui/BackButton';
import { colors } from '@/theme/colors';
import { phoneSchema } from '@/utils/validation';
import { UserRole } from '@/models/user.model';

/**
 * Driver login screen
 * 
 * Implements Firebase phone authentication:
 * 1. User enters phone number
 * 2. Sends verification code via Firebase
 * 3. User enters code (on OTP screen)
 * 4. Verifies code and creates/updates user in backend
 * 5. Navigates to driver onboarding
 */
const DriverLoginScreen = observer(() => {
  const store = useAppStore();
  const [phone, setPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load saved phone number on mount
  useEffect(() => {
    if (store.phoneNumber) {
      setPhone(store.phoneNumber);
    }
  }, [store.phoneNumber]);

  const handleSendCode = async () => {
    if (!isPhoneValid || !phone.trim()) return;

    setError(null);

    try {
      // Format phone number (ensure it starts with country code)
      const formattedPhone = phone.startsWith('+') ? phone : `+234${phone.replace(/^0/, '')}`;
      
      await store.sendPhoneVerificationCode(formattedPhone);
      setShowOTP(true);
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      setError(error.message || 'Failed to send verification code. Please try again.');
      Alert.alert('Error', error.message || 'Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code.');
      return;
    }

    setError(null);

    try {
      await store.verifyPhoneCode(otpCode, UserRole.DRIVER);
      // Navigation is handled in the store
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setError(error.message || 'Invalid verification code. Please try again.');
      Alert.alert('Error', error.message || 'Invalid verification code. Please try again.');
    }
  };

  const handleBackToPhone = () => {
    setShowOTP(false);
    setOtpCode('');
    setError(null);
    // Confirmation is cleared in the store's logout/reset methods
  };

  // OTP Verification Screen
  if (showOTP) {
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
            {/* Back Button */}
            <BackButton onPress={handleBackToPhone} />

            <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
              {/* Title */}
              <Text variant="h2" weight="600" style={{ marginBottom: 8 }}>
                Enter verification code
              </Text>
              <Text variant="body" color="muted" style={{ marginBottom: 48 }}>
                We sent a 6-digit code to {store.phoneNumber || phone}
              </Text>

              {/* OTP Input */}
              <Input
                label="Verification code"
                placeholder="123456"
                value={otpCode}
                onChangeText={(text) => {
                  setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 6));
                  setError(null);
                }}
                keyboardType="number-pad"
                maxLength={6}
                containerClassName="mb-6"
                editable={!store.isAuthLoading}
              />

              {error && (
                <Text variant="caption" style={{ color: colors.error, marginBottom: 16 }}>
                  {error}
                </Text>
              )}

              {/* Buttons */}
              <View style={{ gap: 16 }}>
                <Button
                  label={store.isAuthLoading ? 'Verifying...' : 'Verify code'}
                  onPress={handleVerifyCode}
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!otpCode.trim() || otpCode.length !== 6 || store.isAuthLoading}
                />
                <Button
                  label="Resend code"
                  onPress={handleSendCode}
                  variant="outline"
                  size="lg"
                  fullWidth
                  disabled={store.isAuthLoading}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Phone Input Screen
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
          {/* Back Button */}
          <BackButton />

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
              onChangeText={(text) => {
                setPhone(text);
                setError(null);
              }}
              keyboardType="phone-pad"
              autoComplete="tel"
              schema={phoneSchema}
              onValidationChange={(isValid) => setIsPhoneValid(isValid)}
              leftIcon={<Icon name="call-outline" size={20} color={colors.textMuted} />}
              containerClassName="mb-6"
              editable={!store.isAuthLoading}
            />

            {error && (
              <Text variant="caption" style={{ color: colors.error, marginBottom: 16 }}>
                {error}
              </Text>
            )}

            {/* Buttons */}
            <View style={{ gap: 16 }}>
              <Button
                label={store.isAuthLoading ? 'Sending...' : 'Send code'}
                onPress={handleSendCode}
                variant="primary"
                size="lg"
                fullWidth
                disabled={!isPhoneValid || !phone.trim() || store.isAuthLoading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

export default DriverLoginScreen;
