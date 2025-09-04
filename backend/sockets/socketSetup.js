import { Server } from 'socket.io';

let io;
const onlineUsers = new Map();

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);

    socket.on('register', (userId) => {
      console.log('👤 User registered:', userId, 'Socket ID:', socket.id);
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      console.log('📊 Online users count:', onlineUsers.size);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
      if (socket.userId) {
        console.log('👤 Removing user from online list:', socket.userId);
        onlineUsers.delete(socket.userId);
        console.log('📊 Online users count after disconnect:', onlineUsers.size);
      }
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

export { onlineUsers };
