import React from 'react';
import { Modal, View, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from './Text';
import { Icon } from './Icon';
import { colors } from '@/theme/colors';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
}

/**
 * Image picker modal sheet
 * 
 * Shows options to pick image from camera or gallery
 */
export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onCamera,
  onGallery,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 8,
            paddingBottom: 32,
          }}
        >
          <SafeAreaView edges={['bottom']}>
            {/* Handle */}
            <View className="items-center mb-6">
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: colors.border,
                  borderRadius: 2,
                }}
              />
            </View>

            {/* Title */}
            <Text variant="h3" weight="600" className="text-center mb-8">
              Select Image
            </Text>

            {/* Options */}
            <View className="px-5 gap-4">
              <TouchableOpacity
                onPress={onCamera}
                className="flex-row items-center justify-between py-4 px-5 rounded-xl"
                style={{ backgroundColor: colors.background }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.accentPrimary + '20' }}
                  >
                    <Icon name="camera-outline" size={24} color={colors.accentPrimary} />
                  </View>
                  <Text variant="body" weight="500">
                    Camera
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onGallery}
                className="flex-row items-center justify-between py-4 px-5 rounded-xl"
                style={{ backgroundColor: colors.background }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.accentSecondary + '20' }}
                  >
                    <Icon name="images-outline" size={24} color={colors.accentSecondary} />
                  </View>
                  <Text variant="body" weight="500">
                    Gallery
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                className="py-4 px-5 rounded-xl mt-2"
                style={{ backgroundColor: colors.background }}
                activeOpacity={0.7}
              >
                <Text variant="body" weight="500" className="text-center" style={{ color: colors.error }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
