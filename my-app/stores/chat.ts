import { makeAutoObservable, runInAction } from 'mobx';
import { createChatService, ConversationListItem, Conversation, Message } from '@/services/chat';
import { createWebSocketService } from '@/services/websocket';
import { IRootStore } from './root';
import { ILoggerService } from '@/services/logger';
import { INotificationService } from '@/services/notifications';

export const createChatStore = (
    root: IRootStore,
    logger: ILoggerService,
    notificationService: INotificationService,
) => {
    const chatService = createChatService();
    const websocketService = createWebSocketService();

    const store = makeAutoObservable({
        conversations: [] as ConversationListItem[],
        currentConversation: null as Conversation | null,
        unreadCount: 0,
        isLoading: false,
        error: null as string | null,
        isConnected: false,

        init: async () => {
            try {
                await store.loadConversations();
                await store.connectWebSocket();
            } catch (error: any) {
                logger.error(
                    `Failed to initialize chat store: ${error.message || error}`,
                    logger.templateMessages.METHOD
                );
            }
        },

        connectWebSocket: async () => {
            try {
                const authStore = root.auth as any;
                if (authStore?.authStatus !== 'loggedIn') {
                    return;
                }

                await websocketService.connect();
                
                runInAction(() => {
                    store.isConnected = websocketService.isConnected();
                });

                websocketService.on('message:received', (message: Message) => {
                    runInAction(() => {
                        if (store.currentConversation?.id === message.conversationId) {
                            store.currentConversation.messages.push(message);
                        }
                        
                        const conversation = store.conversations.find(c => c.id === message.conversationId);
                        if (conversation) {
                            conversation.lastMessage = message;
                            conversation.lastMessageAt = message.createdAt;
                            conversation.unreadCount++;
                            store.unreadCount++;
                        } else {
                            store.loadConversations();
                        }
                    });
                });
            } catch (error: any) {
                logger.error(
                    `Failed to connect WebSocket: ${error.message || error}`,
                    logger.templateMessages.METHOD
                );
            }
        },

        disconnectWebSocket: () => {
            websocketService.disconnect();
            runInAction(() => {
                store.isConnected = false;
            });
        },

        loadConversations: async () => {
            try {
                runInAction(() => {
                    store.isLoading = true;
                    store.error = null;
                });

                const conversations = await chatService.getConversations();

                runInAction(() => {
                    store.conversations = conversations;
                    store.unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
                    store.isLoading = false;
                });
            } catch (error: any) {
                runInAction(() => {
                    store.error = error.response?.data?.message || error.message || 'Failed to load conversations';
                    store.isLoading = false;
                });
                logger.error(
                    `Failed to load conversations: ${error.message || error}`,
                    logger.templateMessages.METHOD
                );
                throw error;
            }
        },

        loadConversation: async (id: string) => {
            try {
                runInAction(() => {
                    store.isLoading = true;
                    store.error = null;
                });

                const conversation = await chatService.getConversation(id);

                runInAction(() => {
                    store.currentConversation = conversation;
                    store.isLoading = false;
                });

                await store.markAsRead(id);
            } catch (error: any) {
                runInAction(() => {
                    store.error = error.response?.data?.message || error.message || 'Failed to load conversation';
                    store.isLoading = false;
                });
                logger.error(
                    `Failed to load conversation: ${error.message || error}`,
                    logger.templateMessages.METHOD
                );
                throw error;
            }
        },

        getOrCreateConversation: async (otherUserId: string): Promise<string> => {
            try {
                const result = await chatService.getOrCreateConversation(otherUserId);
                await store.loadConversations();
                return result.id;
            } catch (error: any) {
                logger.error(
                    `Failed to get or create conversation: ${error.message || error}`,
                    logger.templateMessages.METHOD
                );
                throw error;
            }
        },

        sendMessage: async (conversationId: string, content: string) => {
            try {
                if (store.isConnected) {
                    await websocketService.sendMessage(conversationId, content);
                } else {
                    const message = await chatService.sendMessage(conversationId, content);
                    runInAction(() => {
                        if (store.currentConversation?.id === conversationId) {
                            store.currentConversation.messages.push(message);
                        }
                    });
                }
            } catch (error: any) {
                logger.error(
                    `Failed to send message: ${error.message || error}`,
                    logger.templateMessages.METHOD
                );
                throw error;
            }
        },

        markAsRead: async (conversationId: string) => {
            try {
                await chatService.markAsRead(conversationId);
                
                runInAction(() => {
                    const conversation = store.conversations.find(c => c.id === conversationId);
                    if (conversation) {
                        conversation.unreadCount = 0;
                        store.unreadCount = store.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
                    }
                });
            } catch (error: any) {
                logger.error(
                    `Failed to mark as read: ${error.message || error}`,
                    logger.templateMessages.METHOD
                );
            }
        },

        clearCurrentConversation: () => {
            runInAction(() => {
                store.currentConversation = null;
            });
        },
    });

    logger?.log(
        "Chat store initialized",
        logger.templateMessages.SERVICE
    );

    return store;
};

export type IChatStore = ReturnType<typeof createChatStore>;

