import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import socialRoutes from './routes/social.js';
import postRoutes from './routes/post.js';

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
app.use('/api/social', socialRoutes);
app.use('/api/post', postRoutes);

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));