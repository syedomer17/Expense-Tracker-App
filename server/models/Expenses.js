import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    icon: { type: String },
    category: { type: String },
    amount: { type: Number },
    date: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", ExpenseSchema);