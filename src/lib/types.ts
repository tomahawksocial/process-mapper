export interface ProcessStep {
    id: string;
    type: 'start' | 'action' | 'decision' | 'end';
    actor?: string;
    description: string;
    next: string[]; // IDs of next steps
}

export interface ProcessModel {
    process_name: string;
    actors: string[];
    steps: ProcessStep[];
}

export interface AgentResponse {
    type: 'process' | 'general';
    text_response: string;
    process_model?: ProcessModel;
}

export interface MessageVersion {
    id: string; // uuid
    content: string;
    type: 'text' | 'map' | 'error';
    timestamp: number;
    executionDuration?: number;
}

export interface VersionStack {
    versions: MessageVersion[];
    activeIndex: number;
}

export interface Turn {
    id: string; // uuid
    user: VersionStack;
    assistant: VersionStack;
    status: 'pending' | 'generating' | 'done' | 'error';
    executionDuration?: number; // milliseconds
}

export interface ChatSession {
    id: string;
    title: string;
    turns: Turn[];
    createdAt: number;
    updatedAt?: number;
    lastAccessedAt?: number;
    // Legacy support or just new model
    model: ProcessModel | null;
    transcript?: string;
    projectId?: string | null;
}

export interface Project {
    id: string;
    name: string;
    color: string; // hex code or tailwind class
    createdAt: number;
}

// Removed legacy MessageNode interface as we move to Turn/VersionStack
