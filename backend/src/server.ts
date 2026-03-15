import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import testRoutes from './routes/testRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import courseRoutes from './routes/courseRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/tests', testRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Smart Evaluation System API is running on Firebase.' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
