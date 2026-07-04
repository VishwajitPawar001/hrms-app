import { Router } from 'express';
import { Leave, type ILeave } from '../models/Leave.js';
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/apply', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const { employeeId } = req.user!;
        const { leaveType, startDate, endDate, reason } = req.body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ error: "All application fields are mandatory." });
        }

        const newLeave = new Leave({
            employeeId,
            leaveType,
            startDate,
            endDate,
            reason,
            status: 'Pending'
        });

        await newLeave.save();
        return res.status(201).json({ message: "Leave application submitted successfully!", leave: newLeave });

    } catch (error) {
        return res.status(500).json({ error: "Internal server error while applying for leave." });
    }
});

router.get('/my-leaves', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const { employeeId } = req.user!;
        const leaves = await Leave.find({ employeeId } as any);
        return res.status(200).json({ leaves });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error fetching leave history." });
    }
});

router.get('/admin/all', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        if (req.user!.role !== 'HR') {
            return res.status(403).json({ error: "Access denied. HR privileges required." });
        }

        const allLeaves = await Leave.find({});
        return res.status(200).json({ leaves: allLeaves });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error fetching management dashboard leaves." });
    }
});

router.patch('/admin/action/:id', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        if (req.user!.role !== 'HR') {
            return res.status(403).json({ error: "Access denied. HR privileges required." });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: "Invalid application action status requested." });
        }

        const record = await Leave.findById(id) as ILeave | null;
        if (!record) {
            return res.status(404).json({ error: "Leave application record not found." });
        }

        record.status = status;
        await record.save();

        return res.status(200).json({ message: `Leave application status updated to ${status}!`, leave: record });

    } catch (error) {
        return res.status(500).json({ error: "Internal server error updating application action status." });
    }
});

export default router;