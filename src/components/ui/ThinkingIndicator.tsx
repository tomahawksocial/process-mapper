import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

export function ThinkingIndicator() {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const start = Date.now();
        const interval = setInterval(() => {
            setElapsed(Date.now() - start);
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-2 min-w-[140px] p-1">
            <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div className="absolute -top-1 -right-1">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                    </div>
                </div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 animate-pulse">
                    Thinking...
                </span>
            </div>
            <div className="flex items-center gap-2 pl-1">
                <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {(elapsed / 1000).toFixed(1)}s elapsed
                </span>
            </div>
        </div>
    );
}
