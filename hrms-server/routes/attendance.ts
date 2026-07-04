import { Router } from 'express';
import { Attendance, type IAttendance } from '../models/Attendance.js';
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/checkin', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const { employeeId } = req.user!;
        const today = new Date().toISOString().split('T')[0];

        const existingRecord = await Attendance.findOne({ employeeId, date: today } as any);
        if (existingRecord) {
            return res.status(400).json({ error: "You have already checked in for today." });
        }

        const newAttendance = new Attendance({
            employeeId,
            date: today,
            checkInTime: new Date(),
            status: 'Present'
        });

        await newAttendance.save();
        return res.status(201).json({ message: "Checked in successfully!", attendance: newAttendance });

    } catch (error) {
        return res.status(500).json({ error: "Internal server error during check-in." });
    }
});

router.post('/checkout', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const { employeeId } = req.user!;
        const today = new Date().toISOString().split('T')[0];

        const record = await Attendance.findOne({ employeeId, date: today } as any) as IAttendance | null;
        
        if (!record) {
            return res.status(404).json({ error: "No check-in record found for today." });
        }

        if (record.checkOutTime) {
            return res.status(400).json({ error: "You have already checked out for today." });
        }

        record.checkOutTime = new Date();
        await record.save();

        return res.status(200).json({ message: "Check out successfully!", attendance: record });

    } catch (error) {
        return res.status(500).json({ error: "Internal server error during check-out." });
    }
});

router.get('/my-history', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const { employeeId } = req.user!;
        const history = await Attendance.find({ employeeId } as any).sort({ date: -1 });
        return res.status(200).json({ history });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error fetching historical shift logs." });
    }
});

router.get('/admin/today', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const { role } = req.user!;
        
        if (role !== 'HR') {
            return res.status(403).json({ error: "Access denied. Administrative authority required." });
        }

        const attendance = await Attendance.find({}).sort({ date: -1 });
        return res.status(200).json({ attendance });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error fetching management dashboard logs." });
    }
});

router.get('/today-status', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const { employeeId } = req.user!;
        const latestRecord = await Attendance.findOne({ employeeId } as any).sort({ date: -1 });

        if (!latestRecord) {
            return res.status(200).json({ isCheckedIn: false, isShiftCompleted: false });
        }

        const todayStr = new Date().toISOString().split('T')[0];
        
        if (latestRecord.date === todayStr) {
            if (latestRecord.checkOutTime) {
                return res.status(200).json({ isCheckedIn: false, isShiftCompleted: true });
            }
            return res.status(200).json({ isCheckedIn: true, isShiftCompleted: false });
        }

        return res.status(200).json({ isCheckedIn: false, isShiftCompleted: false });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error syncing shift session state." });
    }
});

export default router;