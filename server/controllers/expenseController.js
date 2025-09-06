import User from "../models/User.js";
import Expense from "../models/Expenses.js"
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";

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

// Download Expense sources as PDF
export const downloadExpensePdf = async (req, res) => {
  const userId = req.user.id;

  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=expense_details.pdf"
    );

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    // Title
    doc
      .fontSize(18)
      .fillColor("#111111")
      .text("Expense Details", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("#555555")
      .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" })
      .moveDown(1);

    // Table headers
    const headers = ["Category", "Amount", "Date"];
    const columnWidths = [220, 100, 150];
    const startX = doc.page.margins.left;
    let y = doc.y;

    doc.fontSize(11).fillColor("#000000").font("Helvetica-Bold");
    headers.forEach((h, i) => {
      doc.text(h, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
        width: columnWidths[i],
        align: i === 0 ? "left" : "left",
      });
    });
    y += 18;
    doc.moveTo(startX, y - 6).lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y - 6).stroke("#cccccc");

    // Rows
    doc.font("Helvetica").fontSize(10).fillColor("#222222");
    expenses.forEach((item) => {
      const row = [
        item.category || "-",
        `$${Number(item.amount || 0).toLocaleString()}`,
        new Date(item.date).toLocaleDateString(),
      ];
      const rowHeight = 16;
      // Page break check
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.y;
      }

      row.forEach((value, i) => {
        doc.text(value, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
          width: columnWidths[i],
          align: i === 0 ? "left" : "left",
        });
      });
      y += rowHeight;
    });

    doc.end();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};