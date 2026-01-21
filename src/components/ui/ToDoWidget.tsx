
import { cn } from "@/lib/utils";

interface ToDoWidgetProps {
    percentage: number;
    onClick: () => void;
    isActive: boolean;
}

export function ToDoWidget({ percentage, onClick, isActive }: ToDoWidgetProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "w-12 h-24 rounded-2xl relative cursor-pointer transition-all duration-300 group overflow-hidden border border-white/10 shadow-lg",
                isActive
                    ? "bg-gradient-to-b from-orange-400 to-orange-600 shadow-orange-500/20 scale-105"
                    : "bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-600"
            )}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-between py-3">
                <div className="flex flex-col items-center">
                    <span className={cn("text-lg font-bold", isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200")}>
                        {percentage}<span className="text-[10px]Align-top">%</span>
                    </span>
                    <div className={cn("w-6 h-0.5 rounded-full mt-1", isActive ? "bg-white/50" : "bg-zinc-600")} />
                </div>

                <span className={cn("text-[10px] font-bold tracking-wider", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-400")}>
                    TO DO
                </span>
            </div>
        </div>
    );
}
