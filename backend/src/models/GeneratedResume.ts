import mongoose, { Document, Schema } from 'mongoose';

// Define structure for the input data used to generate the resume (sub-schemas)
const ResumeInputDataSchema = new Schema({
    personalInfo: {
        name: String,
        email: String,
        phone: String,
        linkedin: String,
        portfolio: String,
        address: String,
    },
    summary: String,
    education: [{
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: String,
        endDate: String,
        details: [String]
    }],
    experience: [{
        jobTitle: String,
        company: String,
        location: String,
        startDate: String,
        endDate: String,
        responsibilities: [String]
    }],
    skills: [{
        category: String,
        items: [String]
    }],
    certifications: [{
        name: String,
        issuingOrganization: String,
        dateObtained: String
    }],
    projects: [{
        name: String,
        description: String,
        technologies: [String],
        link: String
    }],
    targetJobRole: String,
    targetJobDescription: String,
    templateStyle: { type: String, default: 'modern' } // Added template style
}, { _id: false });

export interface IGeneratedResume extends Document {
    userId: mongoose.Types.ObjectId;
    inputData: any; // Using the sub-schema structure
    generatedText: string;
    version: number;
    createdAt: Date;
}

const GeneratedResumeSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inputData: { type: ResumeInputDataSchema, required: true },
    generatedText: { type: String, required: true },
    version: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IGeneratedResume>('GeneratedResume', GeneratedResumeSchema);
