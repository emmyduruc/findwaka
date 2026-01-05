import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useStorage } from '@/stores/root';
import { Text } from '@/ui/Text';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { colors } from '@/theme/colors';

const ChatListScreen = observer(() => {
  const rootStore = useStorage();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    rootStore.chat.loadConversations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await rootStore.chat.loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = async (conversationId: string) => {
    await rootStore.chat.loadConversation(conversationId);
    router.push(`/chat/${conversationId}`);
  };

  if (rootStore.chat.isLoading && rootStore.chat.conversations.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="body" style={{ color: colors.textMuted }}>
            Loading conversations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (rootStore.chat.conversations.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Icon name="chatbubbles-outline" size={64} color={colors.textMuted} />
          <Text variant="h3" weight="600" style={{ marginTop: 16, marginBottom: 8 }}>
            No conversations yet
          </Text>
          <Text variant="body" style={{ color: colors.textMuted, textAlign: 'center' }}>
            Start a conversation by messaging a driver from their profile
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text variant="h2" weight="700">
          Messages
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentPrimary} />
        }
      >
        {rootStore.chat.conversations.map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            onPress={() => handleConversationPress(conversation.id)}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Avatar
              uri={conversation.participantAvatar || undefined}
              name={conversation.participantName}
              size={56}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <Text variant="body" weight="600" style={{ fontSize: 16 }}>
                  {conversation.participantName}
                </Text>
                {conversation.lastMessageAt && (
                  <Text variant="caption" style={{ color: colors.textMuted, fontSize: 12 }}>
                    {rootStore.gui.formatTime(conversation.lastMessageAt)}
                  </Text>
                )}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  variant="body"
                  style={{
                    color: colors.textMuted,
                    fontSize: 14,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {conversation.lastMessage?.content || 'No messages yet'}
                </Text>
                {conversation.unreadCount > 0 && (
                  <View
                    style={{
                      backgroundColor: colors.accentPrimary,
                      borderRadius: 12,
                      minWidth: 24,
                      height: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 8,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      variant="caption"
                      weight="600"
                      style={{ color: colors.background, fontSize: 12 }}
                    >
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
});

export default ChatListScreen;

