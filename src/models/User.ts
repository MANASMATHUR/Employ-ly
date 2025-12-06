import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    name: string;
    bio: string;
    linkedinUrl: string;
    avatarUrl: string;
    skills: string[];
    walletAddress: string;
    isRecruiter: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        bio: {
            type: String,
            default: '',
            maxlength: [2000, 'Bio cannot exceed 2000 characters'],
        },
        linkedinUrl: {
            type: String,
            default: '',
            trim: true,
        },
        avatarUrl: {
            type: String,
            default: '',
        },
        skills: {
            type: [String],
            default: [],
        },
        walletAddress: {
            type: String,
            default: '',
            trim: true,
        },
        isRecruiter: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
UserSchema.index({ skills: 1 });
UserSchema.index({ email: 1 });

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
