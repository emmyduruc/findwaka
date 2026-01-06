import { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { auth } from '@/config/firebase';
import { useStorage } from '@/stores/root';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Input } from '@/ui/Input';
import { Chip } from '@/ui/Chip';
import { BackButton } from '@/ui/BackButton';
import { colors } from '@/theme/colors';
import { nameSchema } from '@/utils/validation';

export type VehicleType = 'bike' | 'tricycle' | 'car';

/**
 * Driver onboarding step 1: Basic info
 * 
 * Collects:
 * - Display name
 * - Vehicle type (bike/tricycle/car)
 */
const DriverOnboardingStep1 = observer(() => {
  const rootStore = useStorage();
  const appStore = useAppStore();
  const [displayName, setDisplayName] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [isNameValid, setIsNameValid] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const firebaseUser = auth().currentUser;
        
        if (!firebaseUser) {
          // No Firebase user, redirect to driver login
          router.replace('/(auth)/driver-login');
          return;
        }

        // Verify token exists and is valid
        try {
          const token = await firebaseUser.getIdToken(false);
          if (!token) {
            // Token not available, redirect to login
            router.replace('/(auth)/driver-login');
            return;
          }
        } catch (tokenError) {
          // Token error, redirect to login
          console.error('Token verification failed:', tokenError);
          router.replace('/(auth)/driver-login');
          return;
        }

        // User is authenticated, show the screen
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/(auth)/driver-login');
      }
    };

    checkAuthentication();
  }, []);

  if (isCheckingAuth) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="body" color="muted">
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleContinue = () => {
    if (!isNameValid || !displayName.trim() || !vehicleType) {
      return;
    }

    rootStore.driverOnboarding.setDisplayName(displayName);
    rootStore.driverOnboarding.setVehicleType(vehicleType);
    
    if (vehicleType === 'bike') {
      router.push({
        pathname: '/(driver-onboarding)/step-3',
        params: { vehicleType: 'bike' },
      });
    } else {
      router.push({
        pathname: '/(driver-onboarding)/step-2',
        params: { vehicleType },
      });
    }
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
          {/* Back Button */}
          <BackButton />

          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
            {/* Title */}
            <Text variant="h2" weight="600" style={{ marginBottom: 48 }}>
              Driver setup
            </Text>

            {/* Display Name Input */}
            <Input
              label="Display name"
              placeholder="Enter your name"
              value={displayName}
              onChangeText={setDisplayName}
              autoComplete="name"
              schema={nameSchema}
              onValidationChange={(isValid) => setIsNameValid(isValid)}
              containerClassName="mb-8"
            />

            {/* Vehicle Type */}
            <View style={{ marginBottom: 48 }}>
              <Text
                variant="label"
                weight="500"
                style={{ marginBottom: 16, color: colors.textMuted }}
              >
                Vehicle type
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                <Chip
                  label="Bike"
                  selected={vehicleType === 'bike'}
                  onPress={() => setVehicleType('bike')}
                />
                <Chip
                  label="Tricycle"
                  selected={vehicleType === 'tricycle'}
                  onPress={() => setVehicleType('tricycle')}
                />
                <Chip
                  label="Car"
                  selected={vehicleType === 'car'}
                  onPress={() => setVehicleType('car')}
                />
              </View>
            </View>

            {/* Button */}
            <Button
              label="Continue"
              onPress={handleContinue}
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isNameValid || !displayName.trim() || !vehicleType}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

export default DriverOnboardingStep1;
