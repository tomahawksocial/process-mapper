'use client';

import { useProcessStore } from '@/store/useProcessStore';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';
import { useState } from 'react';
import { ExplodingText } from '@/components/ui/ExplodingText';
import { AppShell } from '@/components/layout/AppShell';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  // const { nodes } = useProcessStore(); // Removed unused nodes
  const [hasEntered, setHasEntered] = useState(false);
  const [triggerExplosion, setTriggerExplosion] = useState(false);

  const handleEnter = () => {
    setTriggerExplosion(true);
  };

  if (hasEntered) {
    return <AppShell />;
  }

  return (
    <div className={cn("flex min-h-screen flex-col items-center justify-center p-24 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden")}>
      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            className="flex flex-col items-center space-y-8 z-10"
            exit={{ opacity: 0, transition: { duration: 1 } }}
          >
            {/* Logo Icon */}
            <motion.div
              animate={triggerExplosion ? { scale: 0, opacity: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-800"
            >
              <Activity className="h-12 w-12 text-zinc-900 dark:text-zinc-100" />
            </motion.div>

            {/* Exploding Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-center relative text-zinc-900 dark:text-zinc-100">
              <ExplodingText
                text="Process Mapper"
                trigger={triggerExplosion}
                className="block"
              />
              <ExplodingText
                text=" Version 1.0"
                trigger={triggerExplosion}
                className="block text-zinc-500 dark:text-zinc-400 mt-2"
                onComplete={() => setTimeout(() => setHasEntered(true), 500)}
              />
            </h1>

            {/* Enter Button */}
            <motion.button
              onClick={handleEnter}
              animate={triggerExplosion ? { y: 100, opacity: 0 } : {}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-medium text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Start Building
            </motion.button>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
