import { useState, useCallback, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';
import { colors } from '@/theme/colors';

/**
 * Chat screen
 * 
 * Beautiful chat interface with:
 * - Custom styled bubbles
 * - Read receipts (green checkmarks like WhatsApp)
 * - Typing indicator
 * - Premium UI design
 */
export default function ChatScreen() {
  const params = useLocalSearchParams<{ id: string; name?: string }>();
  const driverId = params.id;
  const driverName = params.name || 'Driver';

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userId] = useState('user-1'); // Current user ID

  // Mock initial messages
  useEffect(() => {
    setMessages([
      {
        _id: 2,
        text: 'Hello! I need a ride to Victoria Island.',
        createdAt: new Date(Date.now() - 300000), // 5 minutes ago
        user: {
          _id: userId,
          name: 'You',
        },
        sent: true,
        received: true,
        read: true,
      } as any,
      {
        _id: 1,
        text: 'Hi! I can help you with that. What time do you need to be picked up?',
        createdAt: new Date(Date.now() - 360000), // 6 minutes ago
        user: {
          _id: driverId,
          name: driverName,
        },
      } as any,
    ]);
  }, [driverId, driverName, userId]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    
    // Simulate typing indicator
    setIsTyping(true);
    
    // Simulate received and read status after delay
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === newMessages[0]._id
            ? { ...msg, received: true, sent: true }
            : msg
        )
      );
      setIsTyping(false);
      
      // Simulate read status after another delay
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === newMessages[0]._id ? { ...msg, received: true, sent: true, read: true } : msg
          )
        );
      }, 1000);
    }, 500);
  }, []);

  // Custom bubble component
  const renderBubble = useCallback((props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: colors.accentPrimary,
            borderRadius: 18,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 4,
            marginRight: 8,
            marginLeft: 50,
          },
          left: {
            backgroundColor: colors.surface,
            borderRadius: 18,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 4,
            marginLeft: 8,
            marginRight: 50,
            borderWidth: 1,
            borderColor: colors.border,
          },
        }}
        textStyle={{
          right: {
            color: colors.background,
            fontSize: 15,
            fontFamily: 'Montserrat_400Regular',
            lineHeight: 20,
          },
          left: {
            color: colors.textPrimary,
            fontSize: 15,
            fontFamily: 'Montserrat_400Regular',
            lineHeight: 20,
          },
        }}
        timeTextStyle={{
          right: {
            color: colors.background + 'AA',
            fontSize: 11,
            fontFamily: 'Montserrat_400Regular',
          },
          left: {
            color: colors.textMuted,
            fontSize: 11,
            fontFamily: 'Montserrat_400Regular',
          },
        }}
        renderTime={(timeProps) => {
          const { currentMessage, position } = timeProps;
          if (!currentMessage || !currentMessage.createdAt) return null;
          
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: position === 'right' ? 'flex-end' : 'flex-start',
                marginTop: 4,
                paddingHorizontal: position === 'right' ? 8 : 8,
              }}
            >
              <Text
                variant="caption"
                style={{
                  color: position === 'right' ? colors.background + 'AA' : colors.textMuted,
                  fontSize: 11,
                  marginRight: 4,
                }}
              >
                {new Date(currentMessage.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {position === 'right' && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {currentMessage.read ? (
                    <Icon name="checkmark-done" size={14} color={colors.success} />
                  ) : currentMessage.received ? (
                    <Icon name="checkmark-done" size={14} color={colors.textMuted} />
                  ) : (
                    <Icon name="checkmark" size={14} color={colors.textMuted} />
                  )}
                </View>
              )}
            </View>
          );
        }}
      />
    );
  }, []);

  // Custom input toolbar
  const renderInputToolbar = useCallback((props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingHorizontal: 8,
        }}
        primaryStyle={{
          alignItems: 'center',
        }}
        textInputStyle={{
          color: colors.textPrimary,
          fontSize: 15,
          fontFamily: 'Montserrat_400Regular',
          backgroundColor: colors.background,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: Platform.OS === 'ios' ? 10 : 8,
          marginLeft: 0,
          marginRight: 0,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
    );
  }, []);

  // Custom send button
  const renderSend = useCallback((props: any) => {
    return (
      <Send {...props}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.accentPrimary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 4,
            marginBottom: Platform.OS === 'ios' ? 0 : 4,
          }}
        >
          <Icon name="send" size={20} color={colors.background} />
        </View>
      </Send>
    );
  }, []);

  // Typing indicator
  const renderFooter = useCallback(() => {
    if (!isTyping) return null;
    
    return (
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 18,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: colors.border,
            marginLeft: 8,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.textMuted,
              }}
            />
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.textMuted,
                marginLeft: 4,
              }}
            />
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.textMuted,
                marginLeft: 4,
              }}
            />
          </View>
        </View>
        <Text
          variant="caption"
          style={{
            color: colors.textMuted,
            marginLeft: 8,
            fontSize: 12,
          }}
        >
          {driverName} is typing...
        </Text>
      </View>
    );
  }, [isTyping, driverName]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text variant="body" weight="600" style={{ fontSize: 16 }}>
              {driverName}
            </Text>
            {isTyping && (
              <Text variant="caption" style={{ color: colors.accentPrimary, fontSize: 12, marginTop: 2 }}>
                typing...
              </Text>
            )}
          </View>
        </View>

        {/* Chat */}
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{
            _id: userId,
          }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          renderFooter={renderFooter}
          placeholder="Type a message..."
          alwaysShowSend
          scrollToBottom
          scrollToBottomComponent={() => (
            <Icon name="chevron-down" size={20} color={colors.accentPrimary} />
          )}
          inverted={false}
          keyboardShouldPersistTaps="never"
          minInputToolbarHeight={60}
          bottomOffset={Platform.OS === 'ios' ? 20 : 0}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

