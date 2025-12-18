import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
// Import controller
import { generateResume, downloadGeneratedResume, getGeneratedResumes, deleteGeneratedResume } from '../controllers/builder.controller';

const router = Router();

// GET /api/builder/generated - Get list of generated resumes for the user
router.get(
    '/generated',
    authenticateToken,
    getGeneratedResumes
);

// POST /api/builder/generate - Generate a resume based on input data
router.post(
    '/generate',
    // authenticateToken,   <-- REMOVED strict auth
    generateResume
);

// GET /api/builder/download/:generatedResumeId - Download a generated resume as PDF
router.get(
    '/download/:generatedResumeId',
    authenticateToken, // Ensure user is authenticated
    downloadGeneratedResume // Use the download controller function
);

// DELETE /api/builder/generated/:generatedResumeId - Delete a generated resume
router.delete(
    '/generated/:generatedResumeId',
    authenticateToken,
    deleteGeneratedResume
);

export default router; 