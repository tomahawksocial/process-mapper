'use client';

import {
    History,
    MessageSquare,
    Plus,
    Settings,
    Upload,
    FileText,
    Mic,
    Layout,
    User,
    Loader2,
    Bot,
    Trash2,
    Share,
    ArrowRight,
    Pencil,
    Check,
    X,
    Copy,
    SquarePen,
    Activity,
    Search,
    RotateCw,
    Moon,
    Sun,
    Clock,
    Paperclip,
    StopCircle,
    PanelRight,
    ChevronLeft,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useProcessStore } from '@/store/useProcessStore';
import { useTheme } from '@/hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    useDroppable
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Turn, VersionStack, MessageVersion, Project } from '@/lib/types';
import { generateMermaidCode } from '@/lib/exportUtils';
import { ThinkingIndicator } from '../ui/ThinkingIndicator';
import { ExportModal } from '../ui/ExportModal';
import ReactMarkdown from 'react-markdown';
import { NavRail } from './NavRail';
import { KanbanBoard } from './KanbanBoard';
import { ProjectItem } from './ProjectItem';
import { CreateProjectModal } from '../ui/CreateProjectModal';
import { RightPanel } from './RightPanel';
import { InboxView } from './InboxView';




// Droppable Area Component
function DroppableArea({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={className}>
            {children}
        </div>
    );
}

interface SortableItemProps {
    session: any;
    isActive: boolean;
    onLoad: (s: any) => void;
    onExport: (s: any) => void;
    onDelete: (id: string) => void;
    onRename: (id: string) => void;
    isEditing: boolean;
    onRenameSubmit: (id: string, newTitle: string) => void;
    onRenameCancel: () => void;
}

function SortableSessionItem({ session, isActive, onLoad, onExport, onDelete, onRename, isEditing, onRenameSubmit, onRenameCancel }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: session.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [editTitle, setEditTitle] = useState(session.title);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        onRenameSubmit(session.id, editTitle);
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div
                className={cn(
                    "group flex items-center w-full px-3 py-2 rounded-md transition-colors cursor-pointer relative",
                    isActive
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                )}
                onClick={() => !isEditing && onLoad(session)}
            >
                <MessageSquare className={cn("w-4 h-4 flex-shrink-0 mr-3 transition-colors", isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300")} />

                {isEditing ? (
                    <form
                        onSubmit={handleSubmit}
                        className="flex-1 flex items-center gap-1 min-w-0"
                        onClick={e => e.stopPropagation()}
                        onPointerDown={e => e.stopPropagation()}
                    >
                        <input
                            autoFocus
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') onRenameCancel();
                                if (e.key === 'Enter') handleSubmit();
                                e.stopPropagation();
                            }}
                            className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 w-full focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                        />
                        <button type="submit" className="p-1 hover:text-green-600 dark:hover:text-green-400 text-zinc-400"><Check className="w-3 h-3" /></button>
                        <button type="button" onClick={onRenameCancel} className="p-1 hover:text-red-600 dark:hover:text-red-400 text-zinc-400"><X className="w-3 h-3" /></button>
                    </form>
                ) : (
                    <span className="truncate text-xs flex-1 pr-16">{session.title}</span>
                )}

                {/* Hover Actions */}
                {!isEditing && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-100 dark:bg-zinc-800 pl-2 shadow-sm">
                        <button
                            onClick={(e) => { e.stopPropagation(); onRename(session.id); }}
                            className="p-1 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                            title="Rename Chat"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onExport(session); }}
                            className="p-1 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                            title="Export Chat Info"
                        >
                            <Upload className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                            className="p-1 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                            title="Delete Session"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function MessageBubble({
    turnId,
    role,
    stack,
    onSetVersion,
    onEdit,
    isEditing,
    setEditingId,
    onRegenerate,
    onOpenExport,
    executionDuration,
    onCopy
}: {
    turnId: string,
    role: 'user' | 'assistant',
    stack: VersionStack,
    onSetVersion: (idx: number) => void,
    onEdit?: (txt: string) => void,
    isEditing?: boolean,
    setEditingId?: (id: string | null) => void,
    onRegenerate?: () => void,
    onOpenExport?: (code: string, onRegen?: () => void) => void,
    executionDuration?: number,
    onCopy?: () => void
}) {
    const [isHovered, setIsHovered] = useState(false);
    const activeVersion = stack.versions[stack.activeIndex];
    const versionCount = stack.versions.length;
    const currentVersionIdx = stack.activeIndex;

    const [val, setVal] = useState('');

    useEffect(() => {
        if (activeVersion) setVal(activeVersion.content);
    }, [activeVersion]);


    if (!activeVersion && role === 'assistant' && versionCount === 0) {
        return null;
    }

    const handleSwitch = (direction: 'prev' | 'next') => {
        const newIdx = direction === 'prev' ? currentVersionIdx - 1 : currentVersionIdx + 1;
        if (newIdx >= 0 && newIdx < versionCount) {
            onSetVersion(newIdx);
        }
    };

    const handleCopy = () => {
        if (activeVersion) {
            navigator.clipboard.writeText(activeVersion.content);
            if (onCopy) onCopy();
        }
    };

    const handleEditSave = () => {
        if (val.trim() && onEdit) {
            onEdit(val);
        }
        if (setEditingId) setEditingId(null);
    };

    const handleCancelEdit = () => {
        if (activeVersion) setVal(activeVersion.content);
        if (setEditingId) setEditingId(null);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex w-full group relative mb-6",
                role === 'user' ? "justify-end" : "justify-start"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={cn(
                "max-w-[80%] rounded-2xl p-4 shadow-sm relative",
                role === 'user'
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-br-sm"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-bl-sm"
            )}>
                {isEditing ? (
                    <div className="flex flex-col gap-2 min-w-[300px]">
                        <textarea
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            className={cn(
                                "w-full bg-transparent p-2 text-sm resize-none focus:outline-none border-b",
                                role === 'user' ? "text-white dark:text-zinc-900 border-white/20 dark:border-zinc-300" : "text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700"
                            )}
                            rows={3}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2 text-white">
                            <button onClick={handleCancelEdit} className="px-3 py-1 bg-zinc-700/50 hover:bg-zinc-700 rounded text-xs transition-colors text-zinc-200">Cancel</button>
                            <button onClick={handleEditSave} className="px-3 py-1 bg-zinc-600 hover:bg-zinc-500 text-white rounded text-xs transition-colors">Submit</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {activeVersion?.type === 'error' ? (
                            <div className="text-red-500 font-medium">{activeVersion.content}</div>
                        ) : activeVersion?.type === 'map' ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                                    <Bot className="w-3 h-3" /> Process Map Generated
                                </div>
                                <pre className="text-xs bg-zinc-50 dark:bg-zinc-950/50 text-zinc-600 dark:text-zinc-300 p-3 rounded-lg overflow-x-auto max-h-60 scrollbar-custom border border-zinc-200 dark:border-zinc-800">
                                    {activeVersion.content}
                                </pre>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const model = JSON.parse(activeVersion.content);
                                                const mermaid = generateMermaidCode(model);
                                                if (onOpenExport) {
                                                    onOpenExport(mermaid, onRegenerate);
                                                }
                                            } catch (e) {
                                                console.error("Failed to export", e);
                                            }
                                        }}
                                        className="text-xs flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-md shadow-sm text-zinc-600 dark:text-zinc-300 transition-colors border border-zinc-200 dark:border-zinc-700"
                                    >
                                        <Share className="w-3.5 h-3.5" /> Open in Draw.io
                                    </button>
                                </div>
                            </div>

                        ) : (
                            <div className={cn(
                                "prose prose-sm max-w-none",
                                role === 'user' ? "prose-invert" : "text-zinc-700 dark:text-zinc-200 dark:prose-invert"
                            )}>
                                <ReactMarkdown>{activeVersion?.content || ''}</ReactMarkdown>
                            </div>
                        )}
                    </>
                )}
                {role === 'assistant' && activeVersion?.executionDuration && (
                    <div className="absolute right-3 bottom-0 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono italic opacity-70 flex items-center gap-1 bg-white/50 dark:bg-zinc-900/50 px-1 rounded translate-y-[100%]">
                        <Bot className="w-3 h-3 text-zinc-600" />
                        <span>Thought for {(activeVersion.executionDuration / 1000).toFixed(2)}s</span>
                    </div>
                )}
            </div>

            {/* Actions & Arrows */}
            <div className={cn(
                "absolute bottom-0 translate-y-full flex items-center gap-1 opacity-0 transition-opacity py-1",
                isHovered || versionCount > 1 ? "opacity-100" : "opacity-0 pointer-events-none",
                role === 'user' ? "right-0" : "left-0"
            )}>
                {/* Version Toggle - Only for User */}
                {versionCount > 1 && role === 'user' && (
                    <div className="flex items-center gap-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 rounded-md px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700">
                        <button onClick={() => handleSwitch('prev')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-0.5 disabled:opacity-50 text-zinc-500" disabled={currentVersionIdx === 0}>
                            <ChevronLeft className="w-3 h-3" />
                        </button>
                        <span className="min-w-[12px] text-center text-[10px] text-zinc-500 dark:text-zinc-400">
                            {currentVersionIdx + 1}/{versionCount}
                        </span>
                        <button onClick={() => handleSwitch('next')} className="hover:text-zinc-900 dark:hover:text-zinc-100 p-0.5 disabled:opacity-50 text-zinc-500" disabled={currentVersionIdx === versionCount - 1}>
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {!isEditing && (
                    <>
                        <button onClick={handleCopy} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" title="Copy text">
                            <Copy className="w-3 h-3" />
                        </button>
                        {role === 'assistant' && onRegenerate && (
                            <button onClick={onRegenerate} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" title="Regenerate">
                                <RotateCw className="w-3 h-3" />
                            </button>
                        )}
                    </>
                )}
            </div>
        </motion.div >
    )
}


function TurnItem({ turn, isLast, onEditTurn, onRegenerateTurn, onSetTurnVersion, editingId, setEditingId, onOpenExport, onCopy }: {
    turn: Turn,
    isLast: boolean,
    onEditTurn: (id: string, text: string) => void,
    onRegenerateTurn: (id: string) => void,
    onSetTurnVersion: (id: string, role: 'user' | 'assistant', idx: number) => void,
    editingId: string | null,
    setEditingId: (id: string | null) => void,
    onOpenExport: (code: string, onRegen?: () => void) => void,
    onCopy: () => void
}) {
    // 1. User Message
    const userBubble = (
        <MessageBubble
            turnId={turn.id}
            role="user"
            stack={turn.user}
            onSetVersion={(idx) => onSetTurnVersion(turn.id, 'user', idx)}
            onEdit={(txt) => onEditTurn(turn.id, txt)}
            isEditing={editingId === `${turn.id}-user`}
            setEditingId={(id) => setEditingId(id ? `${turn.id}-user` : null)}
            onCopy={onCopy}
        />
    );

    // 2. Assistant Message
    const showAssistant = turn.assistant.versions.length > 0 || turn.status === 'generating';

    let assistantBubble = null;
    if (showAssistant) {
        // Show thinking if generating AND active version is empty (regardless of how many past versions exist)
        const activeVerIdx = turn.assistant.activeIndex;
        const activeVer = turn.assistant.versions[activeVerIdx];

        const isThinking = turn.status === 'generating' && (
            !activeVer || activeVer.content === ''
        );

        if (isThinking) {
            // Thinking Bubble
            assistantBubble = (
                <div className="flex justify-start mb-6">
                    <div className="max-w-[80%] rounded-2xl p-4 shadow-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-bl-sm">
                        <ThinkingIndicator />
                    </div>
                </div>
            );
        } else {
            assistantBubble = (
                <div className="flex flex-col mb-6">
                    <MessageBubble
                        turnId={turn.id}
                        role="assistant"
                        stack={turn.assistant}
                        onSetVersion={(idx) => onSetTurnVersion(turn.id, 'assistant', idx)}
                        onRegenerate={() => {
                            setEditingId(`${turn.id}-user`);
                        }}
                        onOpenExport={onOpenExport}
                        executionDuration={turn.executionDuration}
                        onCopy={onCopy}
                    />
                </div>
            );
        }
    }

    return (
        <div className="flex flex-col">
            <MessageBubble
                turnId={turn.id}
                role="user"
                stack={turn.user}
                onSetVersion={(idx) => {
                    onSetTurnVersion(turn.id, 'user', idx);
                    // Sync assistant version if possible (simple 1:1 mapping assumption for now)
                    if (turn.assistant.versions.length > idx) {
                        onSetTurnVersion(turn.id, 'assistant', idx);
                    } else if (turn.assistant.versions.length > 0) {
                        onSetTurnVersion(turn.id, 'assistant', turn.assistant.versions.length - 1);
                    }
                }}
                onEdit={(txt) => onEditTurn(turn.id, txt)}
                isEditing={editingId === `${turn.id}-user`}
                setEditingId={(id) => setEditingId(id ? `${turn.id}-user` : null)}
                onCopy={onCopy}
            />
            {assistantBubble}
        </div>
    );
}

export function AppShell() {
    const {
        history,
        currentSessionId,
        loadHistory,
        loadSession,
        saveSession,
        deleteSession,
        deleteAllSessions,
        exportSession,
        renameSession,
        reorderHistory,
        submitUserMessage,
        regenerateTurn,
        editTurn,
        setTurnVersion,
        isProcessing,
        setTranscript,
        cancelGeneration,
        uploadAudio,
        projects,
        createProject,
        deleteProject,
        renameProject,
        moveSessionToProject,
        isRightPanelOpen,
        openRightPanel,
        closeRightPanel
    } = useProcessStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null); // Hidden input for upload
    const [inputValue, setInputValue] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [stagedFile, setStagedFile] = useState<File | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [activeView, setActiveView] = useState<'chat' | 'todo' | 'inbox'>('chat');

    // Export Modal State
    const [exportModal, setExportModal] = useState<{ isOpen: boolean, code: string, onRegen?: () => void }>({
        isOpen: false, code: ''
    });

    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectModalName, setProjectModalName] = useState('');
    const [projectModalColor, setProjectModalColor] = useState('#3b82f6'); // Default blue

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const [searchQuery, setSearchQuery] = useState('');

    const filteredHistory = history.filter(h =>
        (h.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentSession = history.find(s => s.id === currentSessionId);
    const turns = currentSession?.turns || [];

    const handleCopyToast = () => {
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };



    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // Check if dropped on local project target (droppable)
        // Data is passed as { type: 'project', projectId: ... } in useDroppable
        const overData = over.data.current;
        if (overData && overData.type === 'project') {
            moveSessionToProject(active.id as string, overData.projectId);
            return;
        }

        // Dropped on "All Chats" area
        if (over.id === 'uncategorized-root') {
            moveSessionToProject(active.id as string, null);
            return;
        }

        // Reordering
        if (active.id !== over.id) {
            const oldIndex = history.findIndex((item) => item.id === active.id);
            const newIndex = history.findIndex((item) => item.id === over.id);
            // Only reorder if both valid indices (though findIndex checks help)
            if (oldIndex !== -1 && newIndex !== -1) {
                const newHistory = arrayMove(history, oldIndex, newIndex);
                reorderHistory(newHistory);
            }
        }
    };

    const handleRenameSubmit = async (id: string, newTitle: string) => {
        if (newTitle.trim()) {
            await renameSession(id, newTitle.trim());
        }
        setEditingId(null);
    };

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // Scroll Management
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        chatEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (turns.length > 0) {
            const lastTurn = turns[turns.length - 1];
            if (lastTurn.status === 'generating' || (Date.now() - lastTurn.user.versions[0].timestamp < 1000)) {
                scrollToBottom();
            }
        }
    }, [turns.length, turns[turns.length - 1]?.status]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setStagedFile(file);
            e.target.value = '';
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], "recording.webm", { type: "audio/webm" });
                setStagedFile(file);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };


    const handleAnalyze = async () => {
        const text = inputValue.trim();
        if (!text && !stagedFile) return;

        setInputValue('');
        setStagedFile(null);

        if (stagedFile) {
            await uploadAudio(stagedFile, text);
        } else {
            await submitUserMessage(text);
        }
    };

    const handleNewProject = async () => {
        setIsProjectModalOpen(true);
    };

    return (
        <div className="flex h-screen w-full bg-zinc-900 text-zinc-100 overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Nav Rail */}
            <NavRail
                activeView={activeView}
                onViewChange={setActiveView}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Inbox View */}
                {activeView === 'inbox' && (
                    <InboxView
                        onOpenSession={(session) => {
                            loadSession(session);
                            setActiveView('chat');
                        }}
                    />
                )}

                {/* Chat View */}
                <div className={cn("flex flex-1 overflow-hidden h-full", activeView === 'chat' ? 'flex' : 'hidden')}>
                    {/* Sidebar */}
                    <AnimatePresence mode='wait'>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 260, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="flex-shrink-0 bg-zinc-950 text-zinc-400 flex flex-col h-full border-r border-zinc-800 overflow-hidden"
                            >
                                <div className="p-4 space-y-4">
                                    {/* Header Title (No Logo) */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-xl font-bold text-white tracking-tight">Chat Session</h2>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                useProcessStore.setState({ currentSessionId: null, currentTranscript: '' });
                                                setInputValue(''); // Clear input
                                                setStagedFile(null); // Clear file
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            <span>New Chat</span>
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search chats..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-md py-2 pl-9 pr-3 text-sm text-zinc-200 focus:outline-none placeholder:text-zinc-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">

                                    {/* Recent Chats (Last 2 Accessed) */}
                                    {history.filter(h => h.lastAccessedAt).length > 0 && (
                                        <div className="mb-6 space-y-1">
                                            <div className="text-xs font-semibold text-zinc-500 mb-2 px-2 uppercase tracking-wider">Quick Access</div>
                                            {history
                                                .filter(h => h.lastAccessedAt)
                                                .sort((a, b) => (b.lastAccessedAt || 0) - (a.lastAccessedAt || 0))
                                                .slice(0, 2)
                                                .map(s => (
                                                    <div
                                                        key={`recent-${s.id}`}
                                                        onClick={() => loadSession(s)}
                                                        className={cn(
                                                            "group flex items-center w-full px-3 py-2 rounded-md transition-colors cursor-pointer relative",
                                                            s.id === currentSessionId
                                                                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                                        )}
                                                    >
                                                        <Clock className="w-4 h-4 mr-2 opacity-70" />
                                                        <span className="truncate text-xs flex-1">{s.title}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <div className="space-y-1 mb-6">
                                                <div className="flex items-center justify-between px-2 mb-2 group">
                                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Projects</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setIsProjectModalOpen(true); }}
                                                        className="p-1 hover:bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-all text-zinc-500 hover:text-zinc-300"
                                                        title="Add Project"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                {projects.map(project => (
                                                    <ProjectItem
                                                        key={project.id}
                                                        project={project}
                                                        isActive={false}
                                                        onSelect={(id) => { }}
                                                        onDelete={deleteProject}
                                                        onRename={renameProject}
                                                    >
                                                        <SortableContext
                                                            items={history.filter(s => s.projectId === project.id).map(s => s.id)}
                                                            strategy={verticalListSortingStrategy}
                                                            disabled={editingId !== null}
                                                        >
                                                            <div className="space-y-0.5">
                                                                {history.filter(s => s.projectId === project.id).map(s => (
                                                                    <SortableSessionItem
                                                                        key={s.id}
                                                                        session={s}
                                                                        isActive={currentSessionId === s.id}
                                                                        onLoad={loadSession}
                                                                        onExport={exportSession}
                                                                        onDelete={deleteSession}
                                                                        onRename={setEditingId}
                                                                        isEditing={editingId === s.id}
                                                                        onRenameSubmit={handleRenameSubmit}
                                                                        onRenameCancel={() => setEditingId(null)}
                                                                    />
                                                                ))}
                                                                {history.filter(s => s.projectId === project.id).length === 0 && (
                                                                    <div className="pl-6 text-xs text-zinc-400 italic py-1">Empty</div>
                                                                )}
                                                            </div>
                                                        </SortableContext>
                                                    </ProjectItem>
                                                ))}
                                            </div>

                                            <DroppableArea id="uncategorized-root" className="min-h-[100px]">
                                                <SortableContext
                                                    items={history.filter(h => !h.projectId).map(h => h.id)} // Only uncategorized are sortable in the main list
                                                    strategy={verticalListSortingStrategy}
                                                    disabled={editingId !== null}
                                                >
                                                    <div className="space-y-1">

                                                        <div className="text-xs font-semibold text-zinc-500 mb-2 px-2 uppercase tracking-wider">All Chats</div>
                                                        {history.filter(h => !h.projectId).map((session) => (
                                                            <div key={session.id} className={editingId !== null && editingId !== session.id ? "pointer-events-none opacity-50" : ""}>
                                                                <SortableSessionItem
                                                                    session={session}
                                                                    isActive={currentSessionId === session.id}
                                                                    onLoad={loadSession}
                                                                    onExport={exportSession}
                                                                    onDelete={deleteSession}
                                                                    onRename={setEditingId}
                                                                    isEditing={editingId === session.id}
                                                                    onRenameSubmit={handleRenameSubmit}
                                                                    onRenameCancel={() => setEditingId(null)}
                                                                />
                                                            </div>
                                                        ))}
                                                        {history.filter(h => !h.projectId).length === 0 && (
                                                            <div className="text-xs text-zinc-500 px-4 py-2 italic text-center">No uncategorized chats</div>
                                                        )}
                                                    </div>
                                                </SortableContext>
                                            </DroppableArea>

                                            <DragOverlay>
                                                {activeId ? (
                                                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 opacity-90 cursor-grabbing w-[240px]">
                                                        <div className="flex items-center gap-2">
                                                            <MessageSquare className="w-4 h-4 text-zinc-400" />
                                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">
                                                                {history.find(h => h.id === activeId)?.title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </DragOverlay>
                                        </DndContext>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex-1 flex flex-col h-full relative bg-white dark:bg-zinc-900 transition-colors duration-300">
                        {/* Header Removed as per request */}

                        <div className="flex-1 overflow-y-auto scrollbar-custom relative">
                            {turns.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    {/* ... Empty Stats ... */}
                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full shadow-xl flex items-center justify-center mb-6">
                                        <Activity className="w-8 h-8 text-black dark:text-white" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">What process are we mapping today?</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4 mt-8">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="*/*"
                                            onChange={handleFileUpload}
                                        />
                                        <div
                                            onClick={() => toggleRecording()}
                                            className={cn(
                                                "p-4 border rounded-xl cursor-pointer transition-all group",
                                                isRecording
                                                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Mic className={cn("w-5 h-5 mt-1", isRecording ? "text-red-500 animate-pulse" : "text-zinc-500")} />
                                                <div>
                                                    <h3 className="font-medium text-sm text-zinc-800 dark:text-zinc-200">
                                                        {isRecording ? "Stop Recording" : "Record Audio"}
                                                    </h3>
                                                    <p className="text-xs text-zinc-500 mt-1">Transcribe Meet/Zoom calls</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-all group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <FileText className="w-5 h-5 text-zinc-500 mt-1" />
                                                <div>
                                                    <h3 className="font-medium text-sm text-zinc-800 dark:text-zinc-200">Upload File</h3>
                                                    <p className="text-xs text-zinc-500 mt-1">Analyze existing text/audio</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto space-y-6 pt-8 pb-32">
                                    {turns.map((turn, idx) => (
                                        <TurnItem
                                            key={turn.id}
                                            turn={turn}
                                            isLast={idx === turns.length - 1}
                                            onEditTurn={editTurn}
                                            onRegenerateTurn={regenerateTurn}
                                            onSetTurnVersion={setTurnVersion}
                                            editingId={editingId}
                                            setEditingId={setEditingId}
                                            onOpenExport={(code, onRegen) => {
                                                setExportModal({ isOpen: true, code, onRegen });
                                            }}
                                            onCopy={handleCopyToast}
                                        />
                                    ))}
                                    {/* Scroll anchor only follows NEW items now */}
                                    <div ref={chatEndRef} />
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-900 dark:via-zinc-900 pt-10">
                            <div className="max-w-3xl mx-auto">
                                <div className="relative">
                                    {stagedFile && (
                                        <div className="absolute -top-12 left-0 right-0 flex items-center gap-2">
                                            <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm animate-in slide-in-from-bottom-2 fade-in">
                                                <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium max-w-[200px] truncate text-zinc-700 dark:text-zinc-200">{stagedFile.name}</span>
                                                    <span className="text-[10px] text-zinc-500">{(stagedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                                </div>
                                                <button
                                                    onClick={() => setStagedFile(null)}
                                                    className="ml-2 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative flex items-center bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm focus-within:ring-2 focus-within:ring-zinc-500/20 focus-within:border-zinc-500 transition-all">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 hover:shadow-sm rounded-l-xl transition-all"
                                            title="Attach File"
                                            disabled={isRecording}
                                        >
                                            <Paperclip className="w-5 h-5" />
                                        </button>

                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                                            placeholder={
                                                isRecording ? "Recording audio..." :
                                                    stagedFile ? "Add a message..." : "Describe a process or paste text..."
                                            }
                                            className="flex-1 bg-transparent p-4 outline-none text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
                                            disabled={isProcessing || isRecording}
                                        />

                                        <div className="flex items-center gap-1 pr-2">
                                            <button
                                                onClick={toggleRecording}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all duration-200",
                                                    isRecording
                                                        ? "text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 hover:shadow-sm"
                                                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 hover:shadow-sm"
                                                )}
                                                title={isRecording ? "Stop Recording" : "Record Audio"}
                                            >
                                                {isRecording ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                                            </button>

                                            <button
                                                onClick={handleAnalyze}
                                                disabled={isProcessing || (!inputValue.trim() && !stagedFile) || isRecording}
                                                className="p-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity ml-1"
                                            >
                                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                </div>
                                <div className="text-center mt-2 text-[10px] text-zinc-400">
                                    Process Mapper can make mistakes. Verify important maps.
                                </div>
                            </div>
                        </div>
                    </div>

                </div> {/* End Chat View Container */}

                {/* To-Do View */}
                {
                    activeView === 'todo' && (
                        <KanbanBoard />
                    )
                }

            </div > {/* End Main Content Area */}

            <AnimatePresence>
                {
                    showCopiedToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
                        >
                            <Activity className="w-4 h-4" />
                            <span className="">Copied to clipboard!</span>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                        >
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
                                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Settings</h3>
                                <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full">
                                    <X className="w-4 h-4 text-zinc-500" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-lg shadow-md">
                                        AL
                                    </div>
                                    <div>
                                        <div className="font-medium text-zinc-900 dark:text-zinc-100">Andro Louw</div>
                                        <div className="text-xs text-zinc-500">andro@example.com</div>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-full uppercase tracking-wider">
                                            Pro
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={deleteAllSessions}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium border border-red-100 dark:border-red-900/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Clear All History
                                    </button>
                                </div>

                                <div className="text-center text-[10px] text-zinc-400 pt-4">
                                    Process Mapper v1.0.0 • Build 2024.1
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
                {isRightPanelOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 400, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex-shrink-0 relative z-40"
                        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, height: '100%' }} // Ensure absolute constraint
                    >
                        <RightPanel />
                    </motion.div>
                )}
            </AnimatePresence>

            <ExportModal
                isOpen={exportModal.isOpen}
                onClose={() => setExportModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => {
                    window.open('https://app.diagrams.net/?splash=0', '_blank');
                    setExportModal(prev => ({ ...prev, isOpen: false }));
                }}
                onRegenerate={exportModal.onRegen}
                code={exportModal.code}
            />
            <CreateProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onCreate={createProject}
            />
        </div >
    );
}
