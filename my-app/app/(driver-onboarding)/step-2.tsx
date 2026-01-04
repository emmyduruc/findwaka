import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Toggle } from '@/ui/Toggle';
import { Card } from '@/ui/Card';
import { colors } from '@/theme/colors';

/**
 * Driver onboarding step 2: Documents checklist
 * 
 * Shows document checklist with toggle states.
 * TODO: Later implement actual document upload functionality.
 */
export default function DriverOnboardingStep2() {
  const [idCardUploaded, setIdCardUploaded] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [vehiclePapersUploaded, setVehiclePapersUploaded] = useState(false);

  const handleContinue = () => {
    // TODO: Validate documents are uploaded
    // For now, just continue
    router.push('/(driver-onboarding)/step-3');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
          {/* Title */}
          <Text variant="h2" weight="600" style={{ marginBottom: 48 }}>
            Documents
          </Text>

          {/* Document Checklist */}
          <Card style={{ marginBottom: 32 }}>
            <View style={{ gap: 24 }}>
              <Toggle
                label="ID card"
                value={idCardUploaded}
                onValueChange={setIdCardUploaded}
              />
              <Toggle
                label="Driver license"
                value={licenseUploaded}
                onValueChange={setLicenseUploaded}
              />
              <Toggle
                label="Vehicle papers"
                value={vehiclePapersUploaded}
                onValueChange={setVehiclePapersUploaded}
              />
            </View>
          </Card>

          {/* Button */}
          <Button
            label="Continue"
            onPress={handleContinue}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
