import mongoose, { Schema, type Model, type HydratedDocument } from "mongoose";

export type OtpPurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

export interface IOtp {
    userId: mongoose.Types.ObjectId;
    email: string;
    purpose: OtpPurpose;
    codeHash: string;
    expiresAt: Date;
    attempts: number;
    consumedAt: Date | null;
    createdAt: Date;
}

export type OtpDocument = HydratedDocument<IOtp>;

const otpSchema = new Schema<IOtp>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    purpose: {
        type: String,
        enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"],
        required: true,
    },
    codeHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
    },
    attempts: {
        type: Number,
        default: 0,
    },
    consumedAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
});

otpSchema.index({ email: 1, purpose: 1, consumedAt: 1, createdAt: -1 });

const Otp: Model<IOtp> =
    (mongoose.models.Otp as Model<IOtp>) ?? mongoose.model<IOtp>("Otp", otpSchema);

export default Otp;
