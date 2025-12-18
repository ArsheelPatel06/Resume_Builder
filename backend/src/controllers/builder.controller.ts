import { Request, Response } from 'express';
/**
 * Resume Builder Controller
 * 
 * Core engine for AI-driven resume generation.
 * Handles PDF creation with advanced text wrapping and layout management.
 * 
 * @module Controllers/Builder
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import GeneratedResume from '../models/GeneratedResume';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface CustomRequest extends Request {
    user?: any;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const formatInputForPrompt = (data: any): string => {
    // Simplified formatter - allows AI to handle structure mostly
    return JSON.stringify(data, null, 2);
};

export const generateResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user.uid;
        const inputData = req.body;

        console.log(`[builder]: Generating for ${userId}`);

        const prompt = `
          Generate a detailed, professional resume based on this data.
          Style: ${inputData.templateStyle || 'modern'}
          
          Use a standard, clean layout structure using plain text with Markdown-like headers.
          Make it ATS friendly.
          
          Data:
          ${formatInputForPrompt(inputData)}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();

        const newGenerated = new GeneratedResume({
            userId,
            inputData, // Includes templateStyle
            generatedText
        });

        await newGenerated.save();

        res.status(201).json({
            message: 'Generated successfully',
            generatedResumeId: newGenerated._id,
            generatedText
        });

    } catch (error: any) {
        console.error("[builder]: Error", error);
        res.status(500).json({ message: 'Generation failed', error: error.message });
    }
};

const wrapText = (text: string, maxWidth: number, font: any, fontSize: number): string[] => {
    const words = text.split(' ');
    let lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
        if (width < maxWidth) {
            currentLine += ` ${word}`;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
};

export const downloadGeneratedResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { generatedResumeId } = req.params;

        const resume = await GeneratedResume.findById(generatedResumeId);

        if (!resume) {
            res.status(404).json({ message: 'Not found' });
            return;
        }

        if (resume.userId.toString() !== req.user.uid) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();

        // Select font based on template
        const templateStyle = resume.inputData?.templateStyle || 'modern';
        let font;
        if (templateStyle === 'classic') {
            font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        } else if (templateStyle === 'minimalist') {
            font = await pdfDoc.embedFont(StandardFonts.Courier); // Monospace for minimalist/technical feel
        } else {
            font = await pdfDoc.embedFont(StandardFonts.Helvetica); // Default Modern
        }
        const fontSize = 11;
        const margin = 50;
        const maxWidth = width - (margin * 2);

        const text = resume.generatedText || '';
        const paragraphs = text.split('\n'); // Split by explicit newlines first

        let y = height - margin;

        for (const paragraph of paragraphs) {
            if (paragraph.trim() === '') {
                y -= fontSize; // Extra space for empty lines
                continue;
            }

            const wrappedLines = wrapText(paragraph, maxWidth, font, fontSize);

            for (const line of wrappedLines) {
                if (y < margin) {
                    page = pdfDoc.addPage();
                    y = height - margin;
                }
                page.drawText(line, { x: margin, y, size: fontSize, font });
                y -= (fontSize + 4); // Line height
            }
        }

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Disposition', `attachment; filename="resume_${generatedResumeId}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.write(Buffer.from(pdfBytes));
        res.end();

    } catch (error: any) {
        console.error("[download]: Error", error);
        res.status(500).json({ message: 'Download failed' });
    }
};

export const getGeneratedResumes = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const resumes = await GeneratedResume.find({ userId: req.user.uid }).sort({ createdAt: -1 });

        const simplified = resumes.map(r => ({
            id: r._id,
            createdAt: r.createdAt,
            inputName: r.inputData?.personalInfo?.name,
            inputTargetRole: r.inputData?.targetJobRole
        }));

        res.status(200).json({ generatedResumes: simplified });

    } catch (error: any) {
        console.error("[getGenerated]: Error", error);
        res.status(500).json({ message: 'Fetch failed' });
    }
};

export const deleteGeneratedResume = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { generatedResumeId } = req.params;
        const userId = req.user.uid;

        const resume = await GeneratedResume.findById(generatedResumeId);

        if (!resume) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }

        if (resume.userId.toString() !== userId) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        await GeneratedResume.findByIdAndDelete(generatedResumeId);

        res.status(200).json({ message: 'Generated resume deleted successfully' });

    } catch (error: any) {
        console.error("[deleteGeneratedResume]: Error", error);
        res.status(500).json({ message: 'Internal error' });
    }
};