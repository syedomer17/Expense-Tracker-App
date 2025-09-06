import express from 'express';
import {
    addIncome,
    getAllIncome,
    deleteIncome,
    downloadIncomeExcel,
    downloadIncomePdf,
} from '../controllers/incomeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes after this middleware

router.post("/add", protect, addIncome);
router.get("/get", protect, getAllIncome);
router.get("/downloadexcel", protect, downloadIncomeExcel); // legacy
router.get("/downloadpdf", protect, downloadIncomePdf);
router.delete("/:id", protect, deleteIncome);

export default router;

