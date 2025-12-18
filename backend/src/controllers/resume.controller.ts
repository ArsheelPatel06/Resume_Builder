import { Request, Response } from 'express';
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import Resume, { IResume } from '../models/Resume'; // Mongoose Model
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface CustomRequest extends Request {
    user?: any;
    file?: any; // Fix for TS2339
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    safetySettings: [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
    ],
});

export const uploadResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user ? req.user.uid : null;

        if (!req.file) {
            res.status(400).json({ message: 'Bad Request: No file uploaded' });
            return;
        }

        const file = req.file;
        let parsedText = '';

        console.log(`[upload]: Processing file: ${file.originalname}`);

        if (file.mimetype === 'application/pdf') {
            const data = await pdfParse(file.buffer);
            parsedText = data.text;
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const { value } = await mammoth.extractRawText({ buffer: file.buffer });
            parsedText = value;
        } else {
            res.status(400).json({ message: 'Unsupported file type' });
            return;
        }

        const newResume = new Resume({
            userId,
            originalFilename: file.originalname,
            parsedText,
            uploadTimestamp: new Date()
        });

        await newResume.save();
        console.log(`[upload]: Resume saved to MongoDB with ID: ${newResume._id}`);

        res.status(201).json({ message: 'Resume uploaded successfully', resumeId: newResume._id });

    } catch (error: any) {
        console.error("[upload]: Error:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const analyzeResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user ? req.user.uid : 'anonymous';
        const { resumeId } = req.params;

        if (!resumeId) {
            res.status(400).json({ message: 'Missing resumeId' });
            return;
        }

        const resume = await Resume.findById(resumeId);

        if (!resume) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }

        // Authorization check
        const resumeOwnerId = resume.userId ? resume.userId.toString() : 'anonymous';

        console.log(`[analyze] Auth Check: ResumeOwner=${resumeOwnerId}, Requester=${userId}`);

        if (resumeOwnerId !== userId) {
            console.warn(`[analyze] Forbidden Access: Owner ${resumeOwnerId} != Requester ${userId}`);
            // Strict check: Owner must match requester.
            // If both are 'anonymous', it matches.
            // If resume is anonymous but user is logged in, or vice versa, it fails (which is secure).
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        if (!resume.parsedText || resume.parsedText.trim() === '') {
            res.status(400).json({ message: 'Empty resume text' });
            return;
        }

        console.log(`[analyze]: Analyzing resume ${resumeId}`);

        // Enhanced Prompt for Accuracy
        const prompt = `
          You are an expert Senior Technical Recruiter and ATS (Applicant Tracking System) specialist.
          Analyze the following resume text rigorously.
          
          Provide output strictly in the following JSON format:
          {
            "overallScore": <number 0-100>,
            "categoryScores": {
              "formatting": <number 0-100>,
              "content": <number 0-100>,
              "keywords": <number 0-100>,
              "impact": <number 0-100>
            },
            "suggestions": [
              "<Specific, actionable advice for improvement 1>",
              "<Specific, actionable advice for improvement 2>"
            ],
            "strengths": [
              "<Strength 1>",
              "<Strength 2>"
            ],
            "missingKeywords": [
              "<Important keyword 1>",
              "<Important keyword 2>"
            ]
          }

          Evaluate criteria:
          - Impact: Does it use numbers and results (e.g., "Improved X by Y%")?
          - Formatting: Is it structured logically? (Infer from text structure).
          - Keywords: Are standard industry terms used?
          
          Resume Text:
          ${resume.parsedText}
        `;

        console.log(`[analyze]: Resume Text Length: ${resume.parsedText.length}`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("[analyze]: Raw AI Response:", text); // CRITICAL DEBUG LOG

        // Helper function to extract JSON from text
        const extractJSON = (text: string) => {
            try {
                // Remove markdown code blocks
                let cleanText = text.replace(/```json/g, '').replace(/```/g, '');
                // Find potential JSON block
                const firstBrace = cleanText.indexOf('{');
                const lastBrace = cleanText.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1) {
                    cleanText = cleanText.substring(firstBrace, lastBrace + 1);
                    return JSON.parse(cleanText);
                }
                throw new Error("No JSON object found in response");
            } catch (error) {
                console.error("JSON Parsing failed. Raw Text was:", text);
                throw error;
            }
        };

        const analysisResult = extractJSON(text);

        // Update MongoDB
        resume.analysis = {
            ...analysisResult,
            analysisTimestamp: new Date()
        };

        // Map categoryScores to Map if needed by Schema, or Schema should be strict object. 
        // Our schema defined categoryScores as { type: Map, of: Number }. 
        // Mongoose generic maps require .set() or direct object if mixed.
        // Let's update schema to be simpler object or cast it.
        // For now, assuming direct assignment works if schema allows Mixed or Map.

        await resume.save();

        res.status(200).json({ message: 'Analyzed', analysis: resume.analysis });

    } catch (error: any) {
        console.error("[analyze]: Error:", error);
        res.status(500).json({ message: 'Internal analysis error', error: error.message });
    }
};

export const getUploadedResumes = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user.uid;

        const resumes = await Resume.find({ userId }).sort({ uploadTimestamp: -1 });

        res.status(200).json({
            resumes: resumes.map(r => ({
                id: r._id,
                originalFilename: r.originalFilename,
                uploadTimestamp: r.uploadTimestamp,
                overallScore: r.analysis?.overallScore,
                analysisTimestamp: r.analysis?.analysisTimestamp
            }))
        });

    } catch (error: any) {
        console.error("[getResumes]: Error:", error);
        res.status(500).json({ message: 'Internal error' });
    }
};

export const getResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { resumeId } = req.params;
        const userId = req.user ? req.user.uid : null;

        const resume = await Resume.findById(resumeId);

        if (!resume) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }

        // Authorization check
        const resumeOwnerId = resume.userId ? resume.userId.toString() : 'anonymous';
        const requesterId = userId || 'anonymous';

        if (resumeOwnerId !== requesterId) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        res.status(200).json({ resume });

    } catch (error: any) {
        console.error("[getResume]: Error:", error);
        res.status(500).json({ message: 'Internal error' });
    }
};

export const deleteResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { resumeId } = req.params;
        const userId = req.user.uid;

        const resume = await Resume.findById(resumeId);

        if (!resume) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }

        if (resume.userId && resume.userId.toString() !== userId) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        await Resume.findByIdAndDelete(resumeId);

        res.status(200).json({ message: 'Resume deleted successfully' });

    } catch (error: any) {
        console.error("[deleteResume]: Error:", error);
        res.status(500).json({ message: 'Internal error' });
    }
};