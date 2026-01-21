
export function KanbanBoard() {
    return (
        <div className="flex-1 h-full bg-zinc-100 dark:bg-zinc-900 p-8 overflow-auto">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">To-Do</h1>
            <div className="flex gap-6 h-full overflow-x-auto pb-4">
                {/* Columns */}
                {['Backlog', 'To Do', 'In Progress', 'Done'].map(col => (
                    <div key={col} className="flex-shrink-0 w-80 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wider">{col}</h2>
                            <span className="text-zinc-400 text-xs">0</span>
                        </div>
                        <div className="flex-1 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 border-dashed">
                            <div className="text-center text-zinc-400 text-sm mt-10">No items</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
