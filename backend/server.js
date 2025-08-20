import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import postRoutes from './routes/post.js';
import commentRoutes from './routes/comment.js';
import notificationRoutes from './routes/notification.js';
import productRoutes from './routes/product.js';
import shopRoutes from './routes/shop.js';
import reviewRoutes from './routes/review.js';
import searchRoutes from './routes/search.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import orderRoutes from './routes/order.js';
import reportRoutes from './routes/report.js';
import messageRoutes from './routes/message.js';
import uploadRoutes from './routes/upload.js';
import stripeRoutes from './routes/stripe.js';
import webhookRoutes from './routes/webhook.js';
import { initSocket } from './sockets/socketSetup.js';
import { autoCleanupReports } from './controllers/reportController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, try again later',
});

app.use('/api/stripe/webhook', webhookRoutes);
app.use(limiter);

app.use(helmet());
app.use(
  mongoSanitize({
    replaceWith: '_',
    ignoreKeys: ['query'],
  })
);
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/product', productRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stripe', stripeRoutes);

const server = http.createServer(app);
const io = initSocket(server);

autoCleanupReports();
setInterval(autoCleanupReports, 24 * 60 * 60 * 1000);

server.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
);
