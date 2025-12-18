import { Request, Response } from 'express';
import Resume from '../models/Resume';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface CustomRequest extends Request {
    user?: any;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export const generateCoverLetterController = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user.uid;

        const { selectedResume, jobDescription, companyName, roleName, selectedTemplate } = req.body;

        if (!selectedResume || !jobDescription) {
            res.status(400).json({ message: 'Missing selectedResume or jobDescription' });
            return;
        }

        const resume = await Resume.findById(selectedResume);

        if (!resume) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }

        if (resume.userId.toString() !== userId) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        const resumeContent = resume.parsedText;
        let templateInstructions = "Write in a standard professional tone.";
        if (selectedTemplate === "modern") {
            templateInstructions = "Write in a confident, modern professional tone.";
        } else if (selectedTemplate === "creative") {
            templateInstructions = "Write in a creative and engaging tone.";
        }

        const prompt = `
          Generate a professional cover letter.
          Role: ${roleName || 'Applicants Role'}
          Company: ${companyName || 'Target Company'}
          Tone: ${templateInstructions}
          
          Job Description:
          ${jobDescription}

          Resume:
          ${resumeContent}

          Output strictly the cover letter text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            message: "Cover letter generated",
            generatedCoverLetter: text.trim()
        });

    } catch (error: any) {
        console.error("Cover Letter Error:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};