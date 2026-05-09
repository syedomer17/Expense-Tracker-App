import mongoose, { Schema, type Model, type HydratedDocument } from "mongoose";

export type WishlistPriority = "low" | "medium" | "high";

export interface IWishlistItem {
    userId: mongoose.Types.ObjectId;
    name: string;
    targetAmount: number;
    savedAmount: number;
    targetDate: Date | null;
    priority: WishlistPriority;
    notes: string;
    completedAt: Date | null;
    completionEmailSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type WishlistItemDocument = HydratedDocument<IWishlistItem>;

const wishlistSchema = new Schema<IWishlistItem>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 120,
        },
        targetAmount: { type: Number, required: true, min: 0 },
        savedAmount: { type: Number, default: 0, min: 0 },
        targetDate: { type: Date, default: null },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        notes: { type: String, default: "", maxlength: 500 },
        completedAt: { type: Date, default: null },
        completionEmailSentAt: { type: Date, default: null },
    },
    { timestamps: true }
);

const Wishlist: Model<IWishlistItem> =
    (mongoose.models.WishlistItem as Model<IWishlistItem>) ??
    mongoose.model<IWishlistItem>("WishlistItem", wishlistSchema);

export default Wishlist;
