import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Check, Copy, Edit3, Loader2, Search, BrainCircuit, Building, ChevronDown, Sparkles } from 'lucide-react';
import ResumePDFTemplate from './ResumePDFTemplate';

// Custom Markdown wrapper to prepare for Streaming UI
const StreamingMarkdown = ({ content, isStreaming }) => {
    return (
        <motion.div layout className="relative">
            <ReactMarkdown
                components={{
                    h1: ({ children }) => (
                        <motion.h1
                            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            className="text-3xl font-extrabold uppercase tracking-tight text-center border-b-[3px] border-slate-900 pb-5 mb-10 print:break-after-avoid print:mt-0"
                        >
                            {children}
                        </motion.h1>
                    ),
                    h2: ({ children }) => (
                        <motion.h2
                            initial={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            className="text-[14px] font-black uppercase tracking-[0.15em] border-b-2 border-slate-200 mt-12 mb-6 pb-2 text-slate-800 print:break-after-avoid print:mt-6"
                        >
                            {children}
                        </motion.h2>
                    ),
                    h3: ({ children }) => (
                        <motion.h3
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[15px] font-bold mt-6 mb-2 text-slate-900"
                        >
                            {children}
                        </motion.h3>
                    ),
                    p: ({ children }) => (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[13px] leading-[1.6] mb-4 text-left text-slate-700" // Було text-justify
                        >
                            {children}
                        </motion.p>
                    ),
                    ul: ({ children }) => (
                        <motion.ul
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="list-disc ml-6 space-y-2 mb-6 marker:text-slate-400"
                        >
                            {children}
                        </motion.ul>
                    ),
                    li: ({ children }) => (
                        <motion.li
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[13px] mb-2 leading-[1.6] print:break-inside-avoid text-slate-700"
                        >
                            {children}
                        </motion.li>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
            {isStreaming && (
                <motion.span
                    animate={{ opacity: [1, 0, 1], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                    className="inline-block w-[4px] h-[1.2em] bg-indigo-500 ml-1 align-middle rounded-full shadow-[0_0_12px_rgba(99,102,241,1)]"
                />
            )}
        </motion.div>
    );
};

export default function DocumentViewer({
    activeTab,
    setActiveTab,
    results,
    setResults,
    isEditing,
    setIsEditing,
    isExportOpen,
    setIsExportOpen,
    copied,
    handleCopy,
    handleDownload,
    handleDownloadPDF,
    handleDownloadWord,
    generateCoverLetter,
    generateInterview,
    generateResearch,
    isGenerating,
    errors
}) {
    const tabs = [
        { id: 'resume', label: 'Resume' },
        { id: 'coverLetter', label: 'Cover Letter' },
        { id: 'research', label: 'Company Research' },
        { id: 'interview', label: 'Interview Q&A' },
    ];

    // Animation variants for tab transitions
    const tabVariants = {
        hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.2, ease: "easeIn" } }
    };

    return (
        <div className="flex-1 min-w-0 max-w-full overflow-y-auto bg-slate-100/50 rounded-[2rem] flex flex-col relative print:col-span-3 print:w-full print:shadow-none print:border-none print:bg-white print:overflow-visible">

            {/* macOS-style Header/Toolbar */}
            <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-white shadow-sm p-4 sm:p-5 print:hidden">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">

                    {/* Tab Navigation Segmented Control */}
                    <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-full xl:w-auto overflow-x-auto whitespace-nowrap hide-scrollbar shadow-inner border border-slate-200/50">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-5 py-2 font-bold text-[13px] rounded-xl transition-all duration-300
                                    ${activeTab === tab.id
                                        ? 'text-slate-900 shadow-sm border border-slate-200/50'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                                    }
                                `}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabMarker"
                                        className="absolute inset-0 bg-white rounded-xl -z-10 shadow-sm"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                        {activeTab === 'resume' && (
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all duration-300 shadow-sm ${isEditing
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-inner'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md'
                                    }`}
                                title={isEditing ? "Save & Preview" : "Focus Mode"}
                            >
                                <Edit3 size={14} /> {isEditing ? 'Done' : 'Focus Mode'}
                            </button>
                        )}

                        <button
                            onClick={handleCopy}
                            className="p-2.5 border border-slate-200 bg-white hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md text-slate-500 rounded-xl shadow-sm transition-all duration-300 relative group"
                            title="Copy to Clipboard"
                        >
                            <AnimatePresence mode="wait">
                                {copied ? (
                                    <motion.div key="copied" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <Check size={16} className="text-emerald-500" strokeWidth={3} />
                                    </motion.div>
                                ) : (
                                    <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <Copy size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsExportOpen(!isExportOpen)}
                                onBlur={() => setTimeout(() => setIsExportOpen(false), 200)}
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_5px_15px_rgba(15,23,42,0.2)] transition-transform active:scale-95"
                            >
                                <Download size={14} strokeWidth={2.5} /> Export <ChevronDown size={14} className={`transition-transform duration-300 ${isExportOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isExportOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl border border-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 p-2 overflow-hidden"
                                    >
                                        {activeTab === 'resume' && (
                                            <>
                                                <button
                                                    onClick={() => { handleDownloadPDF(); setIsExportOpen(false); }}
                                                    className="w-full text-left px-4 py-3 text-[13px] font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl flex items-center gap-3 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                                                        <FileText size={14} />
                                                    </div>
                                                    Export PDF
                                                </button>
                                                <button
                                                    onClick={() => { handleDownloadWord(); setIsExportOpen(false); }}
                                                    className="w-full text-left px-4 py-3 text-[13px] font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl flex items-center gap-3 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                        <FileText size={14} />
                                                    </div>
                                                    Export Word
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => { handleDownload(); setIsExportOpen(false); }}
                                            className="w-full text-left px-4 py-3 text-[13px] font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl flex items-center gap-3 transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-colors">
                                                <FileText size={14} />
                                            </div>
                                            Export Plain Text
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Workspace Area */}
            <div className="p-4 sm:p-8 flex-1 flex flex-col items-center relative z-10 print:p-0 print:m-0">
                <AnimatePresence mode="wait">
                    {/* RESUME TAB */}
                    {activeTab === 'resume' && (
                        <motion.div
                            key="resume-tab"
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full mx-auto"
                        >
                            {isEditing ? (
                                <div className="max-w-[850px] w-full mx-auto">
                                    <div className="bg-indigo-50/50 p-3 rounded-t-2xl border-x border-t border-indigo-100 flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-widest shadow-inner">
                                        <Sparkles size={14} /> Focus Mode (Markdown)
                                    </div>
                                    <textarea
                                        value={results.resume}
                                        onChange={(e) => setResults(prev => ({ ...prev, resume: e.target.value }))}
                                        className="w-full min-h-[850px] p-10 border-x border-b border-indigo-100 rounded-b-2xl font-mono text-[14px] leading-[1.8] focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all resize-y bg-white/90 backdrop-blur-xl shadow-2xl text-slate-800"
                                        placeholder="Edit your resume markdown here..."
                                        spellCheck="false"
                                    />
                                </div>
                            ) : (
                                <motion.div
                                    layout
                                    className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-12 md:p-16 min-h-[1056px] w-full max-w-[816px] mx-auto border border-slate-200/60 print:p-0 print:m-0 print:shadow-none print:border-none transition-all duration-500"
                                >
                                    <div id="printable-resume" className="prose prose-sm max-w-none prose-slate prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-700 prose-li:text-slate-700 h-full print:w-full print:max-w-none print:m-0 print:p-0 print:text-black">
                                        <StreamingMarkdown content={results.resume} isStreaming={isGenerating.resume} />
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* COVER LETTER TAB */}
                    {activeTab === 'coverLetter' && (
                        <motion.div
                            key="cover-tab"
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white/80 backdrop-blur-xl p-10 md:p-14 rounded-[2rem] shadow-xl border border-white/60 max-w-3xl w-full mx-auto min-h-[600px] flex flex-col"
                        >
                            {isGenerating.coverLetter ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse space-y-6">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
                                    <div className="space-y-3 w-full max-w-md">
                                        <div className="h-4 bg-slate-100 rounded-full w-3/4 mx-auto"></div>
                                        <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                                        <div className="h-4 bg-slate-100 rounded-full w-5/6 mx-auto"></div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Drafting Masterpiece...</p>
                                </div>
                            ) : results.coverLetter ? (
                                <div className="prose prose-sm max-w-none prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-relaxed mx-auto">
                                    <StreamingMarkdown content={results.coverLetter} isStreaming={isGenerating.coverLetter} />
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-5">
                                    <div className="w-20 h-20 bg-indigo-50/50 rounded-full flex items-center justify-center border border-indigo-100/50 shadow-inner">
                                        <FileText size={32} className="text-indigo-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Draft a Cover Letter</h3>
                                        <p className="text-[13px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">Instantly generate a highly targeted cover letter based on your optimized resume.</p>
                                    </div>
                                    <button
                                        onClick={generateCoverLetter}
                                        disabled={isGenerating.coverLetter}
                                        className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl text-[13px] font-bold shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:bg-indigo-500 hover:-translate-y-0.5 transition-all w-full max-w-[240px]"
                                    >
                                        Create Cover Letter
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* COMPANY RESEARCH TAB */}
                    {activeTab === 'research' && (
                        <motion.div
                            key="research-tab"
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white/80 backdrop-blur-xl p-10 md:p-14 rounded-[2rem] shadow-xl border border-white/60 max-w-3xl w-full mx-auto min-h-[600px] flex flex-col"
                        >
                            {isGenerating.research ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse space-y-6">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={24} /></div>
                                    <div className="space-y-4 w-full max-w-md">
                                        <div className="h-4 bg-slate-100 rounded-full w-1/2 mx-auto"></div>
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl"></div>
                                            <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl"></div>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Analyzing corporate data...</p>
                                </div>
                            ) : results.research ? (
                                <div className="prose prose-sm max-w-none prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-relaxed mx-auto">
                                    <ReactMarkdown components={{
                                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-6">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
                                    }}>{results.research}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-5">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200/50 shadow-inner">
                                        <Building size={32} className="text-slate-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Company Research</h3>
                                        <p className="text-[13px] text-slate-500 max-w-[300px] mx-auto leading-relaxed">Gain an edge. We'll analyze their business model, culture, and recent news based on the JD.</p>
                                    </div>
                                    <button
                                        onClick={generateResearch}
                                        disabled={isGenerating.research}
                                        className="px-8 py-3.5 bg-slate-900 text-white rounded-xl text-[13px] font-bold shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:bg-slate-800 hover:-translate-y-0.5 transition-all w-full max-w-[240px] flex items-center justify-center gap-2"
                                    >
                                        <Search size={16} /> Run Analysis
                                    </button>
                                    {errors.research && (
                                        <p className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 px-4 py-2 rounded-lg mt-4 max-w-sm">
                                            {errors.research}
                                        </p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* INTERVIEW PREP TAB */}
                    {activeTab === 'interview' && (
                        <motion.div
                            key="interview-tab"
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white/80 backdrop-blur-xl p-10 md:p-14 rounded-[2rem] shadow-xl border border-white/60 max-w-3xl w-full mx-auto min-h-[600px] flex flex-col"
                        >
                            {isGenerating.interview ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse space-y-6">
                                    <div className="w-16 h-16 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-center"><BrainCircuit className="text-purple-300 animate-pulse" size={28} /></div>
                                    <div className="space-y-4 w-full max-w-md">
                                        <div className="h-5 bg-slate-100 rounded-full w-2/3 mx-auto mb-8"></div>
                                        <div className="p-4 border border-slate-100 rounded-xl space-y-3">
                                            <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                                            <div className="h-3 bg-slate-100 rounded-full w-4/5"></div>
                                        </div>
                                        <div className="p-4 border border-slate-100 rounded-xl space-y-3 opacity-70">
                                            <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                                            <div className="h-3 bg-slate-100 rounded-full w-5/6"></div>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mt-4">Predicting Questions...</p>
                                </div>
                            ) : results.interview ? (
                                <div className="prose prose-sm max-w-none prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-relaxed mx-auto">
                                    <ReactMarkdown components={{
                                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-6">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
                                    }}>{results.interview}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-5">
                                    <div className="w-20 h-20 bg-purple-50/50 rounded-full flex items-center justify-center border border-purple-100/50 shadow-inner">
                                        <BrainCircuit size={32} className="text-purple-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Interview Predictions</h3>
                                        <p className="text-[13px] text-slate-500 max-w-[300px] mx-auto leading-relaxed">We cross-reference your resume gaps with the JD to predict and answer the toughest questions they'll ask.</p>
                                    </div>
                                    <button
                                        onClick={generateInterview}
                                        disabled={isGenerating.interview}
                                        className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-[13px] font-bold shadow-[0_8px_20px_rgba(147,51,234,0.25)] hover:shadow-lg hover:-translate-y-0.5 transition-all w-full max-w-[240px]"
                                    >
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

            {/* HIDDEN PDF TEMPLATE FOR EXPORT */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <ResumePDFTemplate resumeData={results.resume} />
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
