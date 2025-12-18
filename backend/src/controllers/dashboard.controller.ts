import { Request, Response } from 'express';
import Resume from '../models/Resume';
import GeneratedResume from '../models/GeneratedResume';

interface CustomRequest extends Request {
    user?: any;
}

export const getDashboardStats = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Parallelize queries for performance
        const [resumeCount, generatedCount, resumes] = await Promise.all([
            Resume.countDocuments({ userId }),
            GeneratedResume.countDocuments({ userId }),
            Resume.find({ userId }).select('analysis.overallScore')
        ]);

        // Calculate Average Score
        let totalScore = 0;
        let scoredResumes = 0;
        resumes.forEach(r => {
            if (r.analysis?.overallScore) {
                totalScore += r.analysis.overallScore;
                scoredResumes++;
            }
        });
        const averageScore = scoredResumes > 0 ? Math.round(totalScore / scoredResumes) : 0;

        // Mock Stats for things we don't strictly track yet (Job Match)
        // We could implement a JobMatch model later.
        const jobMatchRate = 0;

        res.json({
            stats: {
                resumeCount,
                generatedCount,
                averageScore,
                jobMatchRate
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getRecentActivity = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const uploads = await Resume.find({ userId }).sort({ uploadTimestamp: -1 }).limit(5);
        const generations = await GeneratedResume.find({ userId }).sort({ createdAt: -1 }).limit(5);

        const uploadActivities = uploads.map(upload => ({
            id: upload._id.toString(),
            title: `Uploaded ${upload.originalFilename}`,
            description: 'Resume uploaded successfully.',
            date: upload.uploadTimestamp,
            type: 'resume_upload'
        }));

        const generationActivities = generations.map(gen => ({
            id: gen._id.toString(),
            title: `Generated Resume for ${gen.inputData?.targetJobRole || 'Role'}`,
            description: 'Created with AI Builder.',
            date: gen.createdAt,
            type: 'resume_generation'
        }));

        const allActivities = [...uploadActivities, ...generationActivities]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);

        res.json(allActivities);

    } catch (error) {
        console.error("Error fetching activity:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
