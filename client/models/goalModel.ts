import mongoose, { Schema, type Model, type HydratedDocument } from "mongoose";

export interface IGoal {
    userId: mongoose.Types.ObjectId;
    weeklyTarget: number;
    monthlyTarget: number;
    email: {
        daily: boolean;
        weekly: boolean;
        monthly: boolean;
    };
    lastSent: {
        daily: Date | null;
        weekly: Date | null;
        monthly: Date | null;
        goalHit: {
            week: Date | null;
            month: Date | null;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

export type GoalDocument = HydratedDocument<IGoal>;

const goalSchema = new Schema<IGoal>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        weeklyTarget: { type: Number, default: 0, min: 0 },
        monthlyTarget: { type: Number, default: 0, min: 0 },
        email: {
            daily: { type: Boolean, default: false },
            weekly: { type: Boolean, default: true },
            monthly: { type: Boolean, default: true },
        },
        lastSent: {
            daily: { type: Date, default: null },
            weekly: { type: Date, default: null },
            monthly: { type: Date, default: null },
            goalHit: {
                week: { type: Date, default: null },
                month: { type: Date, default: null },
            },
        },
    },
    { timestamps: true }
);

const Goal: Model<IGoal> =
    (mongoose.models.Goal as Model<IGoal>) ?? mongoose.model<IGoal>("Goal", goalSchema);

export default Goal;
