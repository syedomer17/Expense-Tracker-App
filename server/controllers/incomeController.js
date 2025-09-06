import User from "../models/User.js";
import Income from "../models/Income.js";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";

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

// Download Income sources as PDF
export const downloadIncomePdf = async (req, res) => {
  const userId = req.user.id;

  try {
    const incomes = await Income.find({ userId }).sort({ date: -1 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=income_details.pdf"
    );

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    doc
      .fontSize(18)
      .fillColor("#111111")
      .text("Income Details", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("#555555")
      .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" })
      .moveDown(1);

    const headers = ["Source", "Amount", "Date"];
    const columnWidths = [220, 100, 150];
    const startX = doc.page.margins.left;
    let y = doc.y;

    doc.fontSize(11).fillColor("#000000").font("Helvetica-Bold");
    headers.forEach((h, i) => {
      doc.text(h, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
        width: columnWidths[i],
        align: "left",
      });
    });
    y += 18;
    doc.moveTo(startX, y - 6).lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y - 6).stroke("#cccccc");

    doc.font("Helvetica").fontSize(10).fillColor("#222222");
    incomes.forEach((item) => {
      const row = [
        item.source || "-",
        `$${Number(item.amount || 0).toLocaleString()}`,
        new Date(item.date).toLocaleDateString(),
      ];
      const rowHeight = 16;
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.y;
      }
      row.forEach((value, i) => {
        doc.text(value, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
          width: columnWidths[i],
          align: "left",
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