import User from "../models/User.js";
import Income from "../models/Income.js";
import * as XLSX from "xlsx";

// Add Income source
export const addIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, source, amount, date } = req.body;

    //validation Check for missing fileds
    if (!source || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newIncome = new Income({
      userId,
      icon,
      source,
      amount,
      date,
    });

    await newIncome.save();
    res.status(200).json(newIncome);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get All Income sources
export const getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const incomes = await Income.find({ userId }).sort({date: -1});
        res.status(200).json(incomes);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
// Delete Income source
export const deleteIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        await Income.findOneAndDelete(req.params.id);
        res.status(200).json({ message: "Income source deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Download Income sources as Excel
export const downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const income = await Income.find({ userId }).sort({ date: -1 });

    // Prepare data for Excel
    const data = income.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: item.date,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Income");

    const filePath = "income_details.xlsx";
    XLSX.writeFile(wb, filePath);

    res.download(filePath);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};