
import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { Project } from '@/lib/types';

export async function GET() {
    const db = readDb();
    return NextResponse.json(db.projects);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Body is new Project
        const db = readDb();
        db.projects.push(body);
        writeDb(db);
        return NextResponse.json({ success: true, projects: db.projects });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const db = readDb();
    // Delete project
    db.projects = db.projects.filter(p => p.id !== id);
    // Unassign sessions
    db.sessions = db.sessions.map(s => s.projectId === id ? { ...s, projectId: null } : s);

    writeDb(db);

    return NextResponse.json({ success: true, projects: db.projects });
}
