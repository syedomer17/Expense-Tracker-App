import express from 'express';
import {
    addExpense,
    getAllExpense,
    deleteExpense,
    downloadExpenseExcel,
    downloadExpensePdf,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes after this middleware

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.get("/downloadexcel", protect, downloadExpenseExcel); // legacy
router.get("/downloadpdf", protect, downloadExpensePdf);
router.delete("/:id", protect, deleteExpense);

export default router;

