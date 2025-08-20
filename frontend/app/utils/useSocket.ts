import { io, Socket } from 'socket.io-client';
import { config } from '@/config';
import { Message } from '@/types/Message';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(config.apiUrl, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function registerUser(userId: string) {
  const s = getSocket();
  if (!userId) return;
  s.emit('register', userId);
}

export function setupListeners(
  onNotification: (notif: any) => void,
  onMessage: (data: { conversationId: string; message: any }) => void,
  onConnect?: () => void,
  onDisconnect?: () => void
) {
  const s = getSocket();

  s.on('connect', () => {
    if (onConnect) onConnect();
  });

  s.on('notification', (notif) => {
    onNotification(notif);
  });

  s.on('message', (data) => {
    onMessage(data);
  });

  s.on('disconnect', () => {
    if (onDisconnect) onDisconnect();
  });
}

export default function initSocket(
  userId: string,
  onNotification: (notif: any) => void,
  onMessage: (data: { conversationId: string; message: Message }) => void,
  onConnect?: () => void,
  onDisconnect?: () => void
) {
  const s = getSocket();

  if (!s.connected) s.connect();

  s.once('connect', () => {
    s.emit('register', userId);
  });

  s.on('message', (data) => {
    onMessage(data);
  });

  setupListeners(onNotification, onMessage, onConnect, onDisconnect);
}
