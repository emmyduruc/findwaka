import { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useStorage } from '@/stores/root';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Input } from '@/ui/Input';
import { Chip } from '@/ui/Chip';
import { BackButton } from '@/ui/BackButton';
import { colors } from '@/theme/colors';
import { requiredStringSchema } from '@/utils/validation';

type VehicleType = 'tricycle' | 'car';
type VehicleColor =
  | 'Black'
  | 'White'
  | 'Red'
  | 'Blue'
  | 'Silver'
  | 'Gray'
  | 'Green'
  | 'Yellow'
  | 'Brown'
  | 'Other';

const VEHICLE_COLORS: VehicleColor[] = [
  'Black',
  'White',
  'Red',
  'Blue',
  'Silver',
  'Gray',
  'Green',
  'Yellow',
  'Brown',
  'Other',
];

/**
 * Driver onboarding step 2: Vehicle details
 * 
 * For keke (tricycle) and car:
 * - Plate number input
 * - Color selector
 * - Vehicle type input (car only)
 */
const DriverOnboardingStep2 = observer(() => {
  const rootStore = useStorage();
  const params = useLocalSearchParams<{ vehicleType?: string }>();
  const vehicleType = (params.vehicleType as VehicleType) || 'car';

  const [plateNumber, setPlateNumber] = useState('');
  const [selectedColor, setSelectedColor] = useState<VehicleColor | null>(null);
  const [vehicleModel, setVehicleModel] = useState('');
  const [isPlateValid, setIsPlateValid] = useState(true);
  const [isModelValid, setIsModelValid] = useState(true);

  const handleContinue = () => {
    if (!isPlateValid || !plateNumber.trim() || !selectedColor) {
      return;
    }
    if (vehicleType === 'car' && (!isModelValid || !vehicleModel.trim())) {
      return;
    }
    
    rootStore.driverOnboarding.setLicensePlate(plateNumber);
    rootStore.driverOnboarding.setVehicleColor(selectedColor);
    if (vehicleType === 'car') {
      rootStore.driverOnboarding.setVehicleBrand(vehicleModel);
    }
    
    router.push({
      pathname: '/(driver-onboarding)/step-3',
      params: {
        vehicleType,
        vehicleBrand: vehicleType === 'car' ? vehicleModel : undefined,
        vehicleColor: selectedColor,
        licensePlate: plateNumber,
      },
    });
  };

  const isFormValid = isPlateValid && plateNumber.trim() && selectedColor && 
    (vehicleType === 'tricycle' || (isModelValid && vehicleModel.trim()));

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
              Vehicle details
            </Text>

            {/* Plate Number Input */}
            <Input
              label="Plate number"
              placeholder={`Enter ${vehicleType === 'tricycle' ? 'keke' : 'vehicle'} plate number`}
              value={plateNumber}
              onChangeText={setPlateNumber}
              autoCapitalize="characters"
              schema={requiredStringSchema}
              onValidationChange={(isValid) => setIsPlateValid(isValid)}
              containerClassName="mb-8"
            />

            {/* Color Selector */}
            <View style={{ marginBottom: 32 }}>
              <Text
                variant="label"
                weight="500"
                style={{ marginBottom: 16, color: colors.textMuted }}
              >
                Color
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                {VEHICLE_COLORS.map((color) => (
                  <Chip
                    key={color}
                    label={color}
                    selected={selectedColor === color}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>

            {/* Vehicle Type Input (Car only) */}
            {vehicleType === 'car' && (
              <Input
                label="Vehicle type"
                placeholder="e.g., Toyota Camry, Honda Accord"
                value={vehicleModel}
                onChangeText={setVehicleModel}
                schema={requiredStringSchema}
                onValidationChange={(isValid) => setIsModelValid(isValid)}
                containerClassName="mb-8"
              />
            )}

            {/* Button */}
            <Button
              label="Continue"
              onPress={handleContinue}
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isFormValid}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

export default DriverOnboardingStep2;
