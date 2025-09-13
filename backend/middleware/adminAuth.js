import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'Access denied. User not found.',
      });
    }

    if (user.type !== 'admin') {
      return res.status(403).json({
        status: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(401).json({
      status: false,
      message: 'Access denied. Invalid token.',
    });
  }
};

export const verifyAdminOrOwner = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'Access denied. User not found.',
      });
    }

    const isAdmin = user.type === 'admin';
    const isOwner = req.params.userId === user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        status: false,
        message: 'Access denied. Insufficient privileges.',
      });
    }

    req.user = user;
    req.isAdmin = isAdmin;
    next();
  } catch (error) {
    console.error('Admin/Owner verification error:', error);
    return res.status(401).json({
      status: false,
      message: 'Access denied. Invalid token.',
    });
  }
};

export const adminAuth = verifyAdmin;
