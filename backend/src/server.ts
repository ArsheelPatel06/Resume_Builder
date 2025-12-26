/**
 * ResumeCraft Backend Server
 * 
 * Main entry point for the Express application.
 * Handles database connection, middleware configuration, and route registration.
 * 
 * @author Arsheel Patel
 * @version 1.0.0
 */
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file BEFORE other imports

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import builderRoutes from './routes/builder.routes';
import matchRoutes from './routes/match.routes';
import tipsRoutes from './routes/tips.routes';
import coverLetterRoutes from './routes/coverLetter.routes';
import dashboardRoutes from './routes/dashboard.routes';
import connectDB from './config/db'; // Import MongoDB connection

// --- Firebase Admin SDK Initialization REMOVED (handled in config/firebase.config.ts) ---
// try { ... } catch { ... } block removed
// ------------------------------------------------------------------------------------

const app: Express = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: true, // Allow any origin for debugging
    credentials: true,
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// API Routes
app.use('/api/auth', authRoutes); // Use auth routes under /api/auth
app.use('/api/resumes', resumeRoutes); // Use resume routes under /api/resumes
app.use('/api/builder', builderRoutes); // Use builder routes under /api/builder
app.use('/api/match', matchRoutes); // Use match routes under /api/match
app.use('/api/tips', tipsRoutes); // Use tips routes under /api/tips
app.use('/api/cover-letter', coverLetterRoutes); // Use the new routes
app.use('/api/dashboard', dashboardRoutes); // Consolidated dashboard routes

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.send('AI Resume Pro Backend is running!');
});

// Health check route (DB independent)
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'Backend is reachable',
        timestamp: new Date().toISOString(),
        dbState: mongoose.connection.readyState
    });
});

// Check for MONGO_URI
if (!process.env.MONGO_URI) {
    console.warn("⚠️ WARNING: MONGO_URI environment variable is NOT set. Database connection will likely fail in production!");
}

// Start the server only if running directly (not imported as a module)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
}

export default app; // Export the app instance for testing 