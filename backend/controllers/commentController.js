import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export const createComment = async (req, res) => {
  console.log('Create comment route/controller hit');

  console.log('Creating comment for target ID:', req.body.targetId);
  console.log('Request body:', req.body);

  const { userId, targetId, text } = req.body;

  try {
    const comment = new Comment({
      user: userId,
      targetId,
      text,
    });

    const post = await Post.findById(targetId);
    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }
    post.comments += 1;
    await post.save();

    await comment.save();
    await comment.populate('user', 'username avatar');

    res.status(201).json({ status: true, comment });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error creating comment', error });
  }
};

export const createReply = async (req, res) => {
  console.log('Create reply route/controller hit');

  console.log('Replying to comment ID:', req.params.commentId);
  console.log('Request body:', req.body);
  const commentId = req.params.commentId;
  const { userId, text, targetId } = req.body;

  try {
    const parentComment = await Comment.findById(commentId);
    const post = await Post.findById(targetId);


    if (!parentComment) {
      return res
        .status(404)
        .json({ status: false, message: 'Parent comment not found' });
    }

    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }
    console.log('Post comment found:', post);

    post.comments += 1;
    await post.save();

    const newReply = new Comment({ user: userId, text });
    await newReply.save();
    await newReply.populate('user', 'username avatar');

    parentComment.replies.push(newReply._id);
    await parentComment.save();

    return res.status(201).json({ status: true, comment: newReply });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error creating reply', error });
  }
};

export const getComments = async (req, res) => {
  console.log('Get comments route/controller hit');
  const { targetId } = req.params;

  try {
    const comments = await Comment.find({ targetId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'username avatar' },
      });

    if (!comments || comments.length === 0) {
      return res.status(200).json({ status: true, message: 'No comments found', comments: [] });
    }

    res.json({ status: true, comments });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error fetching comments', error });
  }
};
