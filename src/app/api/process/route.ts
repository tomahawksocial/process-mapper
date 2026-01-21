import { geminiProModel } from '@/lib/gemini';
import { NextResponse } from 'next/server';
import { ProcessModel } from '@/lib/types';

const SYSTEM_PROMPT = `
You are an expert Business Process Analyst and AI assistant.
Your goal is to EITHER extract a business process from the user's transcript OR answer their general question helpfully.

OUTPUT FORMAT:
You must return a STRICT JSON object with the following structure:
{
    "type": "process" | "general",
    "text_response": "A markdown formatted response to the user's question or a summary of the process.",
    "process_model": {
        // Only include if type is "process"
        "process_name": "string",
        "actors": ["string"],
        "steps": [
            {
                "id": "string",
                "type": "start" | "action" | "decision" | "end",
                "actor": "string",
                "description": "string",
                "next": ["string"]
            }
        ]
    }
}

RULES:
1. If the user asks a general question (e.g., "explain your purpose", "what is a bank?"), set "type" to "general" and provide a helpful answer in "text_response". Leave "process_model" null or empty.
2. If the user describes a process, set "type" to "process", provide a brief summary in "text_response", and fill "process_model".
3. Use 'decision' type for simple branching.
`;

export async function POST(request: Request) {
    try {
        const { transcript } = await request.json();

        if (!transcript) {
            return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
        }

        const result = await geminiProModel.generateContent({
            contents: [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT + "\n\nUSER INPUT:\n" + transcript }] }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const content = result.response.text();

        if (!content) {
            throw new Error('No content received from AI');
        }

        const resultJson = JSON.parse(content);

        // Normalize output for frontend
        // If it's a general response, we might need to Mock the ProcessModel structure or update frontend
        // For now, let's keep the backend clean and we will update Frontend to handle "type"

        return NextResponse.json(resultJson);

    } catch (error: any) {
        console.error('Processing error:', error);
        return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
    }
}

