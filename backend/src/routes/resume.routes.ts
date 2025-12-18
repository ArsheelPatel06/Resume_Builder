import { Router } from 'express';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.middleware';
// Import controller and multer config
import { uploadResume, analyzeResume, getUploadedResumes, getResume, deleteResume } from '../controllers/resume.controller';
import upload from '../config/multer.config'; // Import the configured multer instance

const router = Router();

// GET /api/resumes - Get list of uploaded resumes for the user
router.get(
    '/', // Root path relative to /api/resumes
    authenticateToken,
    getUploadedResumes
);

// POST /api/resumes/upload - Upload and parse a resume
router.post(
    '/upload',
    optionalAuthenticateToken, // Try to authenticate, but don't fail if no token
    upload.single('resumeFile'), // Handle single file upload named 'resumeFile'
    uploadResume // Process the uploaded file
);

// POST /api/resumes/:resumeId/analyze - Analyze a specific resume
router.post(
    '/:resumeId/analyze',
    optionalAuthenticateToken, // Ensure we know who the user is (or if they are anonymous)
    analyzeResume // Call the analysis controller function
);

// GET /api/resumes/:resumeId - Get specific resume details
router.get(
    '/:resumeId',
    optionalAuthenticateToken, // Allow generic access check inside controller
    getResume
);

// DELETE /api/resumes/:resumeId - Delete a resume
router.delete(
    '/:resumeId',
    authenticateToken, // Must be logged in to delete (usually)
    deleteResume
);

export default router; 