import Conversation from '../models/Conversation.js';
import { cloudinary } from '../utils/cloudinary.js';

export const uploadGroupPhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    if (!req.file) {
      return res
        .status(400)
        .json({ status: false, message: 'No file uploaded' });
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
          message: 'Can only update group photo for group conversations',
        });
    }
    if (!conversation.participants.includes(userId)) {
      return res
        .status(403)
        .json({
          status: false,
          message: 'Not authorized to update this group',
        });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'group_avatars',
      width: 256,
      height: 256,
      crop: 'fill',
      gravity: 'face',
      format: 'jpg',
      quality: 'auto',
    });
    conversation.avatar = result.secure_url;
    conversation.avatarId = result.public_id;
    await conversation.save();
    await conversation.populate(
      'participants',
      'username fullName avatar type'
    );
    res.json({
      status: true,
      avatar: result.secure_url,
      avatarId: result.public_id,
      conversation,
    });
  } catch (err) {
    console.error('Error uploading group photo:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
