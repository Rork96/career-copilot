import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
// APPLE FIX: Додано ArrowRight сюди 👇
import { Download, FileText, Check, Copy, Edit3, Loader2, Search, BrainCircuit, Building, ChevronDown, Sparkles, PenTool, Maximize2, Minimize2, ArrowRight } from 'lucide-react';
import ResumePDFTemplate from './ResumePDFTemplate';

// Функція для очистки від ```markdown сміття
const cleanMarkdownArtifacts = (text) => {
    if (!text) return "";
    return text.replace(/```(markdown)?/gi, '').trim();
};

const StreamingMarkdown = ({ content, isStreaming, format = "standard" }) => {
    // Чистимо артефакти LLM та зайві пробіли
    const cleanContent = cleanMarkdownArtifacts(content).replace(/^[ \t]+/gm, '');

    const resumeComponents = {
        h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight border-b-4 border-slate-900 pb-4 mb-8 text-center leading-tight">{children}</h1>,
        h2: ({ children }) => <h2 className="text-[14px] font-black uppercase tracking-widest border-b-2 border-slate-200 mt-10 mb-4 pb-2 text-slate-800">{children}</h2>,
        h3: ({ children }) => <h3 className="text-[13px] font-bold text-slate-900 mt-4 mb-1">{children}</h3>,
        p: ({ children }) => <p className="text-[13px] leading-[1.7] mb-3 text-left text-slate-700 font-medium">{children}</p>,
        ul: ({ children }) => <ul className="mb-4">{children}</ul>,
        li: ({ children }) => <li className="text-[13px] mb-2 leading-[1.7] text-left text-slate-700 ml-4 list-disc font-medium">{children}</li>,
        strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
    };

    const standardComponents = {
        h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-6 pb-4 border-b border-slate-100">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 mt-8 mb-4 flex items-center gap-2"><Sparkles size={16} className="text-indigo-400 hidden sm:block" />{children}</h2>,
        h3: ({ children }) => <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 mt-6 mb-3">{children}</h3>,
        p: ({ children }) => <p className="text-[14px] leading-relaxed text-slate-600 mb-5 font-medium">{children}</p>,
        ul: ({ children }) => <ul className="mb-5 space-y-2.5">{children}</ul>,
        li: ({ children }) => (
            <li className="text-[14px] leading-relaxed text-slate-600 ml-2 flex items-start font-medium">
                <span className="mr-3 mt-[7px] w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0 shadow-sm" />
                <span>{children}</span>
            </li>
        ),
        strong: ({ children }) => <strong className="font-bold text-slate-800">{children}</strong>,
    };

    return (
        <motion.div layout className="relative w-full overflow-x-visible">
            <div className="prose prose-slate max-w-none">
                <ReactMarkdown components={format === "resume" ? resumeComponents : standardComponents}>
                    {cleanContent}
                </ReactMarkdown>
            </div>
            {isStreaming && (
                <span className="inline-block w-[6px] h-[1.2em] bg-indigo-500 rounded-full ml-1 animate-pulse align-middle" />
            )}
        </motion.div>
    );
};

export default function DocumentViewer({
    activeTab, setActiveTab, results, setResults, isEditing, setIsEditing, isExportOpen, setIsExportOpen, copied, handleCopy, handleDownload, handleDownloadPDF, handleDownloadWord, generateCoverLetter, generateInterview, generateResearch, isGenerating, errors
}) {
    const tabs = [
        { id: 'resume', label: 'Resume', icon: PenTool },
        { id: 'coverLetter', label: 'Cover Letter', icon: FileText },
        { id: 'research', label: 'Company Research', icon: Building },
        { id: 'interview', label: 'Interview Q&A', icon: BrainCircuit },
    ];

    const tabVariants = {
        hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.2, ease: "easeIn" } }
    };

    return (
        <div className="flex-1 min-w-0 max-w-full overflow-y-auto bg-[#F8FAFC] rounded-[2rem] flex flex-col relative print:col-span-3 print:w-full print:shadow-none print:border-none print:bg-white print:overflow-visible border border-slate-200/50 shadow-inner">

            <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-5 print:hidden">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">

                    <div className="flex w-full xl:w-auto overflow-x-auto hide-scrollbar pb-2 xl:pb-0 -mx-4 px-4 xl:mx-0 xl:px-0">
                        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/60 min-w-max">
                            {tabs.map((tab, index) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                const hasData = results[tab.id] && results[tab.id].length > 10;

                                return (
                                    <React.Fragment key={tab.id}>
                                        <button
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`relative px-4 sm:px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 outline-none ${isActive
                                                ? 'text-indigo-700 shadow-sm'
                                                : hasData
                                                    ? 'text-slate-600 hover:bg-slate-200/50'
                                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                                                }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTabMarker"
                                                    className="absolute inset-0 bg-white rounded-xl -z-10 shadow-[0_2px_15px_rgba(0,0,0,0.06)] border border-slate-100"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                />
                                            )}
                                            <div className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : hasData ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-200/50 text-slate-400'}`}>
                                                {hasData && !isActive ? <Check size={12} strokeWidth={3} /> : <Icon size={12} strokeWidth={2.5} />}
                                            </div>
                                            <span className="text-[12px] font-bold tracking-tight whitespace-nowrap z-10 relative">
                                                {tab.label}
                                            </span>
                                        </button>

                                        {index < tabs.length - 1 && (
                                            <div className="flex items-center justify-center px-1">
                                                <ChevronDown size={14} className="-rotate-90 text-slate-300" />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-end w-full xl:w-auto">
                        <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-[14px] p-1 shadow-sm">

                            {activeTab === 'resume' && (
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-[10px] transition-all duration-300 ${isEditing
                                        ? 'bg-indigo-50 text-indigo-600 shadow-inner'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                    title={isEditing ? "Exit Focus Mode" : "Focus Mode"}
                                >
                                    {isEditing ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                            )}

                            <button
                                onClick={handleCopy}
                                className="w-9 h-9 flex items-center justify-center rounded-[10px] text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all duration-300"
                                title="Copy to Clipboard"
                            >
                                <AnimatePresence mode="wait">
                                    {copied ? (
                                        <motion.div key="copied" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={16} className="text-emerald-500" strokeWidth={3} /></motion.div>
                                    ) : (
                                        <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={16} /></motion.div>
                                    )}
                                </AnimatePresence>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsExportOpen(!isExportOpen)}
                                    onBlur={() => setTimeout(() => setIsExportOpen(false), 200)}
                                    className="w-9 h-9 flex items-center justify-center rounded-[10px] bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 shadow-[0_2px_8px_rgba(15,23,42,0.2)]"
                                    title="Export Options"
                                >
                                    <Download size={16} />
                                </button>

                                <AnimatePresence>
                                    {isExportOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[1.2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 p-1.5 overflow-hidden"
                                        >
                                            {activeTab === 'resume' && (
                                                <>
                                                    <button onClick={() => { handleDownloadPDF(); setIsExportOpen(false); }} className="w-full text-left px-3 py-2.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl flex items-center gap-2.5 transition-colors group">
                                                        <div className="w-6 h-6 rounded-md bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors"><FileText size={12} /></div> PDF
                                                    </button>
                                                    <button onClick={() => { handleDownloadWord(); setIsExportOpen(false); }} className="w-full text-left px-3 py-2.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl flex items-center gap-2.5 transition-colors group">
                                                        <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors"><FileText size={12} /></div> Word
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => { handleDownload(); setIsExportOpen(false); }} className="w-full text-left px-3 py-2.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl flex items-center gap-2.5 transition-colors group">
                                                <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-colors"><FileText size={12} /></div> Plain Text
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-8 flex-1 flex flex-col items-center relative z-10 print:p-0 print:m-0">
                <AnimatePresence mode="wait">

                    {/* RESUME TAB */}
                    {activeTab === 'resume' && (
                        <motion.div key="resume-tab" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="w-full mx-auto">
                            {isEditing ? (
                                <div className="max-w-[850px] w-full mx-auto">
                                    <div className="bg-indigo-50/80 backdrop-blur-md p-3 rounded-t-2xl border-x border-t border-indigo-100 flex items-center justify-between text-indigo-700 text-xs font-bold uppercase tracking-widest shadow-inner px-5">
                                        <span className="flex items-center gap-2"><Sparkles size={14} /> Focus Mode (Markdown)</span>
                                        <button onClick={() => setIsEditing(false)} className="text-indigo-500 hover:text-indigo-800"><Minimize2 size={14} /></button>
                                    </div>
                                    <textarea
                                        value={cleanMarkdownArtifacts(results.resume)}
                                        onChange={(e) => setResults(prev => ({ ...prev, resume: e.target.value }))}
                                        className="w-full min-h-[850px] p-10 border-x border-b border-indigo-100 rounded-b-2xl font-mono text-[14px] leading-[1.8] focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all resize-y bg-white/95 backdrop-blur-xl shadow-2xl text-slate-800"
                                        placeholder="Edit your resume markdown here..." spellCheck="false"
                                    />
                                </div>
                            ) : (
                                <motion.div layout className="bg-white p-8 sm:p-12 md:p-16 min-h-[1056px] w-full max-w-[816px] mx-auto rounded-sm border border-slate-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-x-auto overflow-y-hidden">
                                    <div id="printable-resume" className="w-full min-w-[320px]">
                                        <StreamingMarkdown content={results.resume} isStreaming={isGenerating.resume} format="resume" />
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* COVER LETTER TAB */}
                    {activeTab === 'coverLetter' && (
                        <motion.div key="cover-tab" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="bg-white/95 backdrop-blur-2xl p-8 sm:p-12 md:p-16 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white max-w-3xl w-full mx-auto min-h-[600px] flex flex-col">
                            {isGenerating.coverLetter ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse space-y-6">
                                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center"><FileText className="text-slate-300" size={32} /></div>
                                    <div className="space-y-4 w-full max-w-md">
                                        <div className="h-4 bg-slate-100 rounded-full w-3/4 mx-auto"></div>
                                        <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                                        <div className="h-4 bg-slate-100 rounded-full w-5/6 mx-auto"></div>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-4">Drafting Masterpiece...</p>
                                </div>
                            ) : results.coverLetter ? (
                                <div className="w-full mx-auto">
                                    <StreamingMarkdown content={results.coverLetter} isStreaming={isGenerating.coverLetter} format="standard" />
                                    <div className="mt-16 p-1 bg-gradient-to-br from-slate-200/50 to-slate-100/50 rounded-3xl">
                                        <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-[23px] flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-6 shadow-sm">
                                            <div>
                                                <h3 className="text-[15px] font-black text-slate-900 mb-1.5 flex items-center gap-2 justify-center sm:justify-start">
                                                    <Building size={18} className="text-slate-400" /> Next: Know the Company
                                                </h3>
                                                <p className="text-[13px] text-slate-500 max-w-sm font-medium">Don't apply blindly. Let AI analyze the Job Description to uncover their business goals and culture.</p>
                                            </div>
                                            <button onClick={() => setActiveTab('research')} className="shrink-0 px-6 py-3 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 font-bold text-[12px] uppercase tracking-widest rounded-xl shadow-sm transition-all flex items-center gap-2 active:scale-95">
                                                Company Research <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] flex items-center justify-center border border-white shadow-[0_10px_30px_rgba(99,102,241,0.1)] mb-2 rotate-3 hover:rotate-0 transition-transform duration-500">
                                        <FileText size={36} className="text-indigo-600 drop-shadow-sm" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Draft a Cover Letter</h3>
                                        <p className="text-[14px] text-slate-500 max-w-[320px] mx-auto leading-relaxed font-medium">Instantly generate a highly targeted cover letter based on your optimized resume and the job description.</p>
                                    </div>
                                    <button onClick={generateCoverLetter} disabled={isGenerating.coverLetter} className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl text-[13px] font-bold shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:bg-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all w-full max-w-[240px]">
                                        Create Cover Letter
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* COMPANY RESEARCH TAB */}
                    {activeTab === 'research' && (
                        <motion.div key="research-tab" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="bg-white/95 backdrop-blur-2xl p-8 sm:p-12 md:p-16 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white max-w-3xl w-full mx-auto min-h-[600px] flex flex-col">
                            {isGenerating.research ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse space-y-6">
                                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
                                    <div className="space-y-4 w-full max-w-md">
                                        <div className="h-4 bg-slate-100 rounded-full w-1/2 mx-auto"></div>
                                        <div className="grid grid-cols-2 gap-4 mt-8">
                                            <div className="h-24 bg-slate-50 border border-slate-100 rounded-2xl"></div>
                                            <div className="h-24 bg-slate-50 border border-slate-100 rounded-2xl"></div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-4">Analyzing corporate data...</p>
                                </div>
                            ) : results.research ? (
                                <div className="w-full mx-auto">
                                    <StreamingMarkdown content={results.research} isStreaming={isGenerating.research} format="standard" />
                                    <div className="mt-16 p-1 bg-gradient-to-br from-purple-100/50 to-indigo-100/50 rounded-3xl">
                                        <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-[23px] flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-6 shadow-sm">
                                            <div>
                                                <h3 className="text-[15px] font-black text-purple-900 mb-1.5 flex items-center gap-2 justify-center sm:justify-start">
                                                    <BrainCircuit size={18} className="text-purple-500" /> Final Step: Ace the Interview
                                                </h3>
                                                <p className="text-[13px] text-purple-700/80 max-w-sm font-medium">We know their JD and your gaps. Let's predict the exact questions they will ask you.</p>
                                            </div>
                                            <button onClick={() => setActiveTab('interview')} className="shrink-0 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[12px] uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95">
                                                Predict Questions <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-gray-100 rounded-[2rem] flex items-center justify-center border border-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] mb-2 -rotate-3 hover:rotate-0 transition-transform duration-500">
                                        <Building size={36} className="text-slate-600 drop-shadow-sm" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Company Research</h3>
                                        <p className="text-[14px] text-slate-500 max-w-[340px] mx-auto leading-relaxed font-medium">Gain an edge. We'll analyze their business model, culture, and potential pain points based on the JD.</p>
                                    </div>
                                    <button onClick={generateResearch} disabled={isGenerating.research} className="px-8 py-3.5 bg-slate-900 text-white rounded-xl text-[13px] font-bold shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95 transition-all w-full max-w-[240px] flex items-center justify-center gap-2">
                                        <Search size={16} /> Run Analysis
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* INTERVIEW PREP TAB */}
                    {activeTab === 'interview' && (
                        <motion.div key="interview-tab" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="bg-white/95 backdrop-blur-2xl p-8 sm:p-12 md:p-16 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white max-w-3xl w-full mx-auto min-h-[600px] flex flex-col">
                            {isGenerating.interview ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse space-y-6">
                                    <div className="w-20 h-20 bg-purple-50 rounded-[2rem] border border-purple-100 flex items-center justify-center"><BrainCircuit className="text-purple-400 animate-pulse" size={32} /></div>
                                    <div className="space-y-5 w-full max-w-md">
                                        <div className="h-4 bg-slate-100 rounded-full w-2/3 mx-auto mb-8"></div>
                                        <div className="p-5 border border-slate-100 rounded-2xl space-y-3">
                                            <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                                            <div className="h-3 bg-slate-100 rounded-full w-4/5"></div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mt-4">Predicting Questions...</p>
                                </div>
                            ) : results.interview ? (
                                <div className="w-full mx-auto">
                                    <StreamingMarkdown content={results.interview} isStreaming={isGenerating.interview} format="standard" />
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-[2rem] flex items-center justify-center border border-white shadow-[0_10px_30px_rgba(168,85,247,0.15)] mb-2 rotate-3 hover:rotate-0 transition-transform duration-500">
                                        <BrainCircuit size={36} className="text-purple-600 drop-shadow-sm" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Interview Predictions</h3>
                                        <p className="text-[14px] text-slate-500 max-w-[340px] mx-auto leading-relaxed font-medium">We cross-reference your resume gaps with the Job Description to predict and answer the toughest questions they'll ask.</p>
                                    </div>
                                    <button onClick={generateInterview} disabled={isGenerating.interview} className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-[13px] font-bold shadow-[0_8px_25px_rgba(147,51,234,0.3)] hover:shadow-[0_8px_30px_rgba(147,51,234,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all w-full max-w-[240px]">
                                        Predict Questions
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-16 mb-8 print:hidden">
                    <p className="text-[11px] text-slate-400 text-center max-w-md mx-auto font-medium">
                        <strong>Disclaimer:</strong> AI can occasionally make mistakes. Please verify important numbers and facts manually before submitting.
                    </p>
                </div>
            </div>

            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <ResumePDFTemplate resumeData={cleanMarkdownArtifacts(results.resume)} />
            </div>
        </div>
    );
}

DocumentViewer.propTypes = {
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    results: PropTypes.object.isRequired,
    setResults: PropTypes.func.isRequired,
    isEditing: PropTypes.bool.isRequired,
    setIsEditing: PropTypes.func.isRequired,
    isExportOpen: PropTypes.bool.isRequired,
    setIsExportOpen: PropTypes.func.isRequired,
    copied: PropTypes.bool.isRequired,
    handleCopy: PropTypes.func.isRequired,
    handleDownload: PropTypes.func.isRequired,
    handleDownloadPDF: PropTypes.func.isRequired,
    handleDownloadWord: PropTypes.func.isRequired,
    generateCoverLetter: PropTypes.func.isRequired,
    generateInterview: PropTypes.func.isRequired,
    generateResearch: PropTypes.func.isRequired,
    isGenerating: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
};