import { getIO, onlineUsers } from './socketSetup.js';

export const emitNewMessage = (conversationId, message, participants) => {
  const io = getIO();
  console.log('📤 Emitting newMessage to participants:', participants.map(p => p.toString()));

  participants.forEach((participantId) => {
    const socketId = onlineUsers.get(participantId.toString());
    if (socketId) {
      console.log('✅ Sending to socket:', socketId, 'for user:', participantId.toString());
      io.to(socketId).emit('newMessage', {
        conversationId,
        message,
      });
    } else {
      console.log('⚠️ User not online:', participantId.toString());
    }
  });
};

export const emitMessageReaction = (
  conversationId,
  messageId,
  reactions,
  participants
) => {
  const io = getIO();
  console.log('😀 Emitting messageReaction to participants:', participants.map(p => p.toString()));

  participants.forEach((participantId) => {
    const socketId = onlineUsers.get(participantId.toString());
    if (socketId) {
      console.log('✅ Sending reaction to socket:', socketId, 'for user:', participantId.toString());
      io.to(socketId).emit('messageReaction', {
        conversationId,
        messageId,
        reactions,
      });
    } else {
      console.log('⚠️ User not online for reaction:', participantId.toString());
    }
  });
};

export const emitMessageDeleted = (conversationId, messageId, participants) => {
  const io = getIO();
  console.log('🗑️ Emitting messageDeleted to participants:', participants.map(p => p.toString()));

  participants.forEach((participantId) => {
    const socketId = onlineUsers.get(participantId.toString());
    if (socketId) {
      console.log('✅ Sending deletion to socket:', socketId, 'for user:', participantId.toString());
      io.to(socketId).emit('messageDeleted', {
        conversationId,
        messageId,
        type: 'deleted',
      });
    } else {
      console.log('⚠️ User not online for deletion:', participantId.toString());
    }
  });
};

export const emitMessagesRead = (conversationId, userId, participants) => {
  const io = getIO();
  console.log('👀 Emitting messagesRead to participants:', participants.map(p => p.toString()));

  participants.forEach((participantId) => {
    const socketId = onlineUsers.get(participantId.toString());
    if (socketId) {
      console.log('✅ Sending read status to socket:', socketId, 'for user:', participantId.toString());
      io.to(socketId).emit('messagesRead', {
        conversationId,
        userId,
      });
    } else {
      console.log('⚠️ User not online for read status:', participantId.toString());
    }
  });
};
