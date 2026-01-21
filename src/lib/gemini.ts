import { GoogleGenerativeAI } from '@google/generative-ai';

// Ensure API key is set
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.warn("GOOGLE_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY_FOR_BUILD');

// Using User requested model: gemini-2.5-flash
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
export const geminiProModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });



