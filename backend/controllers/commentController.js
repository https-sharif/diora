import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getIO, onlineUsers } from '../sockets/socketSetup.js';

export const createComment = async (req, res) => {
  console.log('Create comment route/controller hit');

  const { userId, postId, text } = req.body;

  if (!userId || !postId || !text) {
    return res.status(400).json({
      status: false,
      message: 'userId, postId, and text are required',
    });
  }

  try {
    const comment = new Comment({ user: userId, postId, text });

    const post = await Post.findById(postId).populate('user', 'username _id');
    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

    const user = await User.findById(userId);

    post.comments.push(comment._id);
    await post.save();

    await comment.save();
    await comment.populate('user', 'username avatar');

    if (userId !== post.user._id.toString()) {
      const existingNotification = await Notification.findOne({
        type: 'comment',
        postId,
        userId: post.user._id,
      });

      if (existingNotification) {
        if (!existingNotification.fromUserIds)
          existingNotification.fromUserIds = [];

        if (
          !existingNotification.fromUserIds.some(
            (id) => id.toString() === userId
          )
        ) {
          existingNotification.fromUserIds.push(userId);
        }

        const users = await User.find(
          { _id: { $in: existingNotification.fromUserIds } },
          'username'
        );
        const usernames = users.map((u) => u.username).filter((name) => name);

        if (usernames.length === 0) {
          usernames.push(user.username);
        }

        const currentUsernameIndex = usernames.indexOf(user.username);
        if (currentUsernameIndex > -1) {
          usernames.splice(currentUsernameIndex, 1);
        }
        usernames.unshift(user.username);

        let message = '';
        if (usernames.length === 1) {
          message = `${usernames[0]} commented on your post`;
        } else if (usernames.length === 2) {
          message = `${usernames[0]} and ${usernames[1]} commented on your post`;
        } else {
          message = `${usernames[0]}, ${usernames[1]} and ${
            usernames.length - 2
          } others commented on your post`;
        }

        existingNotification.message = message;
        existingNotification.title = 'New Comment';
        existingNotification.updatedAt = new Date();
        existingNotification.read = false;

        await existingNotification.save();
        await existingNotification.populate('userId', 'username avatar');

        const io = getIO();
        const targetSocketId = onlineUsers.get(post.user._id.toString());
        if (targetSocketId) {
          io.to(targetSocketId).emit('notification', existingNotification);
        }
      } else {
        const notification = new Notification({
          type: 'comment',
          userId: post.user._id,
          fromUserId: userId,
          fromUserIds: [userId],
          title: 'New Comment',
          postId,
          message: `${user.username} commented on your post`,
          actionUrl: `/post/${postId}`,
          imageUrl: post.imageUrl,
        });

        await notification.save();
        await notification.populate('userId', 'username avatar');

        const io = getIO();
        const targetSocketId = onlineUsers.get(post.user._id.toString());
        if (targetSocketId) {
          io.to(targetSocketId).emit('notification', notification);
        }
      }
    }

    res.status(201).json({ status: true, comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res
      .status(500)
      .json({ status: false, message: 'Error creating comment', error });
  }
};

export const createReply = async (req, res) => {
  console.log('Create reply route/controller hit');

  const commentId = req.params.commentId;
  const { userId, text, postId } = req.body;

  try {
    const parentComment = await Comment.findById(commentId);
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!parentComment) {
      return res
        .status(404)
        .json({ status: false, message: 'Parent comment not found' });
    }

    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

    const newReply = new Comment({ 
      user: userId, 
      text, 
      postId: postId 
    });
    await newReply.save();
    await newReply.populate('user', 'username avatar');

    post.comments.push(newReply._id);
    await post.save();

    parentComment.replies.push(newReply._id);
    await parentComment.save();

    if (userId !== parentComment.user.toString()) {
      const notification = new Notification({
        type: 'comment',
        userId: parentComment.user,
        fromUserId: userId,
        title: 'New Reply',
        postId: postId,
        message: `${user.username} replied to your comment`,
        actionUrl: `/post/${postId}`,
      });

      await notification.save();

      const io = getIO();
      const targetSocketId = onlineUsers.get(parentComment.user.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', notification);
      }
    }

    return res.status(201).json({ status: true, comment: newReply });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error creating reply', error });
  }
};

export const getComments = async (req, res) => {
  console.log('Get comments route/controller hit');
  const { postId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const comments = await Comment.find({ postId })
      .populate('user', 'username avatar isVerified type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: 'replies',
        populate: {
          path: 'user',
          select: 'username avatar',
        },
      });

    const totalComments = await Comment.countDocuments({ postId });
    const totalPages = Math.ceil(totalComments / limitNum);

    if (!comments || comments.length === 0) {
      return res.status(200).json({
        status: true,
        message: 'No comments found',
        comments: [],
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalComments,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      });
    }

    res.json({
      status: true,
      comments,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalComments,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error fetching comments', error });
  }
};

export const deleteComment = async (req, res) => {
  console.log('Delete comment route/controller hit');
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        status: false,
        message: 'Comment not found'
      });
    }

    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to delete this comment'
      });
    }

    if (comment.postId) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    } else {
      await Comment.updateMany(
        { replies: commentId },
        { $pull: { replies: commentId } }
      );
    }

    await Comment.findByIdAndDelete(commentId);

    if (comment.postId) {
      const post = await Post.findById(comment.postId);
      if (post) {
        post.comments.pull(commentId);
        await post.save();
      }
    }

    res.json({
      status: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      status: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

export const updateComment = async (req, res) => {
  console.log('Update comment route/controller hit');

  const { commentId } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      status: false,
      message: 'Comment text is required',
    });
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        status: false,
        message: 'Comment not found',
      });
    }

    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        status: false,
        message: 'You can only edit your own comments',
      });
    }

    comment.text = text.trim();
    comment.updatedAt = new Date();
    await comment.save();
    await comment.populate('user', 'username avatar');

    res.status(200).json({
      status: true,
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      status: false,
      message: 'Error updating comment',
      error: error.message
    });
  }
};

export const reportComment = async (req, res) => {
  console.log('Report comment route/controller hit');

  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        status: false,
        message: 'Comment not found',
      });
    }

    // Check if user already reported this comment
    const existingReport = await Report.findOne({
      type: 'comment',
      reportedItemId: commentId,
      reportedBy: userId,
    });

    if (existingReport) {
      return res.status(400).json({
        status: false,
        message: 'You have already reported this comment',
      });
    }

    // Create a new report
    const report = new Report({
      type: 'comment',
      reportedItemId: commentId,
      reportedBy: userId,
      reason: 'Reported by user', // Could be expanded to include specific reasons
    });

    await report.save();

    res.status(200).json({
      status: true,
      message: 'Comment reported successfully',
    });
  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({
      status: false,
      message: 'Error reporting comment',
      error: error.message
    });
  }
};
