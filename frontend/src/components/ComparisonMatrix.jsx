import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, ShieldCheck, Info, X as CloseIcon } from 'lucide-react';

export default function ComparisonMatrix({ matrixData, matrixPage, setMatrixPage, isGenerating }) {
    const [selectedSkill, setSelectedSkill] = useState(null);

    // Provide a Skeleton View to lock the height and avoid jumps when matrixData is loading
    if (isGenerating || !matrixData || matrixData.length === 0) {
        return (
            <div className="pt-5 border-t border-slate-200/50 mt-2 h-[450px]">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} className="text-indigo-500" /> Your Skills Match
                    </h4>
                </div>
                {/* Skeleton Matrix Container - Fixed Height */}
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

    const itemsPerPage = 6; 
    const totalPages = Math.ceil(matrixData.length / itemsPerPage);
    const displayedData = matrixData.slice(matrixPage * itemsPerPage, (matrixPage + 1) * itemsPerPage);

    return (
        <div className="pt-5 border-t border-slate-200/50 mt-2 h-[450px]">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} className="text-indigo-500" /> Your Skills Match
                </h4>
            </div>

            {/* Matrix Container - Fixed Height */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col relative overflow-hidden h-[380px]">
                
                {/* Table View */}
                <div className="flex-1 relative overflow-y-auto hide-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/60">
                            <tr>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill / Keyword</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Match</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            <AnimatePresence mode="wait">
                                {displayedData.map((row, idx) => (
                                    <motion.tr 
                                        key={`${matrixPage}-${idx}`}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setSelectedSkill(row)}
                                        className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors leading-snug">
                                                    {row.skill}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {row.in_tailored ? (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md">Matched</span>
                                                ) : row.in_original ? (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-md">Dropped</span>
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-md">Missing</span>
                                                )}
                                                <ChevronDown size={14} className="text-slate-300 -rotate-90 group-hover:text-indigo-400 transition-colors" />
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Fixed Pagination Footer */}
                <div className="bg-slate-50/50 border-t border-slate-200/60 p-3 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                        {matrixPage + 1} of {totalPages}
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
                                <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex flex-col gap-1 items-center flex-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Original</span>
                                        {selectedSkill.in_original ? <Check size={20} className="text-emerald-500" strokeWidth={3} /> : <X size={20} className="text-rose-400" strokeWidth={3} />}
                                    </div>
                                    <div className="w-px h-10 bg-slate-200"></div>
                                    <div className="flex flex-col gap-1 items-center flex-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Tailored</span>
                                        {selectedSkill.in_tailored ? <Check size={20} className="text-indigo-500" strokeWidth={3} /> : <X size={20} className="text-rose-400" strokeWidth={3} />}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
                                        <Info size={14} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Context</span>
                                    </div>
                                    <p className="text-[13px] text-slate-600 leading-relaxed">
                                        ATS systems scan your resume for this keyword. 
                                        {selectedSkill.in_tailored 
                                            ? " Consistently matching this skill helps you bypass automated filters and reach human recruiters faster."
                                            : " Since this skill was not found in your original data, we could not safely add it. If you have experience in this area, use the AI Chat to update your profile!"}
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
    isGenerating: PropTypes.bool
};
