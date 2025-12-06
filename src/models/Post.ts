import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    postType: 'update' | 'question' | 'opportunity' | 'advice';
    tags: string[];
    likes: mongoose.Types.ObjectId[];
    comments: Array<{
        _id?: mongoose.Types.ObjectId;
        author: mongoose.Types.ObjectId;
        content: string;
        createdAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Post content is required'],
            maxlength: [5000, 'Post cannot exceed 5000 characters'],
        },
        postType: {
            type: String,
            enum: ['update', 'question', 'opportunity', 'advice'],
            default: 'update',
        },
        tags: {
            type: [String],
            default: [],
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                author: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
                content: {
                    type: String,
                    maxlength: 1000,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

PostSchema.index({ author: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ postType: 1 });

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
