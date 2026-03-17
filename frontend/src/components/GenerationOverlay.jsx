// src/components/GenerationOverlay.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

export default function GenerationOverlay() {
    const [stepIndex, setStepIndex] = useState(0);

    const messages = [
        "Reading your raw experience...",
        "Converting text to vectors using Google Embeddings...",
        "Fact-checking: Securing data against AI hallucinations...",
        "Matching your true skills to the job requirements...",
        "Formatting into an ATS-friendly structure...",
        "Finalizing your optimized resume..."
    ];

    useEffect(() => {
        // Blocks scrolling while overlay is active
        document.body.style.overflow = 'hidden';

        // Cycle text exactly every 2 seconds
        const interval = setInterval(() => {
            setStepIndex((prev) => {
                // Stop on the final message
                if (prev >= messages.length - 1) return prev;
                return prev + 1;
            });
        }, 2000);

        return () => {
            clearInterval(interval);
            document.body.style.overflow = 'unset';
        };
    }, [messages.length]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
        >
            {/* Heavy Blur Glass Backdrop */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl" />

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-lg">

                {/* Sleek Pulse & Spinner UI */}
                <motion.div
                    className="relative mb-12 flex items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {/* Subtle glowing ring behind */}
                    <div className="absolute inset-0 bg-indigo-300/40 rounded-full blur-[30px] w-40 h-40 -m-12 animate-pulse" />

                    {/* Beautiful Glass Icon Container */}
                    <div className="relative w-20 h-20 bg-gradient-to-tr from-slate-900 to-indigo-900 rounded-[2rem] shadow-[0_20px_40px_rgba(30,27,75,0.2)] border border-slate-700/50 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        >
                            <Loader2 size={36} strokeWidth={2.5} className="text-white" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Animated Message Cycler */}
                <div className="h-16 flex items-center justify-center overflow-hidden w-full relative">
                    <AnimatePresence mode="wait">
                        <motion.h3
                            key={stepIndex}
                            initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                            exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 text-center absolute w-full"
                        >
                            {messages[stepIndex]}
                        </motion.h3>
                    </AnimatePresence>
                </div>

                {/* Trust Badging below component */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex items-center gap-2 text-indigo-600 bg-indigo-50/50 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-100 shadow-sm"
                >
                    <Sparkles size={14} className="animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-800">Processing locally</span>
                </motion.div>

            </div>
        </motion.div>
    );
}
