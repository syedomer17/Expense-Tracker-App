import mongoose, { Schema, type Model, type HydratedDocument } from "mongoose";

export interface IExpense {
    description: string;
    amount: number;
    category: string;
    date: Date;
    userId: mongoose.Types.ObjectId;
    type: "expense";
    createdAt: Date;
    updatedAt: Date;
}

export type ExpenseDocument = HydratedDocument<IExpense>;

const expenseSchema = new Schema<IExpense>(
    {
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        date: {
            type: Date,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["expense"],
            default: "expense",
            immutable: true,
        },
    },
    { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });

const Expense: Model<IExpense> =
    (mongoose.models.Expense as Model<IExpense>) ??
    mongoose.model<IExpense>("Expense", expenseSchema);

export default Expense;
