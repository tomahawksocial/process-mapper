import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, Check, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onRegenerate?: () => void;
    code: string;
}

export function ExportModal({ isOpen, onClose, onConfirm, onRegenerate, code }: ExportModalProps) {
    useEffect(() => {
        if (isOpen && code) {
            navigator.clipboard.writeText(code).catch(console.error);
        }
    }, [isOpen, code]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Export to Draw.io</h3>
                        </div>
                        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start gap-3">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-green-700 dark:text-green-500">Code Copied!</div>
                                <div className="text-xs text-green-600/80 dark:text-green-500/80">Mermaid syntax is ready in your clipboard.</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Instructions</div>
                            <ol className="text-sm text-zinc-600 dark:text-zinc-300 space-y-2 list-decimal list-inside bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <li className="pl-1"><span className="text-zinc-500">Click</span> <span className="font-medium text-zinc-900 dark:text-zinc-100">'Arrange'</span> <span className="text-zinc-400 text-xs">(Top Menu)</span></li>
                                <li className="pl-1"><span className="text-zinc-500">Select</span> <span className="font-medium text-zinc-900 dark:text-zinc-100">'Insert'</span></li>
                                <li className="pl-1"><span className="text-zinc-500">Choose</span> <span className="font-medium text-zinc-900 dark:text-zinc-100">'Advanced'</span></li>
                                <li className="pl-1"><span className="text-zinc-500">Click</span> <span className="font-medium text-zinc-900 dark:text-zinc-100">'Mermaid'</span> <span className="text-zinc-500">& Paste</span></li>
                            </ol>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col gap-2">
                        <button
                            onClick={onConfirm}
                            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Continue to Draw.io
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                            {onRegenerate && (
                                <button
                                    onClick={() => {
                                        onRegenerate();
                                        onClose();
                                    }}
                                    className="py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Regenerate Map
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className={cn(
                                    "py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-medium transition-colors",
                                    !onRegenerate ? 'col-span-2' : ''
                                )}
                            >
                                Close & Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// Helper to fix missing cn import if needed, assuming it's available or we add it
import { cn } from '@/lib/utils';
