import { io, Socket } from 'socket.io-client';
import { config } from '@/config';
import { Message } from '@/types/Message';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(config.apiUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) {
    console.log('🔌 Connecting to socket...');
    s.connect();
  }
  return s;
}

export function registerUser(userId: string) {
  const s = getSocket();
  if (!userId) return;
  console.log('👤 Registering user:', userId);
  s.emit('register', userId);
}

export function setupListeners(
  onNotification: (notif: any) => void,
  onMessage: (data: { conversationId: string; message: any }) => void,
  onConnect?: () => void,
  onDisconnect?: () => void,
  onMessageReaction?: (data: any) => void,
  onMessageDeleted?: (data: any) => void,
  onMessagesRead?: (data: any) => void
) {
  const s = getSocket();

  s.on('connect', () => {
    if (onConnect) onConnect();
  });

  s.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });

  s.on('disconnect', (reason) => {
    if (onDisconnect) onDisconnect();
  });

  s.on('notification', (notif) => {
    console.log('🔔 Received notification:', notif);
    onNotification(notif);
  });

  s.on('newMessage', (data) => {
    console.log('💬 Received new message:', data);
    onMessage(data);
  });

  if (onMessageReaction) {
    s.on('messageReaction', (data) => {
      console.log('😀 Message reaction:', data);
      onMessageReaction(data);
    });
  }

  if (onMessageDeleted) {
    s.on('messageDeleted', (data) => {
      console.log('🗑️ Message deleted:', data);
      onMessageDeleted(data);
    });
  }

  if (onMessagesRead) {
    s.on('messagesRead', (data) => {
      console.log('👀 Messages read:', data);
      onMessagesRead(data);
    });
  }
}

export default function initSocket(
  userId: string,
  onNotification: (notif: any) => void,
  onMessage: (data: { conversationId: string; message: Message }) => void,
  onConnect?: () => void,
  onDisconnect?: () => void,
  onMessageReaction?: (data: any) => void,
  onMessageDeleted?: (data: any) => void,
  onMessagesRead?: (data: any) => void
) {
  const s = getSocket();

  if (!s.connected) {
    console.log('🔌 Initializing socket connection...');
    s.connect();
  }

  s.once('connect', () => {
    console.log('✅ Socket initialized, registering user...');
    s.emit('register', userId);
  });

  s.on('newMessage', (data) => {
    console.log('💬 New message received:', data);
    onMessage(data);
  });

  setupListeners(
    onNotification,
    onMessage,
    onConnect,
    onDisconnect,
    onMessageReaction,
    onMessageDeleted,
    onMessagesRead
  );
}
