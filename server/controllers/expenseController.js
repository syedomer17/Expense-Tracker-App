import User from "../models/User.js";
import Expense from "../models/Expenses.js"
import * as XLSX from "xlsx";

// Add Expense
export const addExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, category, amount, date } = req.body;

    //validation Check for missing fileds
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date,
    });

    await newExpense.save();
    res.status(200).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
// Get All Expense sources
export const getAllExpense = async (req, res) => {
    const userId = req.user.id;

    try {
        const expenses = await Expense.find({ userId }).sort({date: -1});
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
// Delete Expense source
export const deleteExpense = async (req, res) => {
    const userId = req.user.id;

    try {
        await Expense.findOneAndDelete(req.params.id);
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Download Expense sources as Excel
export const downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    // Prepare data for Excel
    const data = expense.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: item.date,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Expense");

    const filePath = "expense_details.xlsx";
    XLSX.writeFile(wb, filePath);

    res.download(filePath);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};