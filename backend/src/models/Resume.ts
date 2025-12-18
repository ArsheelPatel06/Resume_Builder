import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
    userId: mongoose.Types.ObjectId;
    originalFilename: string;
    parsedText: string;
    analysis?: {
        overallScore?: number;
        categoryScores?: Map<string, number>;
        suggestions?: string[];
        highlights?: string[];
        analysisTimestamp?: Date;
    };
    uploadTimestamp: Date;
}

const ResumeSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    originalFilename: { type: String, required: true },
    parsedText: { type: String, required: true },
    analysis: {
        overallScore: Number,
        categoryScores: { type: Map, of: Number },
        suggestions: [String],
        highlights: [String],
        analysisTimestamp: Date
    },
    uploadTimestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IResume>('Resume', ResumeSchema);
