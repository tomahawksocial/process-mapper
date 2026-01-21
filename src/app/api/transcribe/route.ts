import { geminiModel } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');

        const result = await geminiModel.generateContent([
            {
                inlineData: {
                    mimeType: file.type || 'audio/mp3',
                    data: base64Audio
                }
            },
            { text: "Transcribe this audio file verbatim." }
        ]);

        const text = result.response.text();

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error('Transcription error:', error);
        return NextResponse.json({ error: error.message || 'Transcription failed' }, { status: 500 });
    }
}

