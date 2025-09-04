import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  console.log('Verify Token middleware hit');
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ status: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ status: false, message: 'User not found' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({
        status: false,
        message: 'Account is banned',
        details: `Your account has been permanently banned. Reason: ${
          user.banReason || 'Violation of community guidelines'
        }.`,
      });
    }

    if (user.status === 'suspended') {
      const isStillSuspended =
        user.suspendedUntil && new Date() < new Date(user.suspendedUntil);

      if (isStillSuspended) {
        const suspendedUntilDate = new Date(
          user.suspendedUntil
        ).toLocaleDateString();
        return res.status(403).json({
          status: false,
          message: 'Account is suspended',
          details: `Your account is suspended until ${suspendedUntilDate}. Reason: ${
            user.suspensionReason || 'Violation of community guidelines'
          }.`,
        });
      } else {
        user.status = 'active';
        user.suspendedUntil = null;
        user.suspensionReason = null;
        await user.save();
      }
    }

    req.user = decoded;
    req.userDetails = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);

    if (err.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({
          status: false,
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
    } else if (err.name === 'JsonWebTokenError') {
      return res
        .status(401)
        .json({
          status: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
    } else {
      return res
        .status(401)
        .json({
          status: false,
          message: 'Token verification failed',
          code: 'TOKEN_VERIFICATION_FAILED'
        });
    }
  }
};

export const protect = verifyToken;
