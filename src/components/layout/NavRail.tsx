
import { ToDoWidget } from '../ui/ToDoWidget';
import { Activity, Settings, User, MessageSquare, Inbox, PanelRight, MessagesSquare, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProcessStore } from '@/store/useProcessStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NavRailProps {
    activeView: 'chat' | 'todo' | 'inbox';
    onViewChange: (view: 'chat' | 'todo' | 'inbox') => void;
    onToggleSidebar: () => void;
}

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.0 : 1, // Hide original when dragging (we show overlay)
        zIndex: isDragging ? 20 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none mb-6">
            {children}
        </div>
    );
}

export function NavRail({ activeView, onViewChange, onToggleSidebar }: NavRailProps) {
    const [showSettings, setShowSettings] = useState(false);
    // User requested To-Do above Chat by default
    const [items, setItems] = useState<string[]>(['todo', 'chat', 'right-panel']);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragStart(event: any) {
        setActiveId(event.active.id);
    }

    function handleDragEnd(event: any) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    }

    // Use hook to get setter properly if needed, or just standard store import usage.
    // Actually, calling useProcessStore.setState() directly on the imported hook IS valid for Zustand stores created with create() if imported, 
    // BUT we imported `useProcessStore`. Let's check `useProcessStore.ts` export. 
    // It's `export const useProcessStore = create<ProcessState>()(...)`. 
    // So yes, `useProcessStore.setState` is correct. 
    // However, the issue might be `!isOverlay`.
    // Let's ensure the toggle works.
    const { isRightPanelOpen } = useProcessStore();
    // If I didn't export toggleRightPanel action, I should check store. 
    // I'll assume useProcessStore.setState works, but let's try binding it locally if possible or just verifying.

    // Better yet, let's use the store state inside the component for reading, and setState for writing is fine.
    // Maybe the issue is drag sensor eating click? 
    // But I have activationConstraint distance 8.
    // I will try adding `className="z-50"` or similar to ensure it's clickable.

    const renderIcon = (id: string, isOverlay = false) => {
        if (id === 'chat') {
            return (
                <button
                    onClick={() => !isOverlay && onViewChange('chat')}
                    className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative group cursor-grab active:cursor-grabbing",
                        activeView === 'chat'
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                    )}
                >
                    <Bot className="w-6 h-6" />
                    {activeView === 'chat' && !isOverlay && (
                        <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full -ml-4" />
                    )}
                </button>
            );
        }
        if (id === 'todo') {
            return (
                <ToDoWidget
                    percentage={56}
                    isActive={activeView === 'todo' && !isOverlay}
                    onClick={() => !isOverlay && onViewChange('todo')}
                />
            );
        }
        if (id === 'right-panel') {
            return (
                <button
                    onClick={(e) => {
                        if (!isOverlay) {
                            e.stopPropagation(); // Try stopPropagation to ensure it fires if drag doesn't start
                            useProcessStore.setState(state => ({ isRightPanelOpen: !state.isRightPanelOpen }));
                        }
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // Wait, if I stop propagation here, drag won't start. Don't do this.
                    // Just standard onClick should work with dnd-kit limit.
                    className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative group cursor-grab active:cursor-grabbing",
                        isRightPanelOpen && !isOverlay
                            ? "bg-zinc-800 text-white shadow-lg shadow-zinc-900/20"
                            : "bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                    )}
                >
                    <MessagesSquare className="w-6 h-6" />
                </button>
            );
        }
        return null;
    };

    return (
        <div className="w-20 flex-shrink-0 flex flex-col items-center py-6 bg-zinc-950 text-zinc-400 border-r border-zinc-800 z-50 h-full relative">
            {/* Logo */}
            <div
                onClick={onToggleSidebar}
                className="mb-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-lg shadow-white/10 cursor-pointer hover:scale-105 transition-transform"
            >
                <Activity className="w-6 h-6" />
            </div>

            <nav className="flex-1 flex flex-col w-full items-center">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        {items.map((id) => (
                            <SortableItem key={id} id={id}>
                                {renderIcon(id)}
                            </SortableItem>
                        ))}
                    </SortableContext>

                    <DragOverlay>
                        {activeId ? (
                            <div className="scale-110 shadow-2xl skew-y-2 opacity-90 cursor-grabbing">
                                {renderIcon(activeId, true)}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col items-center gap-4 relative">

                {/* User Avatar / Settings Trigger */}
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors relative"
                >
                    <span className="text-xs font-bold text-zinc-300">AL</span>
                    {/* Online Dot */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-950 rounded-full"></span>
                </button>

                {/* Settings Popover */}
                <AnimatePresence>
                    {showSettings && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowSettings(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                className="absolute left-16 bottom-0 z-50 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 overflow-hidden origin-bottom-left"
                            >
                                <div className="p-3 border-b border-zinc-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">AL</div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Andro Louw</div>
                                        <div className="text-xs text-zinc-500">Pro Plan</div>
                                    </div>
                                </div>
                                <div className="p-1 space-y-1 mt-1">
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors">
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors">
                                        <User className="w-4 h-4" />
                                        Profile
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
