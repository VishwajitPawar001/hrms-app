import { Router } from 'express';
import { User } from '../models/User.js';
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    if (req.user!.role !== 'HR') {
      return res.status(403).json({ error: 'Access denied. HR privileges required.' });
    }
    const users = await User.find({}, '-password');
    return res.status(200).json({ profiles: users });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error fetching profiles.' });
  }
});

const findUserByIdOrEmpId = async (id: string): Promise<any> => {
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
  let user: any = null;
  if (isMongoId) {
    user = await User.findById(id);
  }
  if (!user) {
    user = await User.findOne({ employeeId: id } as any);
  }
  return user;
};

router.get('/:id', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    const targetId = (id === 'me' ? currentUserId : id) as string;

    if (!targetId) {
      return res.status(400).json({ error: 'Missing target profile identifier.' });
    }

    const user = await findUserByIdOrEmpId(targetId);
    if (!user) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    if (currentUserRole !== 'HR' && user._id.toString() !== currentUserId) {
      return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
    }

    const profileObj = user.toObject();
    delete profileObj.password;

    return res.status(200).json({ profile: profileObj });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error fetching profile.' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    const targetId = (id === 'me' ? currentUserId : id) as string;

    if (!targetId) {
      return res.status(400).json({ error: 'Missing target profile identifier.' });
    }

    const user = await findUserByIdOrEmpId(targetId);
    if (!user) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    if (currentUserRole !== 'HR' && user._id.toString() !== currentUserId) {
      return res.status(403).json({ error: 'Access denied. You can only update your own profile.' });
    }

    const { name, phone, address, panNo, uanNo, role } = req.body;

    if (currentUserRole === 'HR') {
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (panNo !== undefined) user.panNo = panNo;
      if (uanNo !== undefined) user.uanNo = uanNo;
      if (role !== undefined) user.role = role;
    } else {
      if (name !== undefined || panNo !== undefined || uanNo !== undefined || role !== undefined) {
        return res.status(403).json({ error: 'Access denied. Employees can only update phone and address.' });
      }
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
    }

    await user.save();
    
    const profileObj = user.toObject();
    delete profileObj.password;

    return res.status(200).json({ message: 'Profile updated successfully!', profile: profileObj });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error updating profile.' });
  }
});

export default router;
