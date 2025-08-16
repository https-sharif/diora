import { getIO, onlineUsers } from './socketSetup.js';

export const emitNewMessage = (conversationId, message, participants) => {
  const io = getIO();
  
  participants.forEach(participantId => {
    const socketId = onlineUsers.get(participantId.toString());
    if (socketId) {
      io.to(socketId).emit('newMessage', {
        conversationId,
        message
      });
    }
  });
};

export const emitMessageReaction = (conversationId, messageId, reactions, participants) => {
  const io = getIO();
  
  participants.forEach(participantId => {
    const socketId = onlineUsers.get(participantId.toString());
    if (socketId) {
      io.to(socketId).emit('messageReaction', {
        conversationId,
        messageId,
        reactions
      });
    }
  });
};

export const emitMessageDeleted = (conversationId, messageId, participants) => {
  const io = getIO();
  
  participants.forEach(participantId => {
    const socketId = onlineUsers.get(participantId.toString());
    if (socketId) {
      io.to(socketId).emit('messageDeleted', {
        conversationId,
        messageId,
        type: 'deleted'
      });
    }
  });
};

export const emitMessagesRead = (conversationId, userId, participants) => {
  const io = getIO();
  
  participants.forEach(participantId => {
    const socketId = onlineUsers.get(participantId.toString());
    if (socketId) {
      io.to(socketId).emit('messagesRead', {
        conversationId,
        userId
      });
    }
  });
};
