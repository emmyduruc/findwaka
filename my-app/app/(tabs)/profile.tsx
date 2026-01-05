import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useAppStore } from '@/stores/useAppStore';
import { useStorage } from '@/stores/root';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { Card } from '@/ui/Card';
import { ListRow } from '@/ui/ListRow';
import { Icon } from '@/ui/Icon';
import { Avatar } from '@/ui/Avatar';
import { UserRole } from '@/models/user.model';
import { ImagePickerModal } from '@/ui/ImagePickerModal';
import { colors } from '@/theme/colors';

/**
 * Profile screen
 * 
 * Shows:
 * - Avatar (clickable, opens image picker modal)
 * - Current mode (Guest/Passenger/Driver)
 * - Profile stats (hours online, profile visits, review stars)
 * - Profile editing
 * - Role switch buttons
 * - Log out button
 */
const ProfileScreen = observer(() => {
  const store = useAppStore();
  const rootStore = useStorage();
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Mock profile stats (TODO: Replace with real data from store/backend)
  const profileStats = {
    hoursOnline: 124,
    profileVisits: 342,
    reviewStars: 4.8,
    totalRides: 89,
  };

  const getCurrentMode = () => {
    if (store.authStatus === 'guest') return 'Guest';
    if (store.authStatus === 'loggedIn' && store.role === UserRole.DRIVER) return 'Driver';
    if (store.authStatus === 'loggedIn' && store.role === UserRole.PASSENGER) return 'Passenger';
    return 'Logged out';
  };

  const handleAvatarPress = () => {
    setImagePickerVisible(true);
  };

  const handleCloseImagePicker = () => {
    setImagePickerVisible(false);
  };

  const handleCamera = async () => {
    setImagePickerVisible(false);
    
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      rootStore.gui.setSelectedImageUri(uri);
      // TODO: Upload image to backend/storage
    }
  };

  const handleGallery = async () => {
    setImagePickerVisible(false);
    
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media library permission is required to select photos.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      rootStore.gui.setSelectedImageUri(uri);
      // TODO: Upload image to backend/storage
    }
  };

  const handleSwitchToPassenger = async () => {
    await store.setRole(UserRole.PASSENGER);
    if (store.authStatus === 'loggedOut') {
      await store.continueAsGuest();
    }
    router.replace('/(tabs)/nearby');
  };

  const handleSwitchToDriver = () => {
    router.push('/(auth)/driver-login');
  };

  const handleLogout = async () => {
    await store.logout();
    // Navigation is handled by store.logout()
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text variant="h2" weight="600" style={{ marginBottom: 32 }}>
          Profile
        </Text>

        {/* Avatar Section */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7}>
            {profileImage ? (
              <View
                className="rounded-full overflow-hidden"
                style={{
                  width: 120,
                  height: 120,
                  borderWidth: 3,
                  borderColor: colors.accentPrimary,
                }}
              >
                <Image
                  source={{ uri: profileImage }}
                  style={{ width: 120, height: 120 }}
                  contentFit="cover"
                />
              </View>
            ) : (
              <View
                className="rounded-full items-center justify-center"
                style={{
                  width: 120,
                  height: 120,
                  backgroundColor: colors.accentPrimary,
                  borderWidth: 3,
                  borderColor: colors.accentPrimary,
                }}
              >
                <Icon name="person" size={48} color={colors.background} />
              </View>
            )}
            <View
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: colors.accentPrimary,
                borderWidth: 3,
                borderColor: colors.background,
              }}
            >
              <Icon name="camera" size={20} color={colors.background} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Current Mode Card */}
        <Card style={{ marginBottom: 24 }}>
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="body" weight="500">
                Current mode
              </Text>
              <Text variant="body" weight="600" style={{ color: colors.accentPrimary }}>
                {getCurrentMode()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Profile Stats Card */}
        {store.authStatus === 'loggedIn' && store.role === UserRole.DRIVER && (
          <Card style={{ marginBottom: 24 }}>
            <View style={{ gap: 20 }}>
              <Text variant="label" weight="600" style={{ marginBottom: 8 }}>
                Profile Stats
              </Text>
              
              <View style={{ gap: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Icon name="time-outline" size={20} color={colors.accentPrimary} />
                    <Text variant="body" weight="400">
                      Hours online
                    </Text>
                  </View>
                  <Text variant="body" weight="600">
                    {profileStats.hoursOnline}h
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Icon name="eye-outline" size={20} color={colors.accentSecondary} />
                    <Text variant="body" weight="400">
                      Profile visits
                    </Text>
                  </View>
                  <Text variant="body" weight="600">
                    {profileStats.profileVisits}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Icon name="star" size={20} color={colors.warning} />
                    <Text variant="body" weight="400">
                      Rating
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text variant="body" weight="600">
                      {profileStats.reviewStars}
                    </Text>
                    <Icon name="star" size={16} color={colors.warning} />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Icon name="car-outline" size={20} color={colors.success} />
                    <Text variant="body" weight="400">
                      Total rides
                    </Text>
                  </View>
                  <Text variant="body" weight="600">
                    {profileStats.totalRides}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={{ gap: 16, marginBottom: 24 }}>
          <Button
            label="Switch to passenger"
            onPress={handleSwitchToPassenger}
            variant="outline"
            size="lg"
            fullWidth
          />
          <Button
            label="Switch to driver"
            onPress={handleSwitchToDriver}
            variant="outline"
            size="lg"
            fullWidth
          />
          {store.authStatus !== 'loggedOut' && (
            <Button
              label="Log out"
              onPress={handleLogout}
              variant="ghost"
              size="lg"
              fullWidth
            />
          )}
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={imagePickerVisible}
        onClose={handleCloseImagePicker}
        onCamera={handleCamera}
        onGallery={handleGallery}
      />
    </SafeAreaView>
  );
});

export default ProfileScreen;
