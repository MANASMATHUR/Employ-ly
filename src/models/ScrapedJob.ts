import mongoose from 'mongoose';

const ScrapedJobSchema = new mongoose.Schema({
    // Source tracking
    sourceId: { type: String, required: true, unique: true }, // e.g., "remoteok-123456"
    source: { type: String, required: true, enum: ['remoteok', 'indeed', 'linkedin', 'manual'] },
    sourceUrl: { type: String },

    // Job details
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    companyLogo: { type: String },

    // Description - raw and cleaned
    descriptionRaw: { type: String },
    descriptionClean: { type: String },

    // Structured requirements (for ML training)
    requirements: {
        skills: [{ type: String }],           // ["React", "Node.js", "PostgreSQL"]
        experience: { type: String },          // "3-5 years", "Senior", etc.
        education: { type: String },           // "Bachelor's in CS", etc.
        languages: [{ type: String }],         // ["English", "Spanish"]
    },

    // Salary data (normalized to USD annual)
    salary: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: 'USD' },
        period: { type: String, enum: ['hourly', 'monthly', 'annual'], default: 'annual' },
    },

    // Location
    location: { type: String },
    locationType: { type: String, enum: ['remote', 'hybrid', 'onsite'], default: 'remote' },
    country: { type: String },
    timezone: { type: String },

    // Categories & tags
    category: { type: String },              // "Engineering", "Design", "Marketing"
    tags: [{ type: String }],
    seniority: { type: String, enum: ['intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'executive'] },

    // ML training labels (can be added later)
    labels: {
        isValid: { type: Boolean, default: true },         // For filtering bad data
        qualityScore: { type: Number, min: 0, max: 100 },  // Manual quality rating
        categories: [{ type: String }],                     // Manual categorization
    },

    // Timestamps
    postedAt: { type: Date },
    scrapedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

}, { timestamps: true });

// Indexes for efficient querying
ScrapedJobSchema.index({ 'requirements.skills': 1 });
ScrapedJobSchema.index({ source: 1, scrapedAt: -1 });
ScrapedJobSchema.index({ seniority: 1 });
ScrapedJobSchema.index({ category: 1 });

export default mongoose.models.ScrapedJob || mongoose.model('ScrapedJob', ScrapedJobSchema);
