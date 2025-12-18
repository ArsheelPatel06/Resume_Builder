import { Request, Response } from 'express';
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import Resume from '../models/Resume';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface CustomRequest extends Request {
    user?: any;
    file?: any; // Fix for TS2339
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export const matchResumeToJob = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user.uid;
        const { jobDescription, resumeId, resumeText: fallbackResumeText } = req.body;

        if (!jobDescription) {
            res.status(400).json({ message: 'Missing jobDescription' });
            return;
        }

        let currentResumeText = '';
        let resumeSourceDescription = 'Unknown';

        if (req.file) {
            resumeSourceDescription = `Uploaded file: ${req.file.originalname}`;
            if (req.file.mimetype === "application/pdf") {
                const data = await pdfParse(req.file.buffer);
                currentResumeText = data.text;
            } else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                const { value } = await mammoth.extractRawText({ buffer: req.file.buffer });
                currentResumeText = value;
            } else {
                res.status(400).json({ message: 'Unsupported file type' });
                return;
            }
        } else if (resumeId) {
            resumeSourceDescription = `ID: ${resumeId}`;
            const resume = await Resume.findById(resumeId);
            if (!resume) {
                res.status(404).json({ message: 'Resume not found' });
                return;
            }
            if (resume.userId.toString() !== userId) {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            currentResumeText = resume.parsedText;
        } else if (fallbackResumeText) {
            resumeSourceDescription = 'Direct Text';
            currentResumeText = fallbackResumeText;
        } else {
            res.status(400).json({ message: 'No resume source provided' });
            return;
        }

        if (!currentResumeText || !currentResumeText.trim()) {
            res.status(400).json({ message: 'Resume text is empty' });
            return;
        }

        console.log(`[match]: Matching for user ${userId}`);

        const prompt = `
          ACT AS: An ATS (Applicant Tracking System) Specialist and Senior Tech Recruiter.
          TASK: Compare the Resume against the Job Description.

          OUTPUT: Strictly a JSON object.
          FORMAT:
          {
            "matchScore": <integer 0-100>,
            "missingKeywords": ["<keyword1>", "<keyword2>"],
            "matchingKeywords": ["<keyword1>", "<keyword2>"],
            "suggestions": ["<Actionable suggestion 1>", "<Actionable suggestion 2>"]
          }

          JOB DESCRIPTION:
          ${jobDescription}

          RESUME:
          ${currentResumeText}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");

        const analysisResult = JSON.parse(jsonMatch[0]);

        res.status(200).json({ message: 'Match complete', analysis: analysisResult });

    } catch (error: any) {
        console.error("[match]: Error:", error);
        res.status(500).json({ message: 'Error matching resume', error: error.message });
    }
};