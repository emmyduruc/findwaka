import { io, Socket } from 'socket.io-client';
import { getBackendUrl } from '../utils/db';
import { getAuth } from 'firebase/auth';

export interface SocketEvents {
  'message:received': (message: any) => void;
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
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      const backendUrl = getBackendUrl();

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

  const updateLocation = async (
    lat: number,
    lng: number,
    accuracyM?: number,
    heading?: number,
    speedMps?: number
  ) => {
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
    socket?.off(event as string, callback as any);
  };

  const isConnected = (): boolean => {
    return socket?.connected || false;
  };

  return {
    connect,
    disconnect,
    sendMessage,
    updateLocation,
    markAsRead,
    on,
    off,
    isConnected,
  };
};

export type WebSocketService = ReturnType<typeof createWebSocketService>;

