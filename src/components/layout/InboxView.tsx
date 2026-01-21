
import { useProcessStore } from '@/store/useProcessStore';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Calendar, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InboxViewProps {
    onOpenSession: (session: any) => void;
}

export function InboxView({ onOpenSession }: InboxViewProps) {
    const { history, projects } = useProcessStore();

    // Sort items by date (newest first)
    const sortedHistory = [...history].sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className="flex-1 h-full bg-zinc-900 text-zinc-100 flex flex-col p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
                <div className="text-zinc-500 text-sm">
                    {history.length} conversations
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                <div className="grid gap-2">
                    {sortedHistory.map(session => {
                        const project = projects.find(p => p.id === session.projectId);

                        return (
                            <div
                                key={session.id}
                                onClick={() => onOpenSession(session)}
                                className="group flex items-start gap-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                            >
                                <div className="mt-1 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                                    <MessageSquare className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-base font-semibold text-zinc-200 group-hover:text-white truncate pr-4">
                                            {session.title || "Untitled Conversation"}
                                        </h3>
                                        <span className="text-xs text-zinc-500 flex-shrink-0">
                                            {formatDistanceToNow(session.createdAt, { addSuffix: true })}
                                        </span>
                                    </div>

                                    <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                                        {/* Show last message preview if available, else generic text */}
                                        {session.turns.length > 0
                                            ? (session.turns[session.turns.length - 1].assistant.versions[0]?.content || session.turns[session.turns.length - 1].user.versions[0]?.content || "No content")
                                            : "Empty conversation"
                                        }
                                    </p>

                                    <div className="flex items-center gap-3">
                                        {project && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                                                <Folder className="w-3 h-3" style={{ color: project.color }} />
                                                <span>{project.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {history.length === 0 && (
                        <div className="text-center py-20 text-zinc-500">
                            <h3 className="text-lg font-medium text-zinc-400 mb-2">No conversations yet</h3>
                            <p>Start a new chat to see it here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
