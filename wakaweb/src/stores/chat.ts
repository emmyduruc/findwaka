import { create } from 'zustand';
import { createChatService } from '../services/chat';
import type { ConversationListItem, Conversation, Message } from '../services/chat';
import { createWebSocketService } from '../services/websocket';

interface ChatState {
  conversations: ConversationListItem[];
  currentConversation: Conversation | null;
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  getOrCreateConversation: (otherUserId: string) => Promise<string>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  markAsRead: (conversationId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => {
  const chatService = createChatService();
  const websocketService = createWebSocketService();

  return {
    conversations: [],
    currentConversation: null,
    unreadCount: 0,
    isConnected: false,
    isLoading: false,
    error: null,

    loadConversations: async () => {
      try {
        set({ isLoading: true, error: null });
        const conversations = await chatService.getConversations();
        const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
        set({ conversations, unreadCount, isLoading: false });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || error.message || 'Failed to load conversations',
          isLoading: false,
        });
      }
    },

    loadConversation: async (id: string) => {
      try {
        set({ isLoading: true, error: null });
        const conversation = await chatService.getConversation(id);
        set({ currentConversation: conversation, isLoading: false });
        await get().markAsRead(id);
      } catch (error: any) {
        set({
          error: error.response?.data?.message || error.message || 'Failed to load conversation',
          isLoading: false,
        });
      }
    },

    getOrCreateConversation: async (otherUserId: string): Promise<string> => {
      try {
        const { id } = await chatService.getOrCreateConversation(otherUserId);
        await get().loadConversation(id);
        return id;
      } catch (error: any) {
        console.error('Failed to get or create conversation:', error);
        throw error;
      }
    },

    sendMessage: async (conversationId: string, content: string) => {
      try {
        await websocketService.sendMessage(conversationId, content);
        // Reload conversation to get the new message
        await get().loadConversation(conversationId);
        await get().loadConversations();
      } catch (error: any) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },

    connectWebSocket: async () => {
      try {
        await websocketService.connect();
        set({ isConnected: websocketService.isConnected() });

        websocketService.on('message:received', (message: Message) => {
          const { currentConversation } = get();
          if (currentConversation?.id === message.conversationId) {
            set({
              currentConversation: {
                ...currentConversation,
                messages: [...currentConversation.messages, message],
              },
            });
          }

          // Update conversations list
          get().loadConversations();
        });
      } catch (error: any) {
        console.error('Failed to connect WebSocket:', error);
      }
    },

    disconnectWebSocket: () => {
      websocketService.disconnect();
      set({ isConnected: false });
    },

    markAsRead: async (conversationId: string) => {
      try {
        await chatService.markAsRead(conversationId);
        await get().loadConversations();
      } catch (error: any) {
        console.error('Failed to mark as read:', error);
      }
    },
  };
});

