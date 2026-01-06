import { DBUtils } from '../utils/db';
import axiosInstance from '../utils/fetch';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ConversationListItem {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string | null;
  lastMessage: Message | null;
  lastMessageAt: Date | null;
  unreadCount: number;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  messages: Message[];
}

export const createChatService = () => {
  return {
    getConversations: async (): Promise<ConversationListItem[]> => {
      try {
        const response = await axiosInstance.get(DBUtils.chat.conversations);
        return response as unknown as ConversationListItem[];
      } catch (error: any) {
        console.error('Get conversations error:', error.response?.data || error.message);
        throw error;
      }
    },

    getConversation: async (id: string): Promise<Conversation> => {
      try {
        const response = await axiosInstance.get(DBUtils.chat.getConversation(id));
        return response as unknown as Conversation;
      } catch (error: any) {
        console.error('Get conversation error:', error.response?.data || error.message);
        throw error;
      }
    },

    getOrCreateConversation: async (otherUserId: string): Promise<{ id: string }> => {
      try {
        const response = await axiosInstance.post(DBUtils.chat.getOrCreateConversation(otherUserId));
        return response as unknown as { id: string };
      } catch (error: any) {
        console.error('Get or create conversation error:', error.response?.data || error.message);
        throw error;
      }
    },

    sendMessage: async (conversationId: string, content: string): Promise<Message> => {
      try {
        const response = await axiosInstance.post(DBUtils.chat.messages, {
          conversationId,
          content,
        });
        return response as unknown as Message;
      } catch (error: any) {
        console.error('Send message error:', error.response?.data || error.message);
        throw error;
      }
    },

    markAsRead: async (conversationId: string): Promise<{ success: boolean }> => {
      try {
        const response = await axiosInstance.post(DBUtils.chat.markAsRead(conversationId));
        return response as unknown as { success: boolean };
      } catch (error: any) {
        console.error('Mark as read error:', error.response?.data || error.message);
        throw error;
      }
    },
  };
};

export type ChatService = ReturnType<typeof createChatService>;

