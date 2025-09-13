import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Post from '../models/Post.js';
import mongoose from 'mongoose';
import {
  emitNewMessage,
  emitMessageReaction,
  emitMessageDeleted,
  emitMessagesRead,
} from '../sockets/messageSocket.js';
import { deleteImage } from '../utils/cloudinary.js';

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username fullName avatar type')
      .populate('lastMessageId')
      .sort({ updatedAt: -1 });

    res.json({ status: true, conversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantId, type = 'private' } = req.body;

    if (type === 'private') {
      if (!participantId) {
        return res.status(400).json({
          status: false,
          message: 'Participant ID is required for private conversations',
        });
      }

      const participant = await User.findById(participantId);
      if (!participant) {
        return res
          .status(404)
          .json({ status: false, message: 'User not found' });
      }

      let conversation = await Conversation.findOne({
        type: 'private',
        participants: { $all: [userId, participantId], $size: 2 },
      }).populate('participants', 'username fullName avatar type');

      if (!conversation) {
        conversation = await Conversation.create({
          type: 'private',
          participants: [userId, participantId],
        });
        await conversation.populate(
          'participants',
          'username fullName avatar type'
        );
      }

      res.json({ status: true, conversation });
    } else {
      res.status(400).json({
        status: false,
        message: 'Group conversations not implemented yet',
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getConversationId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const conversation = await Conversation.findOne({
      type: 'private',
      participants: { $all: [userId, otherUserId], $size: 2 },
    });

    if (!conversation) {
      const newConversation = await Conversation.create({
        type: 'private',
        participants: [userId, otherUserId],
      });

      await newConversation.populate(
        'participants',
        'username fullName avatar type'
      );

      return res
        .status(200)
        .json({
          status: true,
          message: 'Conversation created successfully',
          conversationId: newConversation._id,
        });
    }

    res.json({ status: true, conversationId: conversation._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ status: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'username fullName avatar type')
      .populate('replyTo', 'text type senderId')
      .populate('productId', 'name price imageUrl')
      .populate({
        path: 'postId',
        select: 'caption imageUrl user',
        populate: { path: 'user', select: 'username' },
      })
      .populate('profileId', 'username fullName avatar type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ status: true, messages: messages.reverse() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      conversationId,
      text,
      type,
      replyTo,
      productId,
      postId,
      profileId,
      imageUrl,
    } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ status: false, message: 'Conversation not found' });
    }

    if (type === 'text' && !text) {
      return res
        .status(400)
        .json({ status: false, message: 'Text is required for text messages' });
    }
    if (type === 'image' && !imageUrl) {
      return res.status(400).json({
        status: false,
        message: 'Image URL is required for image messages',
      });
    }
    if (type === 'product' && !productId) {
      return res.status(400).json({
        status: false,
        message: 'Product ID is required for product messages',
      });
    }
    if (type === 'post' && !postId) {
      return res.status(400).json({
        status: false,
        message: 'Post ID is required for post messages',
      });
    }
    if (type === 'profile' && !profileId) {
      return res.status(400).json({
        status: false,
        message: 'Profile ID is required for profile messages',
      });
    }
    if (type === 'deleted') {
      return res
        .status(400)
        .json({ status: false, message: 'Cannot send deleted message type' });
    }

    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: 'Product not found' });
      }
    }
    if (postId) {
      const post = await Post.findById(postId);
      if (!post) {
        return res
          .status(404)
          .json({ status: false, message: 'Post not found' });
      }
    }
    if (profileId) {
      const profile = await User.findById(profileId);
      if (!profile) {
        return res
          .status(404)
          .json({ status: false, message: 'Profile not found' });
      }
    }

    if (replyTo) {
      const replyMessage = await Message.findOne({
        _id: replyTo,
        conversationId,
      });
      if (!replyMessage) {
        return res
          .status(404)
          .json({ status: false, message: 'Reply message not found' });
      }
    }

    const message = await Message.create({
      conversationId,
      senderId: userId,
      text,
      type,
      replyTo,
      productId,
      postId,
      profileId,
      imageUrl,
    });

    conversation.lastMessageId = message._id;
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== userId) {
        const currentCount =
          conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(
          participantId.toString(),
          currentCount + 1
        );
      }
    });
    await conversation.save();

    await message.populate('senderId', 'username fullName avatar type');
    if (replyTo) {
      await message.populate('replyTo', 'text type senderId');
    }
    if (productId) {
      await message.populate('productId', 'name price imageUrl');
    }
    if (postId) {
      await message.populate('postId', 'caption imageUrl');
    }
    if (profileId) {
      await message.populate('profileId', 'username fullName avatar');
    }

    await message.save();

    emitNewMessage(conversationId, message, conversation.participants);

    res.json({ status: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ status: false, message: 'Conversation not found' });
    }

    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        status: { $in: ['sent', 'delivered'] },
      },
      { status: 'read' }
    );

    emitMessagesRead(conversationId, userId, conversation.participants);

    res.json({ status: true, message: 'Messages marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const addReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res
        .status(400)
        .json({ status: false, message: 'Emoji is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ status: false, message: 'Message not found' });
    }

    if (message.type === 'deleted') {
      return res
        .status(400)
        .json({ status: false, message: 'Cannot react to deleted messages' });
    }

    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ status: false, message: 'Access denied' });
    }

    const currentReactions = message.reactions.get(emoji) || [];
    const userReactionIndex = currentReactions.indexOf(userId);

    if (userReactionIndex === -1) {
      currentReactions.push(userId);
    } else {
      currentReactions.splice(userReactionIndex, 1);
    }

    if (currentReactions.length === 0) {
      message.reactions.delete(emoji);
    } else {
      message.reactions.set(emoji, currentReactions);
    }

    await message.save();

    emitMessageReaction(
      message.conversationId,
      messageId,
      Object.fromEntries(message.reactions),
      conversation.participants
    );

    res.json({
      status: true,
      reactions: Object.fromEntries(message.reactions),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ status: false, message: 'Message not found' });
    }

    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        status: false,
        message: 'You can only delete your own messages',
      });
    }

    if (message.type === 'deleted') {
      return res
        .status(400)
        .json({ status: false, message: 'Message already deleted' });
    }

    const conversation = await Conversation.findById(message.conversationId);

    message.type = 'deleted';
    message.text = null;
    message.imageUrl = null;
    message.productId = null;
    message.reactions = new Map();
    await message.save();

    if (conversation) {
      emitMessageDeleted(
        message.conversationId,
        messageId,
        conversation.participants
      );
    }

    res.json({ status: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const createGroupConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, participants } = req.body;

    const creator = await User.findById(userId);

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ status: false, message: 'Group name is required' });
    }

    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length < 2
    ) {
      return res.status(400).json({
        status: false,
        message: 'At least 2 participants are required for a group',
      });
    }

    if (participants.length > 9) {
      return res.status(400).json({
        status: false,
        message: 'Group chat is limited to 10 members maximum',
      });
    }

    const validParticipants = await User.find({ _id: { $in: participants } });
    if (validParticipants.length !== participants.length) {
      return res
        .status(400)
        .json({ status: false, message: 'One or more participants not found' });
    }

    const allParticipants = [...new Set([userId, ...participants])];

    if (allParticipants.length > 10) {
      return res.status(400).json({
        status: false,
        message: 'Group chat is limited to 10 members maximum',
      });
    }

    const conversation = new Conversation({
      type: 'group',
      name: name.trim(),
      participants: allParticipants,
      createdBy: userId,
    });

    await conversation.save();

    if (creator) {
      const infoText = `${creator.username} created the group ${name.trim()}`;

      const message = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        text: infoText,
        type: 'info',
      });

      conversation.lastMessageId = message._id;
      await conversation.save();
    }

    await conversation.populate(
      'participants',
      'username fullName avatar type'
    );

    res.json({ status: true, conversation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ status: false, message: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res
        .status(400)
        .json({ status: false, message: 'Can only leave group conversations' });
    }

    if (!conversation.participants.includes(userId)) {
      return res
        .status(403)
        .json({ status: false, message: 'Not a member of this group' });
    }

    conversation.participants = conversation.participants.filter(
      (participantId) => participantId.toString() !== userId
    );

    const leaver = await User.findById(userId);
    let infoText = '';
    if (leaver) {
      infoText = `${leaver.username} left the group`;
    }

    if (conversation.participants.length === 0) {
      const session = await mongoose.startSession();
      await session.withTransaction(async () => {
        await Message.deleteMany({ conversationId: conversationId }).session(
          session
        );

        await Conversation.findByIdAndDelete(conversationId).session(session);
      });
      await session.endSession();

      return res.json({
        status: true,
        message: 'Group and all messages deleted as no members remain',
      });
    }
    await conversation.save();

    if (infoText) {
      const message = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        text: infoText,
        type: 'info',
      });

      conversation.lastMessageId = message._id;
      await conversation.save();
    }

    res.json({ status: true, message: 'Left group successfully' });
  } catch (err) {
    console.error('Error leaving group:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { name } = req.body;
    const file = req.file;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ status: false, message: 'Group name is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ status: false, message: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({
        status: false,
        message: 'Can only update group conversation names',
      });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to update this group',
      });
    }

    if (file) {
      if (conversation.avatar) {
        await deleteImage(conversation.avatarId);
      }

      conversation.avatar = file.path;
      conversation.avatarId = file.filename;
    }

    conversation.name = name.trim();

    const updater = await User.findById(userId);
    if (!updater) {
      return res.status(200).json({ status: false, message: 'User not found' });
    }

    const infoText = `${
      updater.username
    } updated the group's name to '${name.trim()}'`;

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: userId,
      text: infoText,
      type: 'info',
    });

    conversation.lastMessageId = message._id;

    await conversation.save();

    await conversation.populate('lastMessageId');
    await conversation.populate(
      'participants',
      'username fullName avatar type'
    );

    res.json({ status: true, conversation, message });
  } catch (err) {
    console.error('Error updating group name:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const addUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { users } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: 'No users provided' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ status: false, message: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res
        .status(400)
        .json({
          status: false,
          message: 'Can only add users to group conversations',
        });
    }

    if (!conversation.participants.includes(userId)) {
      return res
        .status(403)
        .json({ status: false, message: 'Not authorized to add users' });
    }

    const newUsers = users.filter(
      (u) => !conversation.participants.includes(u)
    );
    conversation.participants.push(...newUsers);

    const adder = await User.findById(userId);
    const addedUsers = await User.find({ _id: { $in: newUsers } });

    if (adder && addedUsers.length > 0) {
      const names = addedUsers.map((u) => u.username).join(', ');
      const infoText = `${adder.username} added ${names} to the group`;

      const message = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        text: infoText,
        type: 'info',
      });

      conversation.lastMessageId = message._id;
    }

    await conversation.save();
    await conversation.populate(
      'participants',
      'username fullName avatar type'
    );

    res.json({ status: true, conversation });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
