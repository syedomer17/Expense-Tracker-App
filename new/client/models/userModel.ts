import mongoose, { Schema, type Model, type HydratedDocument } from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password?: string;
    emailVerified: boolean;
    createdAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: false,
        select: false,
    },
    emailVerified: {
        type: Boolean,
        default: false,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
});

const User: Model<IUser> =
    (mongoose.models.User as Model<IUser>) ?? mongoose.model<IUser>("User", userSchema);

export default User;
