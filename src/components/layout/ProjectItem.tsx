
import { Project } from "@/lib/types";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Folder, Trash2, ChevronRight, ChevronDown, Pencil } from "lucide-react";
import { useState } from "react";

interface ProjectItemProps {
    project: Project;
    isActive: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, name: string) => void;
    children?: React.ReactNode;
}

export function ProjectItem({ project, isActive, onSelect, onDelete, onRename, children }: ProjectItemProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: `project-${project.id}`,
        data: { type: 'project', projectId: project.id }
    });

    const [isExpanded, setIsExpanded] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(project.name);

    const handleRename = () => {
        if (renameValue.trim() && renameValue !== project.name) {
            onRename(project.id, renameValue);
        }
        setIsRenaming(false);
    };

    return (
        <div className="space-y-1">
            <div
                ref={setNodeRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(project.id);
                    setIsExpanded(!isExpanded);
                }}
                className={cn(
                    "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors relative border border-transparent",
                    isActive ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                    isOver && "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                )}
            >
                <div className="p-1 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors" onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}>
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </div>

                <Folder className="w-4 h-4" style={{ color: project.color }} />

                {isRenaming ? (
                    <input
                        type="text"
                        value={renameValue}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename();
                            if (e.key === 'Escape') setIsRenaming(false);
                        }}
                        autoFocus
                        className="flex-1 bg-transparent border-b border-blue-500 text-sm focus:outline-none px-1 py-0.5"
                    />
                ) : (
                    <span className="flex-1 text-sm font-medium truncate select-none">
                        {project.name}
                    </span>
                )}

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isRenaming && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsRenaming(true);
                                setRenameValue(project.name);
                            }}
                            className="p-1.5 hover:bg-zinc-300 dark:hover:bg-zinc-700/50 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            title="Rename Project"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(project.id);
                        }}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md text-zinc-400 hover:text-red-500 transition-all"
                        title="Delete Project"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {isExpanded && children && (
                <div className="ml-4 pl-2 border-l border-zinc-200 dark:border-zinc-800 space-y-1 mt-1">
                    {children}
                </div>
            )}
        </div>
    );
}
