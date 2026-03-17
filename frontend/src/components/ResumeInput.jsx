import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { FileText, CloudUpload, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api' 
    : 'https://cv.wealthifai.xyz/api';

export default function ResumeInput({ resumeText, setResumeText }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setError('');
        setUploadSuccess(false);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_BASE}/parse-resume`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResumeText(res.data.text);
            
            // Show success animation
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
            
        } catch (err) {
            console.error(err);
            setError("Failed to parse the file. Please paste text manually.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Calculate approximate word count for the "Pro" badge
    const wordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0;

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white/80 p-6 md:p-8 flex flex-col h-full relative overflow-hidden group/card transition-all hover:bg-white/80">
            {/* Subtle Gradient Backdrop inside the card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[80px] -z-10 pointer-events-none group-hover/card:bg-indigo-100/40 transition-colors duration-700" />
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-white shadow-sm border border-slate-200/60 flex items-center justify-center shrink-0">
                        <FileText className="text-slate-700" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Master Resume</h2>
                </div>

                <div>
                    <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 bg-gradient-to-b from-slate-800 to-slate-900 text-white rounded-2xl text-sm font-semibold transition-all shadow-[0_8px_16px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_24px_rgba(15,23,42,0.2)] border border-slate-700"
                    >
                        <AnimatePresence mode="wait">
                            {isUploading ? (
                                <motion.div key="loading" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                                    <Loader2 size={16} className="animate-spin" />
                                </motion.div>
                            ) : uploadSuccess ? (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                                    <CheckCircle2 size={18} className="text-emerald-400" />
                                </motion.div>
                            ) : (
                                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <CloudUpload size={18} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <span>{uploadSuccess ? 'Parsed Successfully' : 'Upload PDF'}</span>
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="text-sm text-red-500 mb-4 bg-red-50 px-4 py-2 rounded-xl text-center border border-red-100 font-medium"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            <div className="relative flex-1 group/input min-h-[300px]">
                <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your raw resume text here, or upload your current PDF..."
                    className="w-full h-full min-h-[300px] p-6 text-[15px] leading-relaxed border border-slate-200/60 bg-white/50 backdrop-blur-md rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400/50 outline-none resize-none transition-all placeholder:text-slate-400 text-slate-700 font-medium shadow-inner"
                />
                
                {/* Pro Character Count Badge */}
                <AnimatePresence>
                    {wordCount > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-200/50"
                        >
                            <div className={`w-2 h-2 rounded-full ${wordCount > 100 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
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

ResumeInput.propTypes = {
    resumeText: PropTypes.string.isRequired,
    setResumeText: PropTypes.func.isRequired,
};
