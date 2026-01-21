'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ExplodingTextProps {
    text: string;
    className?: string;
    trigger: boolean;
    onComplete?: () => void;
}

export function ExplodingText({ text, className, trigger, onComplete }: ExplodingTextProps) {
    // Split text into characters, preserving spaces
    const characters = text.split('');

    return (
        <div className={className} style={{ display: 'inline-block', perspective: '1000px' }}>
            {characters.map((char, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 1, x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 1 }}
                    animate={trigger ? {
                        opacity: 0,
                        x: (Math.random() - 0.5) * 3000, // Massive X scatter
                        y: (Math.random() - 0.5) * 2000, // Massive Y scatter
                        z: Math.random() * 2000 + 500, // Fly TOWARDS user (positive Z)
                        rotateX: Math.random() * 1080 - 540, // 3D spin
                        rotateY: Math.random() * 1080 - 540,
                        rotateZ: Math.random() * 1080 - 540,
                        scale: Math.random() * 2 + 0.5, // Varying sizes
                    } : {}}
                    transition={{
                        duration: 3.5, // Much slower
                        ease: "easeOut", // Smoother release
                        delay: Math.random() * 0.3
                    }}
                    style={{ display: 'inline-block', whiteSpace: 'pre', transformStyle: 'preserve-3d' }}
                    onAnimationComplete={() => {
                        // Only fire complete on the last character (roughly)
                        if (index === characters.length - 1 && onComplete) {
                            onComplete();
                        }
                    }}
                >
                    {char}
                </motion.span>
            ))}
        </div>
    );
}
