import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function WelcomeOverlay({ onDismiss }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
            >
                {/* Backdrop with heavy blur and dark tint to emphasize the inputs */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
                    className="relative z-10 bg-white/90 backdrop-blur-2xl rounded-[2rem] p-8 md:p-12 max-w-xl text-center shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-white/50"
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
                        <Sparkles size={32} className="text-white" />
                    </div>
                    
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        Welcome to Career Copilot
                    </h2>
                    
                    <p className="text-slate-600 text-[15px] leading-relaxed mb-8 max-w-md mx-auto">
                        Your AI-powered career assistant. Let's get started by preparing your resume for your next big opportunity.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
                        <div className="flex flex-col items-center gap-2">
                            <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black font-mono shadow-inner border border-slate-200">1</span>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Master Resume</span>
                        </div>
                        <ArrowRight className="text-slate-300 hidden sm:block" />
                        <div className="flex flex-col items-center gap-2">
                            <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black font-mono shadow-inner border border-slate-200">2</span>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Target Job</span>
                        </div>
                        <ArrowRight className="text-slate-300 hidden sm:block" />
                        <div className="flex flex-col items-center gap-2">
                            <span className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black font-mono shadow-inner border border-indigo-200">
                                <Sparkles size={16} />
                            </span>
                            <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">Optimize</span>
                        </div>
                    </div>

                    <button
                        onClick={onDismiss}
                        className="w-full sm:w-auto px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-[0_10px_20px_rgba(15,23,42,0.2)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.3)] hover:-translate-y-0.5 transition-all text-sm tracking-wide"
                    >
                        Got it, let's start
                    </button>
                    
                    <p className="text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-bold">
                        Follow the highlighted steps above
                    </p>
                </motion.div>
                
                {/* Visual pointers/labels for the actual inputs above the backdrop */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-[15vh] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none hidden lg:block"
                >
                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex justify-center">
                            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-xl text-indigo-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 animate-bounce">
                                Step 1 <ArrowRight size={14} className="rotate-90" />
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-xl text-indigo-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 animate-bounce">
                                Step 2 <ArrowRight size={14} className="rotate-90" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
