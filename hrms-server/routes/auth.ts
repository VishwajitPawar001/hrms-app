import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = Router();

router.post('/signup', async (req: any, res: any) => {
  try {
    const { employeeId, name, email, password, role, phone, address } = req.body;

    if (!employeeId || !name || !email || !password || !role || !phone || !address) {
      return res.status(400).json({ error: 'All fields are mandatory.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] } as any);
    if (existingUser) {
      return res.status(400).json({ error: 'Employee ID or Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      employeeId,
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address
    });

    await newUser.save();
    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server registration error.' });
  }
});

router.post('/signin', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email } as any);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password credentials.' });
    }

    const secretKey = process.env.JWT_SECRET || 'fallback_secret_key';

    const token = jwt.sign(
      { userId: user._id, role: user.role, employeeId: user.employeeId },
      secretKey,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      user: { id: user._id, employeeId: user.employeeId, name: user.name, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal login error.' });
  }
});

export default router;