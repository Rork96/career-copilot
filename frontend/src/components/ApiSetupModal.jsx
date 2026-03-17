import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ShieldCheck, Lock, ChevronRight, CheckCircle2, Info, X } from 'lucide-react';

export default function ApiSetupModal({ isOpen, onClose, onSave, initialKey = '' }) {
    const [step, setStep] = useState(1);
    const [apiKey, setApiKey] = useState(initialKey);
    const [showKey, setShowKey] = useState(false);

    const steps = [
        { id: 1, title: 'Get Your Key', icon: <Key size={18} /> },
        { id: 2, title: 'Paste Access', icon: <Lock size={18} /> },
        { id: 3, title: 'Verify', icon: <ShieldCheck size={18} /> },
    ];

    const handleSave = () => {
        if (apiKey.trim()) {
            onSave(apiKey.trim());
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.2)] border border-white/50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-8 pb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pro Setup</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">Unlock your private AI advantage.</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress Indicator */}
                    <div className="px-8 pb-8">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
                            {steps.map((s) => (
                                <div key={s.id} className="flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                        step >= s.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 text-slate-400'
                                    }`}>
                                        {step > s.id ? <CheckCircle2 size={18} /> : s.icon}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {s.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-8 pb-8 min-h-[220px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 space-y-3">
                                        <p className="text-slate-700 text-[13px] leading-relaxed">
                                            To keep this tool 100% free and private, you'll need your own <strong>Google Gemini Key</strong>. 
                                            It takes 30 seconds to generate.
                                        </p>
                                        <a 
                                            href="https://aistudio.google.com/app/apikey" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs hover:underline"
                                        >
                                            Get your key here <ChevronRight size={14} />
                                        </a>
                                    </div>
                                    <button 
                                        onClick={() => setStep(2)}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-[13px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                                    >
                                        I have my key <ChevronRight size={16} />
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="relative group">
                                        <input
                                            type={showKey ? "text" : "password"}
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="Paste your Private Access Key"
                                            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-sm leading-none"
                                        />
                                        <button
                                            onClick={() => setShowKey(!showKey)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
                                        >
                                            <Info size={16} />
                                        </button>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-[13px] hover:bg-slate-50 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button 
                                            onClick={() => setStep(3)}
                                            disabled={!apiKey.trim()}
                                            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[13px] hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6 text-center"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border-2 border-emerald-100">
                                            <ShieldCheck size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-slate-900">You're Protected</h3>
                                            <p className="text-[13px] text-slate-500">Your data, your key, 100% private.</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl text-[11px] text-slate-400 font-medium">
                                        The key is stored only in your browser's local cache. We never see it and your resumes never touch our servers.
                                    </div>
                                    <button 
                                        onClick={handleSave}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[13px] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-100"
                                    >
                                        Activate AI Copilot
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                            <CheckCircle2 size={12} className="text-emerald-500" /> Safe & Private
                        </span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

ApiSetupModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    initialKey: PropTypes.string,
};
