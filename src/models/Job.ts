import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    requiredSkills: string[];
    budget: {
        min: number;
        max: number;
        currency: string;
    };
    location: string;
    locationType: 'remote' | 'onsite' | 'hybrid';
    tags: string[];
    poster: mongoose.Types.ObjectId;
    paymentTxHash: string;
    status: 'active' | 'closed' | 'draft';
    applicants: mongoose.Types.ObjectId[];
    views: number;
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
    {
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Job description is required'],
            maxlength: [10000, 'Description cannot exceed 10000 characters'],
        },
        requiredSkills: {
            type: [String],
            default: [],
        },
        budget: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
            currency: { type: String, default: 'USD' },
        },
        location: {
            type: String,
            default: 'Remote',
            trim: true,
        },
        locationType: {
            type: String,
            enum: ['remote', 'onsite', 'hybrid'],
            default: 'remote',
        },
        tags: {
            type: [String],
            default: [],
        },
        poster: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        paymentTxHash: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['active', 'closed', 'draft'],
            default: 'active',
        },
        applicants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for filtering and searching
JobSchema.index({ requiredSkills: 1 });
JobSchema.index({ tags: 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ title: 'text', description: 'text' });

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
