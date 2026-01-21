
import fs from 'fs';
import path from 'path';
import { ChatSession, Project } from './types';

const DB_PATH = path.join(process.cwd(), 'chat_history.json');

export interface DbSchema {
    sessions: ChatSession[];
    projects: Project[];
}

export function readDb(): DbSchema {
    if (!fs.existsSync(DB_PATH)) {
        return { sessions: [], projects: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    try {
        const json = JSON.parse(data);
        if (Array.isArray(json)) {
            // Migration for old format
            return { sessions: json, projects: [] };
        }
        return {
            sessions: json.sessions || [],
            projects: json.projects || []
        };
    } catch (e) {
        return { sessions: [], projects: [] };
    }
}

export function writeDb(data: DbSchema) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
