import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/Attendance.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Core Database Boot up
connectDB();

// 2. Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

// 3. Health Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'HRMS Backend Running Locally.' });
});

app.get('/', (req, res) => {
  res.send('HRMS Server Engine Running Locally.');
});

// 4. Stay Alive Listener
app.listen(PORT, () => {
  console.log(`Server booting up at http://localhost:${PORT}`);
});