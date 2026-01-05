import { io, Socket } from 'socket.io-client';
import { auth } from '@/config/firebase';

export interface SocketEvents {
  'message:send': (data: { conversationId: string; content: string }) => void;
  'message:received': (message: any) => void;
  'location:update': (data: { lat: number; lng: number; accuracyM?: number; heading?: number; speedMps?: number }) => void;
  'message:read': (data: { conversationId: string }) => void;
}

export const createWebSocketService = () => {
  let socket: Socket | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  const connect = async (): Promise<Socket> => {
    if (socket?.connected) {
      return socket;
    }

    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      const backendUrl = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:4000';

      socket = io(backendUrl, {
        auth: {
          token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
        reconnectAttempts = 0;
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reconnectAttempts++;
        if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
      });

      return socket;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      throw error;
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!socket?.connected) {
      await connect();
    }
    socket?.emit('message:send', { conversationId, content });
  };

  const updateLocation = async (lat: number, lng: number, accuracyM?: number, heading?: number, speedMps?: number) => {
    if (!socket?.connected) {
      await connect();
    }
    socket?.emit('location:update', { lat, lng, accuracyM, heading, speedMps });
  };

  const markAsRead = async (conversationId: string) => {
    if (!socket?.connected) {
      await connect();
    }
    socket?.emit('message:read', { conversationId });
  };

  const on = <K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) => {
    if (!socket) {
      connect().then((s) => {
        s.on(event as string, callback as any);
      });
    } else {
      socket.on(event as string, callback as any);
    }
  };

  const off = <K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]) => {
    if (socket) {
      if (callback) {
        socket.off(event as string, callback as any);
      } else {
        socket.off(event as string);
      }
    }
  };

  return {
    connect,
    disconnect,
    sendMessage,
    updateLocation,
    markAsRead,
    on,
    off,
    getSocket: () => socket,
    isConnected: () => socket?.connected || false,
  };
};

export type WebSocketService = ReturnType<typeof createWebSocketService>;

