import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Target } from 'lucide-react';

export default function AIChatShowcase() {
    return (
        <section className="mt-40 relative z-10 w-full max-w-6xl mx-auto px-4">
            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 lg:gap-16 shadow-2xl border border-slate-800">

                {/* Background Glowing Orbs */}
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                {/* Left Side: Headline & Chat Flow */}
                <div className="flex-1 relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/30 mb-6"
                    >
                        <Target size={12} /> Interviewer Mode
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
                    >
                        Don't just edit. <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Extract your impact.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg sm:text-xl leading-relaxed font-medium text-balance mb-12"
                    >
                        Our AI acts like a Senior Recruiter. It asks the right questions to find the hidden numbers and metrics that get you hired.
                    </motion.p>

                    <div className="space-y-4 relative">
                        {/* User Bubble */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-blue-600 text-white p-4 rounded-2xl rounded-bl-sm text-sm shadow-lg max-w-[85%] border border-blue-500/50"
                        >
                            "I fixed some routers and helped customers with their internet last year."
                        </motion.div>

                        {/* AI Question Bubble */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="bg-slate-800 text-indigo-300 p-4 rounded-2xl rounded-br-sm text-sm shadow-lg max-w-[85%] ml-auto border border-slate-700 flex items-start gap-3"
                        >
                            <Sparkles size={16} className="shrink-0 mt-1 text-indigo-400" />
                            <span>Great! Roughly <b>how many</b> devices did you handle weekly?</span>
                        </motion.div>
                    </div>
                </div>

                {/* Middle Arrow (Desktop) */}
                <div className="hidden lg:flex items-center justify-center relative z-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="w-16 h-16 bg-slate-800 rounded-full border border-slate-700 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex items-center justify-center text-indigo-400"
                    >
                        <ArrowRight size={28} />
                    </motion.div>
                </div>

                {/* Right Side: Polished Output Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: 0.8 }}
                    className="flex-1 w-full relative z-10 mt-4 lg:mt-0"
                >
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-500">
                        <div className="flex items-center gap-2 mb-5 text-indigo-300 text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-full inline-flex border border-indigo-500/20">
                            <Sparkles size={14} className="text-indigo-400" /> Optimized Result
                        </div>

                        <p className="text-slate-200 font-medium text-lg leading-relaxed relative z-10">
                            <span className="text-white font-bold bg-white/10 px-1 rounded shadow-sm">• Resolved 50+ technical issues weekly</span> through proactive network maintenance, <span className="text-white font-bold bg-white/10 px-1 rounded shadow-sm">reducing downtime by 20%</span>.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}