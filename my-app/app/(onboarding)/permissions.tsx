import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { colors } from '@/theme/colors';

/**
 * Permissions explanation screen (optional)
 * 
 * Can be used to explain why permissions are needed.
 * For now, this is a placeholder.
 */
export default function PermissionsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text variant="h2" weight="600" style={{ marginBottom: 16 }}>
            Permissions
          </Text>
          <Text variant="body" color="muted" style={{ marginBottom: 32 }}>
            We need your location to show nearby drivers and rides.
          </Text>
          <Button label="Continue" onPress={() => router.back()} variant="primary" size="lg" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
