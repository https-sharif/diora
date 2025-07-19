import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const signup = async (req, res) => {
  console.log('Signup route/controller hit');
  const { email, username, fullName, password } = req.body;

  if (!email || !username || !fullName || !password)
    return res
      .status(400)
      .json({ status: false, message: 'All fields required' });

  try {
    const emailLower = email.trim().toLowerCase();
    const usernameLower = username.trim().toLowerCase();

    const existingUser = await User.findOne({ email: emailLower });
    const existingUsername = await User.findOne({ username: usernameLower });

    if (existingUsername)
      return res
        .status(400)
        .json({ status: false, message: 'Username already taken' });

    if (existingUser)
      return res
        .status(400)
        .json({ status: false, message: 'Email already used' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      email: emailLower,
      username: usernameLower,
      fullName,
      password: hashedPassword,
      followers: [],
      following: [],
      posts: 0,
      likedPosts: [],
      type: 'user',
      isVerified: false,
      avatar: '',
      avatarId: '',
      bio: '',
      settings: {
        theme: 'light',
        notifications: {
          likes: true,
          comments: true,
          follow: true,
          mention: true,
          order: true,
          promotion: true,
          system: true,
          warning: true,
          messages: true,
          reportUpdate: true,
          emailFrequency: 'instant',
        },
      },

    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    const safeUser = {
      _id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      fullName: newUser.fullName,
      avatar: newUser.avatar,
      bio: newUser.bio,
      isVerified: newUser.isVerified,
      followers: newUser.followers,
      following: newUser.following,
      posts: newUser.posts,
      likedPosts: newUser.likedPosts,
      type: newUser.type,
      createdAt: newUser.createdAt,
      settings: newUser.settings,
      avatarId: newUser.avatarId,
    };

    res.status(201).json({ status: true, user: safeUser, token });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

export const login = async (req, res) => {
  console.log('Login route/controller hit');
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ status: false, message: 'Email/username and password required' });

  try {
    const usernameLower = username.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: usernameLower }, { username: usernameLower }],
    });

    if(!user) {
      return res.status(400).json({ status: false, message: 'User not found' });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ status: false, message: 'Password didnt match' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    const safeUser = {
      _id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      bio: user.bio,
      isVerified: user.isVerified,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
      likedPosts: user.likedPosts,
      type: user.type,
      createdAt: user.createdAt,
      settings: user.settings,
      avatarId: user.avatarId,
    };

    res.json({
      status: true,
      user: safeUser,
      token,
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
};
