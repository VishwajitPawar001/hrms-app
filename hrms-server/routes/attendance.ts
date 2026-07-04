import { Router } from 'express';
import { Attendance, type IAttendance } from '../models/Attendance.js';
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware.js';

const router = Router();

// Check-in Endpoint
router.post('/checkin', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const { employeeId } = req.user!;
        const today = new Date().toISOString().split('T')[0];

        // Cast the query object explicitly to bypass strict Mongoose schema typing checks
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

// Check-out Endpoint 
router.post('/checkout', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const { employeeId } = req.user!;
        const today = new Date().toISOString().split('T')[0];

        // Cast the query to any, and cast the output document to IAttendance
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

// Get personal attendance logs timeline history
router.get('/my-history', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const { employeeId } = req.user!;
        
        // Fetch all attendance milestones sorted by newest date first
        const history = await Attendance.find({ employeeId } as any).sort({ date: -1 });
        return res.status(200).json({ history });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error fetching historical shift logs." });
    }
});

// Get master attendance logs for administration tracking
router.get('/admin/today', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const { role } = req.user!;
        
        // Authorization boundary check
        if (role !== 'HR') {
            return res.status(403).json({ error: "Access denied. Administrative authority required." });
        }

        // Fetch all logs across the team
        const attendance = await Attendance.find({}).sort({ date: -1 });
        return res.status(200).json({ attendance });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error fetching management dashboard logs." });
    }
});

export default router;