import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Briefcase, DownloadCloud, Loader2, AlertCircle, Link, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api' 
    : 'https://cv.wealthifai.xyz/api';

export default function JobInput({ jobUrl, setJobUrl, jobText, setJobText }) {
    const [isFetching, setIsFetching] = useState(false);
    const [fetchSuccess, setFetchSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleFetchJob = async () => {
        if (!jobUrl.trim()) {
            setError("Please enter a valid URL first.");
            return;
        }

        setIsFetching(true);
        setError('');
        setFetchSuccess(false);

        try {
            const res = await axios.post(`${API_BASE}/parse-job`, { url: jobUrl });
            setJobText(res.data.text);
            
            // Show success animation
            setFetchSuccess(true);
            setTimeout(() => setFetchSuccess(false), 3000);
            
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            if (detail === "BOT_PROTECTED" || err.response?.status === 403 || err.response?.status === 400) {
                setError("This site blocks automated scraping. Please copy and paste the job description below.");
            } else {
                setError("Failed to fetch job description.");
            }
        } finally {
            setIsFetching(false);
        }
    };

    // Calculate approximate word count for the "Pro" badge
    const wordCount = jobText.trim() ? jobText.trim().split(/\s+/).length : 0;

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white/80 p-6 md:p-8 flex flex-col h-full relative overflow-hidden group/card transition-all hover:bg-white/80">
            {/* Subtle Gradient Backdrop inside the card */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/50 rounded-full blur-[80px] -z-10 pointer-events-none group-hover/card:bg-blue-100/40 transition-colors duration-700" />
            
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-white shadow-sm border border-slate-200/60 flex items-center justify-center shrink-0">
                    <Briefcase className="text-slate-700" size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Job Target</h2>
            </div>

            {/* Unified Search Bar */}
            <div className="flex items-center bg-white/60 backdrop-blur-md border border-slate-200/60 p-1.5 rounded-2xl shadow-inner focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-400/50 transition-all mb-4 relative z-10">
                <div className="pl-3 pr-2 text-slate-400">
                    <Link size={18} />
                </div>
                <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="Paste Job URL (LinkedIn, Indeed)..."
                    className="flex-1 bg-transparent py-2.5 px-2 text-[15px] font-medium text-slate-700 placeholder:text-slate-400 outline-none w-full"
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchJob()}
                />
                <button
                    onClick={handleFetchJob}
                    disabled={isFetching || !jobUrl}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 hover:bg-slate-800 shadow-md ml-2 shrink-0 group/btn overflow-hidden relative"
                >
                    <AnimatePresence mode="wait">
                        {isFetching ? (
                            <motion.div key="loading" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                                <Loader2 size={16} className="animate-spin" />
                            </motion.div>
                        ) : fetchSuccess ? (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                                <CheckCircle2 size={16} className="text-emerald-400" />
                            </motion.div>
                        ) : (
                            <motion.div key="fetch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <DownloadCloud size={16} className="group-hover/btn:translate-y-0.5 transition-transform" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <span className="hidden sm:inline">Import</span>
                </button>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="flex items-start gap-3 bg-red-50/50 backdrop-blur-md p-4 rounded-2xl border border-red-100 shadow-sm text-red-600 text-[14px] leading-relaxed font-medium">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative flex-1 group/input min-h-[300px]">
                <textarea
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    placeholder="Import from a URL above, or manually paste the job requirements here..."
                    className="w-full h-full min-h-[300px] p-6 text-[15px] leading-relaxed border border-slate-200/60 bg-white/50 backdrop-blur-md rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400/50 outline-none resize-none transition-all placeholder:text-slate-400 text-slate-700 font-medium shadow-inner"
                />
                
                {/* Editable Badge (Fades out when focused) */}
                <span className="absolute top-4 right-4 px-2 py-1 bg-white/80 backdrop-blur-sm rounded border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400 shadow-sm opacity-100 group-focus-within/input:opacity-0 transition-opacity duration-300">
                    Editable Text
                </span>

                {/* Pro Character Count Badge */}
                <AnimatePresence>
                    {wordCount > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-200/50"
                        >
                            <div className={`w-2 h-2 rounded-full ${wordCount > 100 ? 'bg-indigo-400' : 'bg-slate-300'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex gap-1">
                                <span className="text-slate-800">{wordCount}</span> Words
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

JobInput.propTypes = {
    jobUrl: PropTypes.string.isRequired,
    setJobUrl: PropTypes.func.isRequired,
    jobText: PropTypes.string.isRequired,
    setJobText: PropTypes.func.isRequired,
};
