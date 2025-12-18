import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

// Load env from one level up (backend root)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function listModels() {
    console.log("--- Listing Available Gemini Models ---");
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No API Key");
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        console.log(`Fetching: ${url.replace(key, 'HIDDEN_KEY')}`);

        const response = await axios.get(url);

        if (response.data && response.data.models) {
            const chatModels = response.data.models.filter((m: any) =>
                m.supportedGenerationMethods?.includes("generateContent")
            );

            console.log(`✅ Available Chat Models (${chatModels.length}):`);
            chatModels.forEach((m: any) => {
                console.log(` - ${m.name} (${m.displayName})`);
            });

            if (chatModels.length === 0) {
                console.log("⚠️ No chat models found! (Only embeddings/vision?)");
                // Print all just in case
                response.data.models.forEach((m: any) => {
                    console.log(` [Non-Chat] ${m.name} (${m.supportedGenerationMethods})`);
                });
            }
        } else {
            console.log("⚠️ No models found in response:", response.data);
        }

    } catch (error: any) {
        console.error("❌ Failed to list models:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

listModels();
