import { Router } from 'express';
import { Payroll } from '../models/Payroll.js';
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/my-salary', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { employeeId } = req.user!;
    let payroll = await Payroll.findOne({ employeeId } as any);
    
    if (!payroll) {
      payroll = new Payroll({
        employeeId,
        wage: 50000,
        basic: 0,
        hra: 0,
        standardAllowance: 4167,
        performanceBonus: 0,
        lta: 0,
        fixedAllowance: 0,
        deductions: 0,
        netSalary: 0
      });
      await payroll.save();
    }
    
    return res.status(200).json({ payroll });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error fetching personal payroll.' });
  }
});

router.get('/admin/all', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    if (req.user!.role !== 'HR') {
      return res.status(403).json({ error: 'Access denied. HR privileges required.' });
    }
    const payrolls = await Payroll.find({});
    return res.status(200).json({ payrolls });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error fetching payroll master logs.' });
  }
});

router.put('/admin/update/:employeeId', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    if (req.user!.role !== 'HR') {
      return res.status(403).json({ error: 'Access denied. HR privileges required.' });
    }
    const { employeeId } = req.params;
    const { wage } = req.body;

    if (wage === undefined || typeof wage !== 'number' || wage < 0) {
      return res.status(400).json({ error: 'Invalid wage input parameter.' });
    }

    let payroll = await Payroll.findOne({ employeeId } as any);
    if (!payroll) {
      payroll = new Payroll({
        employeeId: employeeId as string,
        wage,
        basic: 0,
        hra: 0,
        standardAllowance: 4167,
        performanceBonus: 0,
        lta: 0,
        fixedAllowance: 0,
        deductions: 0,
        netSalary: 0
      });
    } else {
      payroll.wage = wage;
    }

    await payroll.save();
    return res.status(200).json({ message: 'Payroll details updated successfully!', payroll });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error updating employee payroll.' });
  }
});

export default router;
