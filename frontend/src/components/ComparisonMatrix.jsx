import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
// APPLE FIX: Додав MessageSquarePlus сюди 👇
import { ChevronDown, ShieldCheck, Info, X as CloseIcon, AlertTriangle, Sparkles, CheckCircle2, Zap, MessageSquarePlus } from 'lucide-react';

export default function ComparisonMatrix({ matrixData, matrixPage, setMatrixPage, isGenerating, potentialBoost = 1 }) {
    const [selectedSkill, setSelectedSkill] = useState(null);

    if (isGenerating || !matrixData || matrixData.length === 0) {
        return (
            <div className="pt-5 border-t border-slate-200/50 mt-2 h-[450px]">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} className="text-indigo-500" /> Your Skills Match
                    </h4>
                </div>
                <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 shadow-inner flex flex-col relative overflow-hidden h-[380px] p-3 space-y-2">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={`skel-${idx}`} className="flex items-center justify-between bg-white/40 rounded-xl border border-slate-100 p-3 h-[46px] animate-pulse">
                            <div className="h-3 bg-slate-200 rounded-full w-24"></div>
                            <div className="h-4 bg-slate-200 rounded-md w-16"></div>
                        </div>
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {!isGenerating && <p className="text-[12px] text-slate-400 italic font-medium bg-white/80 px-4 py-2 rounded-xl backdrop-blur-md shadow-sm border border-slate-200">No keyword data available.</p>}
                    </div>
                </div>
            </div>
        );
    }

    // APPLE LOGIC: Розумне сортування (Missing -> AI Optimized -> Verified)
    const sortedData = [...matrixData].sort((a, b) => {
        const getRank = (item) => {
            if (!item.in_tailored) return 1; // Missing (Пріоритет 1)
            if (!item.in_original && item.in_tailored) return 2; // AI Optimized (Пріоритет 2)
            return 3; // Verified (Пріоритет 3)
        };
        return getRank(a) - getRank(b);
    });

    const itemsPerPage = 6;
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const displayedData = sortedData.slice(matrixPage * itemsPerPage, (matrixPage + 1) * itemsPerPage);

    return (
        <div className="pt-5 border-t border-slate-200/50 mt-2">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} className="text-indigo-500" /> Full Keyword Analysis
                </h4>
            </div>

            {/* Matrix Container */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col relative overflow-hidden h-[420px]">

                {/* Table View */}
                <div className="flex-1 relative overflow-y-auto hide-scrollbar">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60">
                            <tr>
                                <th className="w-[55%] px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Skill / Keyword</th>
                                <th className="w-[45%] px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            <AnimatePresence mode="wait">
                                {displayedData.map((row, idx) => {
                                    const isVerified = row.in_original && row.in_tailored;
                                    const isAI = !row.in_original && row.in_tailored;
                                    const isMissing = !row.in_tailored;

                                    return (
                                        <motion.tr
                                            key={`${matrixPage}-${idx}`}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setSelectedSkill(row)}
                                            className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-4 py-3.5 truncate">
                                                <span className={`text-[13px] font-bold transition-colors leading-snug ${isMissing ? 'text-rose-700' : 'text-slate-700 group-hover:text-indigo-600'}`}>
                                                    {row.skill}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isVerified && (
                                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md flex items-center gap-1 shrink-0" title="Found in your original resume">
                                                            <CheckCircle2 size={10} /> Verified
                                                        </span>
                                                    )}
                                                    {isAI && (
                                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md flex items-center gap-1 shrink-0" title="AI translated your experience to match ATS">
                                                            <Sparkles size={10} /> AI Optimized
                                                        </span>
                                                    )}
                                                    {isMissing && (
                                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-md flex items-center gap-1 shrink-0">
                                                            <AlertTriangle size={10} /> Missing <span className="bg-rose-200/50 px-1 rounded text-rose-700">+{potentialBoost}%</span>
                                                        </span>
                                                    )}
                                                    <ChevronDown size={14} className="text-slate-300 -rotate-90 group-hover:text-indigo-400 transition-colors shrink-0" />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Fixed Pagination Footer */}
                <div className="bg-slate-50/50 border-t border-slate-200/60 p-3 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                        Page {matrixPage + 1} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMatrixPage(Math.max(0, matrixPage - 1))}
                            disabled={matrixPage === 0}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                        >
                            <ChevronDown size={14} className="rotate-90" />
                        </button>
                        <button
                            onClick={() => setMatrixPage(Math.min(totalPages - 1, matrixPage + 1))}
                            disabled={matrixPage >= totalPages - 1}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                        >
                            <ChevronDown size={14} className="-rotate-90" />
                        </button>
                    </div>
                </div>

                {/* ATS Insider Tip */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-100 p-3 shrink-0 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Zap size={12} className="text-amber-600" />
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-0.5">ATS Insider Tip</h5>
                        <p className="text-[11px] text-amber-800/80 leading-snug font-medium">Keywords hold more weight when placed naturally inside your <span className="font-bold">Work Experience</span> bullet points rather than a generic skills list.</p>
                    </div>
                </div>

                {/* Overlay Drawer for "Why this matters" */}
                <AnimatePresence>
                    {selectedSkill && (
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xl flex flex-col border-t border-indigo-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                        >
                            <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-100/50">
                                <h3 className="text-[15px] font-bold text-slate-900 leading-tight pr-4">
                                    {selectedSkill.skill}
                                </h3>
                                <button
                                    onClick={() => setSelectedSkill(null)}
                                    className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0"
                                >
                                    <CloseIcon size={16} />
                                </button>
                            </div>

                            <div className="p-5 flex-1 overflow-y-auto hide-scrollbar space-y-4">
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 justify-center">
                                    {selectedSkill.in_original && selectedSkill.in_tailored && (
                                        <div className="flex flex-col gap-2 items-center text-center">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <CheckCircle2 size={20} className="text-emerald-600" />
                                            </div>
                                            <span className="text-[11px] uppercase font-bold text-emerald-600 tracking-widest">Verified Match</span>
                                        </div>
                                    )}
                                    {!selectedSkill.in_original && selectedSkill.in_tailored && (
                                        <div className="flex flex-col gap-2 items-center text-center">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <Sparkles size={20} className="text-indigo-600" />
                                            </div>
                                            <span className="text-[11px] uppercase font-bold text-indigo-600 tracking-widest">AI Optimized</span>
                                        </div>
                                    )}
                                    {!selectedSkill.in_tailored && (
                                        <div className="flex flex-col gap-3 items-center text-center w-full">
                                            <div className="flex flex-col gap-2 items-center">
                                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                                                    <AlertTriangle size={20} className="text-rose-600" />
                                                </div>
                                                <span className="text-[11px] uppercase font-bold text-rose-600 tracking-widest">Missing Skill</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    document.getElementById('chat-trigger-btn')?.click();
                                                    window.dispatchEvent(new CustomEvent('prefill-chat', {
                                                        detail: `I actually have experience with ${selectedSkill.skill}. Specifically, I used it when I...`
                                                    }));
                                                    setSelectedSkill(null);
                                                }}
                                                className="w-full mt-2 py-2 bg-slate-900 text-white text-[12px] font-bold rounded-xl shadow-md hover:bg-slate-800 flex justify-center items-center gap-2 active:scale-95 transition-all"
                                            >
                                                <MessageSquarePlus size={14} /> Add to AI Chat (+{potentialBoost}%)
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
                                        <Info size={14} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Context</span>
                                    </div>
                                    <p className="text-[13px] text-slate-600 leading-relaxed">
                                        ATS systems scan your resume for this keyword.
                                        {selectedSkill.in_original && selectedSkill.in_tailored && " We found this in your history and ensured it stayed in the tailored version."}
                                        {!selectedSkill.in_original && selectedSkill.in_tailored && " We translated your past experience into this specific corporate keyword to bypass ATS filters."}
                                        {!selectedSkill.in_tailored && " Since this skill was not found in your original data, we could not safely add it. If you have experience in this area, use the AI Chat to update your profile!"}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

ComparisonMatrix.propTypes = {
    matrixData: PropTypes.array,
    matrixPage: PropTypes.number.isRequired,
    setMatrixPage: PropTypes.func.isRequired,
    isGenerating: PropTypes.bool,
    potentialBoost: PropTypes.number
};