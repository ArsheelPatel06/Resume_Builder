import dotenv from 'dotenv';
dotenv.config();

console.log("Checking Environment Variables...");
console.log("GEMINI_API_KEY Present:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY Length:", process.env.GEMINI_API_KEY.length);
    console.log("GEMINI_API_KEY First 5 chars:", process.env.GEMINI_API_KEY.substring(0, 5));
} else {
    console.error("CRITICAL: GEMINI_API_KEY is MISSING from process.env");
}
console.log("MONGO_URI Present:", !!process.env.MONGO_URI);
