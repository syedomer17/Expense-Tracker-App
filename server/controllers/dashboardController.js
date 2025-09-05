import Income from "../models/Income.js";
import Expenses from "../models/Expenses.js";
import { isValidObjectId, Types } from "mongoose";

//Dashbord data
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new Types.ObjectId(userId);

    //Fetch total income & expense
    const totalIncome = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // console.log("totalIncome", {
    //   totalIncome,
    //   userId: isValidObjectId(userId),
    // });

    const totalExpense = await Expenses.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // console.log("totalExpense", {
    //   totalExpense,
    //   userId: isValidObjectId(userId),
    // });

    // get income transation in last 60 days
    // last 60 days (60 days * 24 hours * 60 minutes * 60 seconds * 1000 ms)
    const last60DaysIncomeTransation = await Income.find({
      userId,
      date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });

    //get total income for last 60 days
    const incomeLast60Days = last60DaysIncomeTransation.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    //get expense transection in the last 30 days
    // last 30 days (30 days * 24 hours * 60 minutes * 60 seconds * 1000 ms)
    const last30DaysExpenseTransation = await Expenses.find({
      userId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });

    //get total expense for last 30 days
    const expenseLast30Days = last30DaysExpenseTransation.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    //fetch last 5 transection (income + expense)
    const lastTransactions = [
      ...(await Income.find({ userId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({ ...txn.toObject(), type: "income" })
      ),
      ...(await Expenses.find({ userId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({ ...txn.toObject(), type: "expense" })
      ),
    ].sort((a,b) => b.date - a.date); // sort latest first

    //final resposne
    res.json({
        totalBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
        totalIncome: totalIncome[0]?.total || 0,
        totalExpense: totalExpense[0]?.total || 0,
        last30DaysExpenses: {
            total: expenseLast30Days,
            transactions: last30DaysExpenseTransation,
        },
        last60DaysIncome: {
            total: incomeLast60Days,
            transactions: last60DaysIncomeTransation,
        },
        recentTransactions: lastTransactions,
    })
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
