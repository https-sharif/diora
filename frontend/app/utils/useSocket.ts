import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/constants/api';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
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
  onConnect?: () => void,
  onDisconnect?: () => void
) {
  const s = getSocket();

  s.on('connect', () => {
    console.log('Socket connected:', s.id);
    if (onConnect) onConnect();
  });

  s.on('notification', (notif) => {
    console.log('🔔 Received notification via socket:', notif);
    onNotification(notif);
  });

  s.on('disconnect', () => {
    console.log('Socket disconnected');
    if (onDisconnect) onDisconnect();
  });
}

export default function initSocket(
  userId: string,
  onNotification: (notif: any) => void,
  onConnect?: () => void,
  onDisconnect?: () => void
) {
  const s = getSocket();

  if (!s.connected) s.connect();

  s.once('connect', () => {
    console.log('Socket connected:', s.id);
    s.emit('register', userId);
  });

  setupListeners(onNotification, onConnect, onDisconnect);
}

