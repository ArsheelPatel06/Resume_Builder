import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

// Load env from one level up (backend root)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testGeminiRaw() {
    console.log("--- Gemini Raw HTTP Connectivity Test ---");
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No API Key");
        return;
    }

    const modelName = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

    console.log(`Testing URL: https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`);

    try {
        const payload = {
            contents: [{ parts: [{ text: "Hello, are you there?" }] }]
        };

        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(`✅ SUCCESS with raw HTTP! Status: ${response.status}`);
        if (response.data.candidates && response.data.candidates[0].content) {
            console.log("Response:", response.data.candidates[0].content.parts[0].text);
        } else {
            console.log("Response data structure unexpected:", JSON.stringify(response.data, null, 2));
        }

    } catch (error: any) {
        console.error("❌ Raw HTTP Failed.");
        if (error.response) {
            console.error(`Status: ${error.response.status} ${error.response.statusText}`);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

testGeminiRaw();
