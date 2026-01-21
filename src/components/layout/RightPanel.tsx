
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Clock, Calendar } from "lucide-react";
import { useProcessStore } from "@/store/useProcessStore";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";

export function RightPanel() {
    const { isRightPanelOpen, rightPanelSessionId, currentSessionId, history, closeRightPanel } = useProcessStore();
    const session = history.find(s => s.id === (rightPanelSessionId || currentSessionId));

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeRightPanel();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeRightPanel]);

    return (
        <AnimatePresence>
            {isRightPanelOpen && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 400, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shadow-xl z-20"
                >
                    {/* Header */}
                    <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 bg-zinc-50 dark:bg-zinc-950/50">
                        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200 font-medium">
                            <MessageSquare className="w-4 h-4" />
                            <span className="truncate max-w-[200px]" title={session?.title}>
                                {session?.title || "Conversation Detail"}
                            </span>
                        </div>
                        <button
                            onClick={closeRightPanel}
                            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
                        {!session ? (
                            <div className="text-center text-zinc-500 mt-10 italic">Session not found</div>
                        ) : (
                            <>
                                {/* Meta Info */}
                                <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800/50 space-y-2 text-xs text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        <span>Created {new Date(session.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {session.projectId && (
                                        <div className="flex items-center gap-2 mt-1 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                                In Project
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Chat Turns (Read Only) */}
                                <div className="space-y-6">
                                    {session.turns.map((turn, idx) => (
                                        <div key={turn.id} className="space-y-3">
                                            {/* User Message */}
                                            <div className="flex justify-end">
                                                <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-2 rounded-2xl rounded-tr-sm max-w-[90%] text-sm">
                                                    {turn.user.versions[turn.user.activeIndex]?.content}
                                                </div>
                                            </div>

                                            {/* Assistant Message */}
                                            {turn.assistant.versions[turn.assistant.activeIndex] && (
                                                <div className="flex justify-start">
                                                    <div className="text-zinc-600 dark:text-zinc-300 max-w-[95%] text-sm prose dark:prose-invert prose-sm">
                                                        <ReactMarkdown>
                                                            {turn.assistant.versions[turn.assistant.activeIndex].content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}

                                            {idx < session.turns.length - 1 && (
                                                <div className="mx-auto w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
