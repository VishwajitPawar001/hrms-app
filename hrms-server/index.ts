import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { log } from 'console';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.get('api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'HRMS Backend Running Locally.' });
})

app.listen(PORT, ()=> {
    console.log(`Server booting up at http://localhost:${PORT}`);
})
