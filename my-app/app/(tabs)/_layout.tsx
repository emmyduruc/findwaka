import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@/stores/useAppStore';
import { Icon } from '@/ui/Icon';
import { colors } from '@/theme/colors';

/**
 * Tabs layout
 * 
 * Bottom navigation tabs:
 * - Nearby: Passenger view (driver list)
 * - Drivers: Driver dashboard (only accessible to drivers)
 * - Profile: Settings and account
 */
const TabsLayout = observer(() => {
  const store = useAppStore();
  const isDriver = store.role === 'driver' && store.authStatus === 'loggedIn';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          fontFamily: 'Montserrat_500Medium',
        },
      }}
    >
      <Tabs.Screen
        name="nearby"
        options={{
          title: 'Nearby',
          tabBarIcon: ({ color, size }) => (
            <Icon name="location-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="drivers"
        options={{
          title: 'Drivers',
          tabBarIcon: ({ color, size }) => (
            <Icon name="car-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Hide index screen */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      {/* Hide explore screen if it exists */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
});

export default TabsLayout;