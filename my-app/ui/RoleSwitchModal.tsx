import { View, Modal, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { Icon } from './Icon';
import { colors } from '@/theme/colors';

interface RoleSwitchModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromRole: 'passenger' | 'driver';
  toRole: 'passenger' | 'driver';
}

export function RoleSwitchModal({
  visible,
  onClose,
  onConfirm,
  fromRole,
  toRole,
}: RoleSwitchModalProps) {
  const isSwitchingToDriver = toRole === 'driver';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.warning + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Icon name="warning" size={32} color={colors.warning} />
            </View>
            <Text variant="h3" weight="600" style={{ marginBottom: 8, textAlign: 'center' }}>
              Switch to {toRole === 'driver' ? 'Driver' : 'Passenger'}?
            </Text>
          </View>

          {isSwitchingToDriver && (
            <View style={{ marginBottom: 24 }}>
              <Text variant="body" style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 12 }}>
                You are about to switch from Passenger to Driver mode. This action is{' '}
                <Text variant="body" weight="600" style={{ color: colors.error }}>
                  irreversible
                </Text>
                .
              </Text>
              <Text variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>
                Once switched, you will only be able to operate as a driver and provide services. You will need to complete the driver onboarding process if you haven't already.
              </Text>
            </View>
          )}

          {!isSwitchingToDriver && (
            <View style={{ marginBottom: 24 }}>
              <Text variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>
                You are about to switch from Driver to Passenger mode. You will no longer be able to provide driver services.
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              label="Cancel"
              onPress={onClose}
              variant="outline"
              size="lg"
              style={{ flex: 1 }}
            />
            <Button
              label="Continue"
              onPress={onConfirm}
              variant="primary"
              size="lg"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

