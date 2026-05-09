import mongoose, { Schema, type Model, type HydratedDocument } from "mongoose";

export interface IRefreshToken {
    userId: mongoose.Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
    revokedAt: Date | null;
    replacedByHash: string | null;
}

export type RefreshTokenDocument = HydratedDocument<IRefreshToken>;

const refreshTokenSchema = new Schema<IRefreshToken>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
    revokedAt: {
        type: Date,
        default: null,
    },
    replacedByHash: {
        type: String,
        default: null,
    },
});

const RefreshToken: Model<IRefreshToken> =
    (mongoose.models.RefreshToken as Model<IRefreshToken>) ??
    mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

export default RefreshToken;
