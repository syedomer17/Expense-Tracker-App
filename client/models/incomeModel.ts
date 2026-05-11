import mongoose, { Schema, type Model, type HydratedDocument } from "mongoose";

export type PaymentMethod = "upi" | "cash" | "both";

export interface IIncome {
    description: string;
    amount: number;
    category: string;
    date: Date;
    userId: mongoose.Types.ObjectId;
    type: "income";
    paymentMethod?: PaymentMethod;
    upiAmount?: number;
    cashAmount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export type IncomeDocument = HydratedDocument<IIncome>;

const incomeSchema = new Schema<IIncome>(
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
            enum: ["income"],
            default: "income",
            immutable: true,
        },
        paymentMethod: {
            type: String,
            enum: ["upi", "cash", "both"],
            required: false,
        },
        upiAmount: {
            type: Number,
            min: 0,
            required: false,
        },
        cashAmount: {
            type: Number,
            min: 0,
            required: false,
        },
    },
    { timestamps: true }
);

incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, category: 1, date: -1 });

const Income: Model<IIncome> =
    (mongoose.models.Income as Model<IIncome>) ??
    mongoose.model<IIncome>("Income", incomeSchema);

export default Income;
