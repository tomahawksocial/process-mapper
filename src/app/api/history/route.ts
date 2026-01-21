import { NextResponse } from 'next/server';
import { ChatSession } from '@/lib/types';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
    const db = readDb();
    return NextResponse.json(db); // Returns { sessions, projects }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const db = readDb();
        const sessions = db.sessions;

        // Check if body is full session object or partial update
        const existingIndex = sessions.findIndex(s => s.id === body.id);

        if (existingIndex >= 0) {
            sessions[existingIndex] = { ...sessions[existingIndex], ...body };
        } else {
            const newSession: ChatSession = {
                id: body.id || crypto.randomUUID(),
                createdAt: Date.now(),
                title: body.title || 'Untitled Process',
                transcript: body.transcript || '',
                model: body.model || null,
                turns: body.turns || [],
                projectId: body.projectId || null
            };
            sessions.unshift(newSession);
        }

        db.sessions = sessions;
        writeDb(db);
        return NextResponse.json({ success: true, sessions: db.sessions });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        // If no ID, delete ALL
        if (request.method === 'DELETE') {
            const db = readDb();
            db.sessions = [];
            writeDb(db);
            return NextResponse.json({ success: true, sessions: [] });
        }
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const db = readDb();
    db.sessions = db.sessions.filter(s => s.id !== id);
    writeDb(db);

    return NextResponse.json({ success: true, sessions: db.sessions });
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        if (Array.isArray(body)) {
            const db = readDb();
            db.sessions = body;
            writeDb(db);
            return NextResponse.json({ success: true, sessions: body });
        } else {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update sessions' }, { status: 500 });
    }
}
