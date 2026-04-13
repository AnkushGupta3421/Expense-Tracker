import express from 'express';
import { getSummary, getTrend, getInsights, generateReport } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all analytics routes

router.get('/summary', getSummary);
router.get('/trend', getTrend);
router.get('/insights', getInsights);
router.get('/report', generateReport);

export default router;
