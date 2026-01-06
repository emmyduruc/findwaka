import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/stores/useAppStore';
import { useStorage } from '@/stores/root';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Input } from '@/ui/Input';
import { BackButton } from '@/ui/BackButton';
import { Icon } from '@/ui/Icon';
import { colors } from '@/theme/colors';
import { requiredStringSchema } from '@/utils/validation';
import { createDriverService } from '@/services/driver';
import { VehicleType } from '@waka/shared';

/**
 * Driver onboarding step 3: Areas of operation
 * 
 * Collects main areas where the driver operates.
 * At least 1 area is required.
 * Plus button on 3rd input to add more inputs.
 */
const DriverOnboardingStep3 = observer(() => {
  const store = useAppStore();
  const rootStore = useStorage();
  const params = useLocalSearchParams<{ vehicleType?: string; vehicleBrand?: string; vehicleColor?: string; licensePlate?: string }>();
  const driverService = createDriverService();

  const [areas, setAreas] = useState<string[]>(['', '', '']);
  const [areaValidations, setAreaValidations] = useState<boolean[]>([false, false, false]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAreaChange = (index: number, value: string) => {
    const newAreas = [...areas];
    newAreas[index] = value;
    setAreas(newAreas);
  };

  const handleValidationChange = (index: number, isValid: boolean) => {
    const newValidations = [...areaValidations];
    newValidations[index] = isValid;
    setAreaValidations(newValidations);
  };

  const handleAddArea = () => {
    const newAreas = [...areas, ''];
    const newValidations = [...areaValidations, false];
    setAreas(newAreas);
    setAreaValidations(newValidations);
  };

  const handleContinue = async () => {
    const validAreas = areas.filter((area, index) => area.trim() && areaValidations[index]);
    
    if (validAreas.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const vehicleTypeParam = params.vehicleType?.toUpperCase() || 'BIKE';
      const primaryArea = validAreas[0];

      try {
        await driverService.createProfile({
          vehicleType: vehicleTypeParam as VehicleType,
          communityHome: primaryArea,
          vehicleBrand: params.vehicleBrand || null,
          vehicleColor: params.vehicleColor || null,
          licensePlate: params.licensePlate || null,
        });
      } catch (createError: any) {
        if (createError.response?.status === 400 && createError.response?.data?.message?.includes('already exists')) {
          await driverService.updateProfile({
            vehicleType: vehicleTypeParam as VehicleType,
            communityHome: primaryArea,
            vehicleBrand: params.vehicleBrand || undefined,
            vehicleColor: params.vehicleColor || undefined,
            licensePlate: params.licensePlate || undefined,
            areasOfOperation: validAreas,
          });
        } else {
          throw createError;
        }
      }

      if (validAreas.length > 1) {
        await driverService.updateProfile({
          areasOfOperation: validAreas,
        });
      }

      await store.setDriverOnboardingComplete(true);
      
      router.replace('/(tabs)/drivers');
    } catch (error: any) {
      console.error('Error completing driver onboarding:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to complete onboarding. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAtLeastOneValidArea = areas.some((area) => {
    const trimmed = area.trim();
    if (!trimmed || trimmed.length === 0) return false;
    try {
      requiredStringSchema.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  });

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
          <BackButton />

          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
            <Text variant="h2" weight="600" style={{ marginBottom: 16 }}>
              Main area you operate
            </Text>
            <Text
              variant="body"
              weight="400"
              style={{ marginBottom: 48, color: colors.textMuted }}
            >
              Enter at least one area where you provide rides
            </Text>

            {/* Area Inputs */}
            <View style={{ gap: 16, marginBottom: 32 }}>
              {areas.map((area, index) => (
                <View key={index} className={`relative ${index >= 2 && index === areas.length - 1 ? 'flex-row gap-4 items-center' : ''}`}>
                  <View className={`${index >= 2 && index === areas.length - 1 ? 'w-[98%]' : ''}`} style={{ paddingRight: index >= 2 && index === areas.length - 1 ? 56 : 0 }}>
                    <Input
                      label={index === 0 ? 'Area 1' : index === 1 ? 'Area 2' : `Area ${index + 1}`}
                      placeholder="e.g., Victoria Island, Lekki"
                      value={area}
                      onChangeText={(value) => handleAreaChange(index, value)}
                      schema={requiredStringSchema}
                      onValidationChange={(isValid) => handleValidationChange(index, isValid)}
                    />
                  </View>
                  {index >= 2 && index === areas.length - 1 && (
                    <View className="absolute right-0 items-center w-[15%]">
                    <TouchableOpacity
                      onPress={handleAddArea}
                      className=" bg-accentPrimary/20 rounded-full p-4 items-center w-full"
                      activeOpacity={0.7}
                    >
                      <Icon name="add" size={24} color={colors.accentPrimary} />
                    </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <Button
              label="Continue"
              onPress={handleContinue}
              variant="primary"
              size="lg"
              fullWidth
              disabled={!hasAtLeastOneValidArea || isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

export default DriverOnboardingStep3;
