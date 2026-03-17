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
        // Animate score count-up
        let start = 0;
        const duration = 1500;
        const increment = score / (duration / 16); // 60fps

        const timer = setInterval(() => {
            start += increment;
            if (start >= score) {
                setCurrentScore(score);
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

    const conf = colorConfig[color];

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white/60 backdrop-blur-md rounded-[1.5rem] border border-white shadow-sm relative group">
            <div className={`relative w-24 h-24 mb-2 rounded-full flex items-center justify-center bg-white ${conf.glow} transition-shadow duration-500 group-hover:shadow-lg`}>
                <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                    {/* Background Track */}
                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                    {/* Animated Progress Ring */}
                    <motion.circle
                        cx="48" cy="48" r="42" stroke={conf.stroke} strokeWidth="6" fill="transparent"
                        strokeDasharray={2 * Math.PI * 42}
                        initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-2xl tracking-tighter font-extrabold ${conf.text}`}>{currentScore}</span>
                    <span className="text-[10px] font-bold text-slate-400 -mt-1">%</span>
                </div>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        </div>
    );
};

export default function OptimizationInsights({ results, insightTab, setInsightTab, matrixPage, setMatrixPage, handleAddToKnowledgeBase, addedSkills, isGenerating }) {
    // Замість const diff = results.optimized_ats_score - results.original_ats_score;
    const diff = Number(results.optimized_ats_score || 0) - Number(results.original_ats_score || 0);
    const isImproved = diff > 0;
    const ToneIcon = results.detected_tone === 'Strategic' ? ShieldCheck : results.detected_tone === 'Technical' ? Zap : Compass;

    const [showScoreInfo, setShowScoreInfo] = useState(false);

    return (
        <div className="flex-1 lg:max-w-md space-y-5 overflow-y-auto hide-scrollbar pb-6 print:hidden">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 px-1">Your Impact Analysis</h2>

            {/* Top Widget: Scores */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-6 relative">
                <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full blur-[60px]" />
                </div>

                <div className="relative z-10">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between relative">
                        <span className="flex items-center gap-2"><Zap size={14} className="text-indigo-500" /> Getting you past the robot filters</span>
                        <div
                            className="relative cursor-help text-slate-300 hover:text-indigo-400 transition-colors"
                            onMouseEnter={() => setShowScoreInfo(true)}
                            onMouseLeave={() => setShowScoreInfo(false)}
                            onClick={() => setShowScoreInfo(!showScoreInfo)}
                        >
                            <Info size={14} />
                            <AnimatePresence>
                                {showScoreInfo && (
                                    <CustomTooltip text="Measures semantic similarity and keyword density between your resume and the JD." />
                                )}
                            </AnimatePresence>
                        </div>
                    </h3>

                    <div className="flex gap-4 items-center mb-5">
                        <ScoreGauge score={results.original_ats_score} label="Base" color="slate" />
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 shrink-0 z-10">
                            <ArrowRight size={16} />
                        </div>
                        <ScoreGauge score={results.optimized_ats_score} label="Tailored" color={results.optimized_ats_score > 80 ? 'green' : 'amber'} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className={`p-4 rounded-xl border flex flex-col gap-1 shadow-sm transition-all ${isImproved ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white/50 border-slate-100'}`}>
                            <div className="flex items-center gap-1.5 opacity-80">
                                <TrendingUp size={14} className={isImproved ? 'text-emerald-600' : 'text-slate-400'} />
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Score Lift</span>
                            </div>
                            <span className={`text-[15px] font-black ${isImproved ? 'text-emerald-600' : 'text-slate-500'}`}>
                                {isImproved ? `+${diff}%` : `${diff}%`}
                            </span>
                        </div>
                        <div className="p-4 rounded-xl border border-indigo-100/50 bg-indigo-50/30 flex flex-col gap-1 shadow-sm">
                            <div className="flex items-center gap-1.5 opacity-80">
                                <ToneIcon size={14} className="text-indigo-600" />
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Matched Tone</span>
                            </div>
                            <span className="text-[15px] font-black text-indigo-600 tracking-tight">
                                {results.detected_tone || 'Professional'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Widget: Roadmap & Matrix */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                <div className="flex bg-slate-50/50 border-b border-slate-200/50 p-1.5">
                    <button
                        onClick={() => setInsightTab('gaps')}
                        className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${insightTab === 'gaps' ? 'bg-white text-indigo-600 shadow-sm border border-white' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                    >
                        <Target size={14} /> Matrix
                    </button>
                    <button
                        onClick={() => setInsightTab('roadmap')}
                        className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${insightTab === 'roadmap' ? 'bg-white text-indigo-600 shadow-sm border border-white' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                    >
                        <TrendingUp size={14} /> Roadmap
                    </button>
                </div>

                <div className="p-5 flex-1 bg-white/30">
                    <AnimatePresence mode="wait">
                        {insightTab === 'gaps' ? (
                            <motion.div key="gaps" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
                                <div className="space-y-5">
                                    {/* Actionable Gaps */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 bg-rose-50 w-max px-2 py-1 rounded-md mb-1">
                                            <AlertTriangle size={12} /> Critical Missing Skills
                                        </h4>
                                        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-1 px-1 whitespace-nowrap">
                                            {results.missing_hard_skills?.length > 0 ? (
                                                results.missing_hard_skills.map((skill, idx) => (
                                                    <div key={idx} className="shrink-0 pl-3 pr-1 py-1 bg-white border border-rose-100 rounded-full flex items-center gap-2 shadow-sm group">
                                                        <span className="text-[12px] font-bold text-slate-700">{skill}</span>
                                                        <button
                                                            onClick={() => handleAddToKnowledgeBase(skill)}
                                                            disabled={addedSkills[skill]}
                                                            className={`p-1.5 rounded-full transition-all ${addedSkills[skill] ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white'}`}
                                                            title={addedSkills[skill] ? "Added to Knowledge Base" : "Learn/Add to Fact Base"}
                                                        >
                                                            {addedSkills[skill] ? <CheckCircle2 size={12} /> : <MessageSquarePlus size={12} />}
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[12px] text-slate-400 italic">No critical gaps found.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Component Extracted: ComparisonMatrix */}
                                    <ComparisonMatrix matrixData={results.keywordMatrix} matrixPage={matrixPage} setMatrixPage={setMatrixPage} isGenerating={isGenerating} />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="roadmap" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} className="relative">
                                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100 rounded-full" />
                                <div className="space-y-5 relative z-10 ml-1">
                                    {results.recommendations?.length > 0 ? (
                                        results.recommendations.map((rec, idx) => (
                                            <div key={idx} className="flex gap-4 items-start group">
                                                <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                                    <span className="text-[10px] font-black">{idx + 1}</span>
                                                </div>
                                                <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{rec}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center">
                                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <ShieldCheck size={20} className="text-emerald-500" />
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Perfect match. No changes needed.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Widget: Facts Integrated */}
            {results.retrieved_achievements?.length > 0 && (
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

            {/* Optimization Impact (Source vs Tailored Diff) */}
            {results.bulletComparisons?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/80 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200/50 bg-slate-50/50 flex items-center gap-2">
                        <Sparkles size={14} className="text-blue-500" />
                        <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Tailored Improvements</h3>
                    </div>
                    <div className="p-4 space-y-7">
                        {results.bulletComparisons.map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-0 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                                {/* Original Fact */}
                                <div className="text-[12px] text-slate-400 italic leading-relaxed pl-3 border-l-2 border-slate-200 ml-1 mb-2">
                                    "{item.old}"
                                </div>
                                <div className="flex -mt-4 mb-1 pl-[9px]">
                                    <div className="w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm relative z-10">
                                        <ArrowRight size={10} className="text-slate-400 rotate-90" />
                                    </div>
                                </div>
                                {/* Tailored Fact */}
                                <div className="text-[13px] text-slate-900 font-medium leading-[1.6] bg-blue-50/30 p-3 rounded-xl border border-blue-100/50 shadow-inner group transition-colors hover:bg-blue-50">
                                    <Sparkles size={12} className="text-blue-400 inline mr-2 -mt-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    {item.new}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

OptimizationInsights.propTypes = {
    results: PropTypes.object.isRequired,
    insightTab: PropTypes.string.isRequired,
    setInsightTab: PropTypes.func.isRequired,
    matrixPage: PropTypes.number.isRequired,
    setMatrixPage: PropTypes.func.isRequired,
    handleAddToKnowledgeBase: PropTypes.func.isRequired,
    addedSkills: PropTypes.object.isRequired,
    isGenerating: PropTypes.bool
};
