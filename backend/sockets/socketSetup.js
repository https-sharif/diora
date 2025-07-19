import { Server } from 'socket.io';

let io;
const onlineUsers = new Map();

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('register', (userId) => {
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      console.log(`User registered: ${userId} with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`User disconnected: ${socket.userId} socket ${socket.id}`);
      }
      console.log(`Socket disconnected: ${socket.id}`);
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
