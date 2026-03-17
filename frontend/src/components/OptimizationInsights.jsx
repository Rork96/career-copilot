import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Compass, TrendingUp, Info, ArrowRight, AlertTriangle, Sparkles, BrainCircuit, Target, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import ComparisonMatrix from './ComparisonMatrix';

const CustomTooltip = ({ text }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full right-0 mb-3 w-56 p-3 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-slate-700 text-[11px] font-semibold leading-relaxed rounded-xl z-50 pointer-events-none"
        >
            {text}
        </motion.div>
    );
};

const ScoreGauge = ({ score, label, color = 'blue' }) => {
    const [currentScore, setCurrentScore] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const safeScore = Number(score) || 0;
        const increment = safeScore / (duration / 16);

        if (safeScore === 0) {
            setCurrentScore(0);
            return;
        }

        const timer = setInterval(() => {
            start += increment;
            if (start >= safeScore) {
                setCurrentScore(safeScore);
                clearInterval(timer);
            } else {
                setCurrentScore(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [score]);

    const colorConfig = {
        green: { text: 'text-emerald-500', stroke: '#10b981', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
        amber: { text: 'text-amber-500', stroke: '#f59e0b', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
        red: { text: 'text-rose-500', stroke: '#f43f5e', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]' },
        slate: { text: 'text-slate-400', stroke: '#94a3b8', glow: '' },
        blue: { text: 'text-indigo-500', stroke: '#6366f1', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' },
    };

    const conf = colorConfig[color] || colorConfig.blue;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white/60 backdrop-blur-md rounded-[1.5rem] border border-white shadow-sm relative group min-w-0">
            <div className={`relative w-20 h-20 sm:w-24 sm:h-24 mb-2 rounded-full flex items-center justify-center bg-white ${conf.glow} transition-shadow duration-500 group-hover:shadow-lg shrink-0`}>
                <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                    <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                    <motion.circle
                        cx="50%" cy="50%" r="40%" stroke={conf.stroke} strokeWidth="6" fill="transparent"
                        strokeDasharray="251.2"
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 * (1 - (Number(score) || 0) / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-xl sm:text-2xl tracking-tighter font-extrabold ${conf.text}`}>{currentScore}</span>
                    <span className="text-[9px] font-bold text-slate-400 -mt-1">%</span>
                </div>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tighter sm:tracking-widest truncate w-full text-center">
                {label}
            </p>
        </div>
    );
};

export default function OptimizationInsights({ results = {}, insightTab, setInsightTab, matrixPage, setMatrixPage, handleAddToKnowledgeBase, addedSkills = {}, isGenerating }) {
    // APPLE FIX: Safe Math. Захист від крашу, якщо results порожній під час стрімінгу.
    const safeOptimizedScore = Number(results?.optimized_ats_score || 0);
    const safeOriginalScore = Number(results?.original_ats_score || 0);
    const diff = safeOptimizedScore - safeOriginalScore;
    const isImproved = diff > 0;

    // Calculate potential boost for gamification safely
    const missingCount = results?.missing_hard_skills?.length || 1;
    const potentialBoost = Math.max(1, Math.round((100 - safeOptimizedScore) / missingCount)) || 1;

    return (
        <div className="flex-1 lg:max-w-md space-y-5 overflow-y-auto hide-scrollbar pb-6 print:hidden relative">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 px-1">Your Impact Analysis</h2>

            {/* Loading Overlay for Streaming */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 top-10 z-50 bg-slate-50/70 backdrop-blur-md flex flex-col items-center justify-center rounded-[2rem] border border-white/50"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-5 relative overflow-hidden border border-indigo-50">
                            <Zap size={24} className="text-indigo-500 animate-pulse relative z-10" />
                            <motion.div
                                animate={{ top: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent to-indigo-100/60"
                            />
                        </div>
                        <h3 className="text-[13px] font-black uppercase tracking-widest text-indigo-900 mb-2">Analyzing ATS Data</h3>
                        <p className="text-xs text-slate-500 font-medium text-center max-w-[220px] leading-relaxed">Cross-referencing your experience with the employer's algorithm...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Widget: The Diagnosis Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-5 sm:p-6 relative overflow-hidden flex flex-col gap-5">
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -z-10 opacity-50 ${safeOptimizedScore >= 80 ? 'bg-emerald-100' : safeOptimizedScore >= 50 ? 'bg-amber-100' : 'bg-rose-100'}`} />

                <div className="flex justify-between items-start">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Target size={14} className="text-indigo-500" /> ATS Match Analysis
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest bg-white/60 border border-slate-200 px-2 py-1 rounded-md text-slate-500 shadow-sm">
                            {results?.detected_tone?.split('|')[0] || 'Professional'} Tone
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 sm:gap-4 items-center justify-center">
                    <ScoreGauge score={safeOriginalScore} label="Base" color="slate" />
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <ArrowRight size={16} className="text-slate-300" />
                        <span className={`text-[10px] font-black tracking-widest ${isImproved ? 'text-emerald-500' : diff < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {isImproved ? `+${diff}%` : `${diff}%`}
                        </span>
                    </div>
                    <ScoreGauge score={safeOptimizedScore} label="Tailored" color={safeOptimizedScore >= 80 ? 'green' : safeOptimizedScore >= 50 ? 'amber' : 'red'} />
                </div>

                <div className={`mt-2 p-4 rounded-2xl border ${safeOptimizedScore >= 80 ? 'bg-emerald-50/50 border-emerald-100' : safeOptimizedScore >= 50 ? 'bg-amber-50/50 border-amber-100' : 'bg-rose-50/50 border-rose-100'}`}>
                    {safeOptimizedScore >= 80 ? (
                        <div>
                            <p className="text-[14px] font-black text-emerald-900 mb-1 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Excellent Match!</p>
                            <p className="text-[12px] text-emerald-800/80 leading-relaxed">Your resume will easily pass robot filters. We optimized your tone and keywords without fabricating any facts.</p>
                        </div>
                    ) : safeOptimizedScore >= 50 ? (
                        <div>
                            <p className="text-[14px] font-black text-amber-900 mb-1 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-600" /> Fair Match.</p>
                            <p className="text-[12px] text-amber-800/80 leading-relaxed mb-3">You might pass, but competition is tough. Inject some of the missing skills below to boost your score.</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-[14px] font-black text-rose-900 mb-1 flex items-center gap-2"><ShieldCheck size={16} className="text-rose-600" /> High Risk of Auto-Rejection.</p>
                            <p className="text-[12px] text-rose-800/80 leading-relaxed mb-3">Robots will likely filter this out. You are missing core requirements.</p>
                            <button
                                onClick={() => document.getElementById('chat-trigger-btn')?.click()}
                                className="w-full py-2.5 bg-rose-600 text-white text-[12px] font-bold rounded-xl shadow-md hover:bg-rose-700 flex justify-center items-center gap-2 transition-all active:scale-95"
                            >
                                <MessageSquarePlus size={14} /> Fix this with AI Assistant
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 🌟 THE AHA-MOMENT: З'являється тільки при >= 85% */}
            <AnimatePresence>
                {safeOptimizedScore >= 85 && !isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 p-[2px] rounded-2xl shadow-[0_10px_30px_rgba(251,191,36,0.25)]">
                            <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-[15px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-[14px] font-black text-slate-900 flex items-center gap-1.5 mb-1">
                                        <Sparkles size={16} className="text-amber-500" /> ATS Ready! What's Next?
                                    </h4>
                                    <p className="text-[12px] text-slate-600 font-medium">Your resume is a top match. Don't lose momentum—generate a highly targeted Cover Letter now.</p>
                                </div>
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'coverLetter' }))}
                                    className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex justify-center items-center gap-2 active:scale-95"
                                >
                                    Draft Cover Letter <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Middle Widget: Actionable Matrix */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                <div className="p-5 flex-1 bg-white/30 space-y-5">

                    {/* Top Impact Gaps (Capped at 5) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 bg-rose-50 w-max px-2 py-1 rounded-md mb-1">
                                <AlertTriangle size={12} /> High-Impact Gaps
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to Fix</span>
                        </div>

                        <div className="flex flex-wrap gap-2 pb-1">
                            {results?.missing_hard_skills?.length > 0 ? (
                                <>
                                    {results.missing_hard_skills.slice(0, 5).map((skill, idx) => (
                                        <div key={idx} className="shrink-0 pl-3 pr-1 py-1 bg-white border border-rose-100 rounded-full flex items-center gap-2 shadow-sm group hover:border-emerald-200 transition-colors cursor-pointer"
                                            onClick={() => {
                                                handleAddToKnowledgeBase(skill);
                                                document.getElementById('chat-trigger-btn')?.click();
                                                window.dispatchEvent(new CustomEvent('prefill-chat', {
                                                    detail: `I actually have experience with ${skill}. Specifically, I used it when I...`
                                                }));
                                            }}
                                        >
                                            <span className="text-[12px] font-bold text-slate-700 pointer-events-none">
                                                {skill} <span className="text-emerald-500 ml-0.5 text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded-md">+{potentialBoost}%</span>
                                            </span>
                                            <button
                                                disabled={addedSkills?.[skill]}
                                                className={`p-1.5 rounded-full transition-all shadow-sm pointer-events-none ${addedSkills?.[skill] ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white'}`}
                                            >
                                                {addedSkills?.[skill] ? <CheckCircle2 size={12} /> : <MessageSquarePlus size={12} />}
                                            </button>
                                        </div>
                                    ))}
                                    {results.missing_hard_skills.length > 5 && (
                                        <div className="flex items-center justify-center px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-bold text-slate-400">
                                            +{results.missing_hard_skills.length - 5} more in table
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-[12px] text-slate-400 italic">No critical gaps found. You are good to go!</p>
                            )}
                        </div>
                    </div>

                    <ComparisonMatrix matrixData={results?.keywordMatrix || []} matrixPage={matrixPage} setMatrixPage={setMatrixPage} isGenerating={isGenerating} potentialBoost={potentialBoost} />
                </div>
            </div>

            {/* Bottom Widget: Facts Integrated */}
            {results?.retrieved_achievements?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/80 shadow-sm overflow-hidden pt-4 pb-2 px-5">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <BrainCircuit size={14} className="text-purple-500" /> Facts Integrated
                    </h3>
                    <div className="space-y-2 mb-2 max-h-[160px] overflow-y-auto hide-scrollbar">
                        {results.retrieved_achievements.map((fact, idx) => (
                            <div key={idx} className="flex gap-3 items-start p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-purple-200 transition-colors group">
                                <CheckCircle2 size={14} className="text-purple-500 mt-0.5 shrink-0 opacity-70 group-hover:opacity-100" />
                                <p className="text-[12px] text-slate-700 leading-relaxed font-medium">{fact}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

            )}

        </div>
    );
}

OptimizationInsights.propTypes = {
    results: PropTypes.object,
    insightTab: PropTypes.string,
    setInsightTab: PropTypes.func,
    matrixPage: PropTypes.number,
    setMatrixPage: PropTypes.func,
    handleAddToKnowledgeBase: PropTypes.func,
    addedSkills: PropTypes.object,
    isGenerating: PropTypes.bool
};