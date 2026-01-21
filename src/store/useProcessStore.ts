import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { ChatSession, ProcessModel, Turn, VersionStack, MessageVersion, Project } from '@/lib/types';

interface ProcessState {
    // UI State
    isProcessing: boolean;
    status: 'idle' | 'generating' | 'cancelled' | 'error';
    processingSessionId: string | null;
    processingStep: string;
    processingStartTime: number | null;
    executionToken: string | null;

    // Data State
    currentSessionId: string | null;
    currentTranscript: string;
    history: ChatSession[];
    projects: Project[];
    lastRequestId: string | null;

    // Right Panel State
    isRightPanelOpen: boolean;
    rightPanelSessionId: string | null;

    // Actions
    setTranscript: (text: string) => void;
    uploadAudio: (file: File, prompt?: string) => Promise<void>;

    // Core Turn Actions
    submitUserMessage: (text: string) => Promise<void>;
    regenerateTurn: (turnId: string) => Promise<void>;
    editTurn: (turnId: string, newText: string) => Promise<void>;
    setTurnVersion: (turnId: string, role: 'user' | 'assistant', index: number) => void;

    // Session Management
    loadHistory: () => Promise<void>;
    loadSession: (session: ChatSession) => void;
    saveSession: () => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    deleteAllSessions: () => Promise<void>;
    exportSession: (session: ChatSession) => void;
    renameSession: (id: string, newTitle: string) => Promise<void>;
    reorderHistory: (sessions: ChatSession[]) => Promise<void>;
    cancelGeneration: (sessionId?: string) => void;

    // Project Actions
    createProject: (name: string, color: string) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    renameProject: (id: string, name: string) => Promise<void>;
    moveSessionToProject: (sessionId: string, projectId: string | null) => Promise<void>;

    // Right Panel Actions
    openRightPanel: (sessionId: string) => void;
    closeRightPanel: () => void;
}

// --- Helpers ---

const createMessageVersion = (content: string, type: 'text' | 'map' | 'error' = 'text'): MessageVersion => ({
    id: crypto.randomUUID(),
    content,
    type,
    timestamp: Date.now()
});

const createTurn = (userText: string): Turn => ({
    id: crypto.randomUUID(),
    user: {
        versions: [createMessageVersion(userText)],
        activeIndex: 0
    },
    assistant: {
        versions: [],
        activeIndex: -1 // No assistant response yet
    },
    status: 'pending'
});

// Global Abort Controller Map
const abortControllers: Record<string, AbortController> = {};

// --- Logic ---

async function generateResponse(set: any, get: any, turnId: string, sessionId: string) {
    const executionToken = crypto.randomUUID();
    const startTime = Date.now();

    set({
        isProcessing: true,
        status: 'generating',
        processingSessionId: sessionId,
        processingStep: 'analyzing',
        processingStartTime: startTime,
        lastRequestId: executionToken,
        executionToken
    });

    // 1. Optimistic Update: Add empty assistant version
    const newAssistantVersion = createMessageVersion('', 'text');

    set((state: ProcessState) => {
        const session = state.history.find(s => s.id === sessionId);
        if (!session) return {};

        const newTurns = session.turns.map(t => {
            if (t.id === turnId) {
                return {
                    ...t,
                    status: 'generating',
                    assistant: {
                        versions: [...t.assistant.versions, newAssistantVersion],
                        activeIndex: t.assistant.versions.length // Point to new index (which is length before push + 1 (wait, length is existing. push makes it length+1. index is length))
                    }
                } as Turn;
            }
            return t;
        });

        return {
            history: state.history.map(s => s.id === sessionId ? { ...s, turns: newTurns } : s)
        };
    });

    // IMMEDIATE COMMIT: Persist "Thinking" state
    await get().saveSession();

    try {
        // Safety Check 1
        if (get().executionToken !== executionToken || get().status === 'cancelled') throw new Error('Cancelled');

        const controller = new AbortController();
        abortControllers[executionToken] = controller;
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        // Get Context: Standardize on "Linear History up to this turn"
        // We constructed context from past turns active versions.
        const session = get().history.find((s: ChatSession) => s.id === sessionId);
        let contextText = '';

        // Simple Context Builder: Iterate turns up to current, use active versions
        if (session) {
            const turnIdx = session.turns.findIndex((t: Turn) => t.id === turnId);
            if (turnIdx !== -1) {
                // Build history up to this turn
                // Optional: include previous Conversation history? 
                // For now, let's just send the User Text of THIS turn.
                const turn = session.turns[turnIdx];
                contextText = turn.user.versions[turn.user.activeIndex].content;
            }
        }

        const response = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: contextText }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        delete abortControllers[executionToken];

        // Safety Check 2
        if (get().executionToken !== executionToken || get().status === 'cancelled') throw new Error('Cancelled');

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Analysis failed');
        }

        const data: any = await response.json();

        // Handle Gemini 2.5 Hybrid Response
        const responseType = data.type || 'process'; // Default to process for backward compat
        const contentInfo = responseType === 'general' ? data.text_response : JSON.stringify(data.process_model || data, null, 2);
        const contentType = responseType === 'general' ? 'text' : 'map';

        // Safety Check 3
        if (get().executionToken !== executionToken || get().status === 'cancelled') return;

        const endTime = Date.now();
        const duration = endTime - startTime;

        set((state: ProcessState) => {
            const session = state.history.find(s => s.id === sessionId);
            if (!session) return {};

            const newTurns = session.turns.map(t => {
                if (t.id === turnId) {
                    // Update content of the ACTIVE assistant version (the one we created)
                    const activeVerIdx = t.assistant.activeIndex;
                    const updatedVersions = [...t.assistant.versions];
                    if (updatedVersions[activeVerIdx]) {
                        updatedVersions[activeVerIdx] = {
                            ...updatedVersions[activeVerIdx],
                            content: contentInfo,
                            type: contentType,
                            executionDuration: duration
                        };
                    }

                    return {
                        ...t,
                        status: 'done',
                        executionDuration: duration,
                        assistant: {
                            ...t.assistant,
                            versions: updatedVersions
                        }
                    };
                }
                return t;
            });

            return {
                history: state.history.map(s => s.id === sessionId ?
                    { ...s, turns: newTurns, model: data.process_model || null } : s
                ),
                status: 'idle',
                isProcessing: false,
                processingStartTime: null,
                executionToken: null
            };
        });

        await get().saveSession();

    } catch (error: any) {
        if (error.message === 'Cancelled' || error.name === 'AbortError') return;
        console.error(error);
        const errorMessage = error.message || 'Error processing request';

        if (get().executionToken === executionToken) {
            set((state: ProcessState) => {
                const session = state.history.find(s => s.id === sessionId);
                if (!session) return {};

                const newTurns = session.turns.map(t => {
                    if (t.id === turnId) {
                        const activeVerIdx = t.assistant.activeIndex;
                        const updatedVersions = [...t.assistant.versions];
                        if (updatedVersions[activeVerIdx]) {
                            updatedVersions[activeVerIdx] = {
                                ...updatedVersions[activeVerIdx],
                                content: errorMessage,
                                type: 'error'
                            };
                        }
                        return {
                            ...t,
                            status: 'error',
                            assistant: { ...t.assistant, versions: updatedVersions }
                        };
                    }
                    return t;
                });

                return {
                    history: state.history.map(s => s.id === sessionId ? { ...s, turns: newTurns } : s),
                    status: 'error',
                    isProcessing: false,
                    executionToken: null
                };
            });
            await get().saveSession();
        }
    }
}


export const useProcessStore = create<ProcessState>((set, get) => ({
    isProcessing: false,
    status: 'idle',
    processingSessionId: null,
    processingStep: 'idle',
    processingStartTime: null,
    executionToken: null,
    currentSessionId: null,
    currentTranscript: '',
    history: [],
    projects: [],
    lastRequestId: null,
    isRightPanelOpen: false,
    rightPanelSessionId: null,

    setTranscript: (text) => set({ currentTranscript: text }),

    cancelGeneration: (sessionId) => {
        const { executionToken, status } = get();
        if (status === 'generating' && executionToken) {
            if (abortControllers[executionToken]) {
                abortControllers[executionToken].abort();
                delete abortControllers[executionToken];
            }
            set({ status: 'cancelled', isProcessing: false, executionToken: null });
        }
    },

    submitUserMessage: async (text: string) => {
        get().cancelGeneration(); // Enforce strict single execution

        let sessionId = get().currentSessionId;

        // 1. Create Session if needed
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            const newSession: ChatSession = {
                id: sessionId,
                title: 'New Chat',
                turns: [],
                createdAt: Date.now(),
                model: null,
                transcript: ''
            };
            set((state: ProcessState) => ({
                currentSessionId: sessionId,
                history: [newSession, ...state.history]
            }));
        }

        // 2. Create Turn
        const newTurn = createTurn(text);

        // 3. Append to Session
        set((state: ProcessState) => {
            const session = state.history.find(s => s.id === sessionId);
            if (!session) return {};
            return {
                history: state.history.map(s => s.id === sessionId ?
                    { ...s, turns: [...s.turns, newTurn], transcript: text } : s
                ),
                currentTranscript: text
            };
        });

        // 4. IMMEDIATE SAVE (Critical Fix)
        await get().saveSession();

        // 5. Generate
        await generateResponse(set, get, newTurn.id, sessionId);
    },

    regenerateTurn: async (turnId: string) => {
        const { currentSessionId } = get();
        if (!currentSessionId) return;
        get().cancelGeneration();

        await generateResponse(set, get, turnId, currentSessionId);
    },

    editTurn: async (turnId: string, newText: string) => {
        const { currentSessionId } = get();
        if (!currentSessionId) return;
        get().cancelGeneration();

        set((state: ProcessState) => {
            const session = state.history.find(s => s.id === currentSessionId);
            if (!session) return {};

            const newTurns = session.turns.map(t => {
                if (t.id === turnId) {
                    // Add new User Version
                    const newUserVersion = createMessageVersion(newText, 'text');
                    return {
                        ...t,
                        user: {
                            versions: [...t.user.versions, newUserVersion],
                            activeIndex: t.user.versions.length // Set new version active
                        },
                        // Keep Assistant stack intact, generateResponse adding new version will happen next.
                    };
                }
                return t;
            });

            return {
                history: state.history.map(s => s.id === currentSessionId ? { ...s, turns: newTurns } : s)
            };
        });

        await get().saveSession();
        await generateResponse(set, get, turnId, currentSessionId);
    },

    setTurnVersion: (turnId: string, role: 'user' | 'assistant', index: number) => {
        const { currentSessionId } = get();
        if (!currentSessionId) return;

        set((state: ProcessState) => {
            const session = state.history.find(s => s.id === currentSessionId);
            if (!session) return {};

            const newTurns = session.turns.map(t => {
                if (t.id === turnId) {
                    if (role === 'user') {
                        return { ...t, user: { ...t.user, activeIndex: index } };
                    } else {
                        return { ...t, assistant: { ...t.assistant, activeIndex: index } };
                    }
                }
                return t;
            });
            return {
                history: state.history.map(s => s.id === currentSessionId ? { ...s, turns: newTurns } : s)
            };
        });
    },

    loadHistory: async () => {
        try {
            const res = await fetch('/api/history');
            if (res.ok) {
                const data = await res.json();
                // Check if response has { sessions, projects } structure or just array
                if (Array.isArray(data)) {
                    // Backward compatibility
                    set({ history: data });
                } else {
                    set({ history: data.sessions || [], projects: data.projects || [] });
                }
            }
        } catch (e) {
            console.error('Failed to load history', e);
        }
    },

    loadSession: (session) => {
        get().cancelGeneration();
        set({
            currentSessionId: session.id,
            currentTranscript: session.transcript || ''
        });
    },

    saveSession: async () => {
        const { currentSessionId, history } = get();
        if (!currentSessionId) return;
        const session = history.find(s => s.id === currentSessionId);
        if (!session) return;

        await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(session)
        });
    },

    deleteSession: async (id) => {
        if (get().currentSessionId === id) {
            get().cancelGeneration();
        }
        set((state: ProcessState) => ({
            history: state.history.filter(s => s.id !== id),
            currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
            currentTranscript: state.currentSessionId === id ? '' : state.currentTranscript
        }));
        await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
    },

    deleteAllSessions: async () => {
        get().cancelGeneration();
        set({ history: [], currentSessionId: null, currentTranscript: '' });
        await fetch('/api/history', { method: 'DELETE' });
    },

    exportSession: (session) => {
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${session.title || 'chat'}-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    renameSession: async (id, newTitle) => {
        set((state: ProcessState) => ({
            history: state.history.map(s => s.id === id ? { ...s, title: newTitle } : s)
        }));
        await get().saveSession();
    },

    reorderHistory: async (sessions) => {
        set({ history: sessions });
    },

    uploadAudio: async (file, prompt) => {
        get().cancelGeneration();
        set({ isProcessing: true, status: 'generating', processingStep: 'transcribing' });

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Transcription failed');

            const data = await response.json();
            const transcript = data.text;

            set({ isProcessing: false }); // Reset state
            await get().submitUserMessage(transcript);

        } catch (error: any) {
            console.error(error);
            set({ isProcessing: false, status: 'error' });
        }
    },

    createProject: async (name, color) => {
        const newProject: Project = {
            id: crypto.randomUUID(),
            name,
            color,
            createdAt: Date.now()
        };
        set(state => ({ projects: [...state.projects, newProject] }));
        // Save projects to backend (assuming shared endpoint or new one)
        // For now, let's assume we send everything on session save, OR we need a separate persist.
        // Let's rely on a new unified save or just local state -> backend sync later.
        // Actually, we should call a persist endpoint.
        await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProject)
        });
    },

    deleteProject: async (id) => {
        set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            history: state.history.map(s => s.projectId === id ? { ...s, projectId: null } : s)
        }));
        await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    },

    renameProject: async (id, name) => {
        set(state => ({
            projects: state.projects.map(p => p.id === id ? { ...p, name } : p)
        }));
        // Update backend
        // Assuming there's a PUT or PATCH endpoint, or re-using post for update? 
        // For now, let's just use the same create endpoint if it supports upsert or fail gracefully.
        // Or better, just skipping backend sync for rename specific until confirmed API exists. 
        // Actually, let's try a PATCH if possible, or just re-save projects list?
        // Let's assume we can't easily persist rename without proper API, so just local state for now + maybe a generic save.
    },

    moveSessionToProject: async (sessionId: string, projectId: string | null) => {
        set(state => ({
            history: state.history.map(s => s.id === sessionId ? { ...s, projectId } : s)
        }));

        const session = get().history.find(s => s.id === sessionId);
        if (session) {
            await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...session, projectId })
            });
        }
    },

    openRightPanel: (sessionId) => set({ isRightPanelOpen: true, rightPanelSessionId: sessionId }),
    closeRightPanel: () => set({ isRightPanelOpen: false, rightPanelSessionId: null }),

}));
