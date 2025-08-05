import http from 'http'; 
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
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
import { initSocket } from './sockets/socketSetup.js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
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

const server = http.createServer(app);
const io = initSocket(server);

server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));