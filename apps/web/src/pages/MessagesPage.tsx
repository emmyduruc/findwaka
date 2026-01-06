import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useChatStore } from '../stores/chat';
import { useAuthStore } from '../stores/auth';

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const {
    conversations,
    currentConversation,
    loadConversations,
    loadConversation,
    sendMessage,
    connectWebSocket,
    disconnectWebSocket,
  } = useChatStore();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    loadConversations();
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      loadConversation(selectedConversationId);
    }
  }, [selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversationId) return;

    try {
      await sendMessage(selectedConversationId, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageCircle size={64} className="mx-auto mb-4 text-textMuted" />
          <p className="text-textMuted">No conversations yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-border bg-surface">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold text-textPrimary">Messages</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation.id)}
              className={`w-full p-4 border-b border-border hover:bg-surface/80 transition-colors text-left ${
                selectedConversationId === conversation.id ? 'bg-accentPrimary/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={conversation.participantAvatar}
                  name={conversation.participantName}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-textPrimary truncate">
                      {conversation.participantName}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-accentPrimary text-background text-xs rounded-full px-2 py-1">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-textMuted truncate">
                    {conversation.lastMessage?.content || 'No messages'}
                  </p>
                  <p className="text-xs text-textMuted mt-1">
                    {formatTime(conversation.lastMessageAt)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-surface">
              <div className="flex items-center gap-3">
                <Avatar
                  src={
                    currentConversation.participant1Id === userId
                      ? conversations.find((c) => c.id === currentConversation.id)
                          ?.participantAvatar
                      : conversations.find((c) => c.id === currentConversation.id)
                          ?.participantAvatar
                  }
                  name={
                    currentConversation.participant1Id === userId
                      ? conversations.find((c) => c.id === currentConversation.id)
                          ?.participantName || 'User'
                      : conversations.find((c) => c.id === currentConversation.id)
                          ?.participantName || 'User'
                  }
                  size="md"
                />
                <div>
                  <p className="font-semibold text-textPrimary">
                    {currentConversation.participant1Id === userId
                      ? conversations.find((c) => c.id === currentConversation.id)
                          ?.participantName || 'User'
                      : conversations.find((c) => c.id === currentConversation.id)
                          ?.participantName || 'User'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation.messages.map((message) => {
                const isOwn = message.senderId === userId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-accentPrimary text-background'
                          : 'bg-surface text-textPrimary border border-border'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-background/70' : 'text-textMuted'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-surface">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 text-textMuted" />
              <p className="text-textMuted">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

