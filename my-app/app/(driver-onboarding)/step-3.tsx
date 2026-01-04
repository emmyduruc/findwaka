import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Input } from '@/ui/Input';
import { BackButton } from '@/ui/BackButton';
import { Icon } from '@/ui/Icon';
import { colors } from '@/theme/colors';
import { requiredStringSchema } from '@/utils/validation';

/**
 * Driver onboarding step 3: Areas of operation
 * 
 * Collects main areas where the driver operates.
 * At least 1 area is required.
 * Plus button on 3rd input to add more inputs.
 */
const DriverOnboardingStep3 = observer(() => {
  const store = useAppStore();
  const params = useLocalSearchParams<{ vehicleType?: string }>();

  const [areas, setAreas] = useState<string[]>(['', '', '']);
  const [areaValidations, setAreaValidations] = useState<boolean[]>([false, false, false]);

  const handleAreaChange = (index: number, value: string) => {
    const newAreas = [...areas];
    newAreas[index] = value;
    setAreas(newAreas);

    // Validate this area
    try {
      requiredStringSchema.parse(value);
      const newValidations = [...areaValidations];
      newValidations[index] = true;
      setAreaValidations(newValidations);
    } catch {
      const newValidations = [...areaValidations];
      newValidations[index] = false;
      setAreaValidations(newValidations);
    }
  };

  const handleAddArea = () => {
    setAreas([...areas, '']);
    setAreaValidations([...areaValidations, false]);
  };

  const handleContinue = async () => {
    // Validate at least one area is entered
    const validAreas = areas.filter((area, index) => area.trim() && areaValidations[index]);
    
    if (validAreas.length === 0) {
      return;
    }

    // TODO: Save areas to store/database
    
    // Complete driver onboarding
    await store.setDriverOnboardingComplete(true);
    
    // Route to home (nearby tab)
    router.replace('/(tabs)/nearby');
  };

  const hasAtLeastOneValidArea = areas.some((area, index) => area.trim() && areaValidations[index]);

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
                      onValidationChange={(isValid) => {
                        const newValidations = [...areaValidations];
                        newValidations[index] = isValid;
                        setAreaValidations(newValidations);
                      }}
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
              disabled={!hasAtLeastOneValidArea}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

export default DriverOnboardingStep3;
