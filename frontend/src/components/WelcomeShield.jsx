import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Key, ArrowRight, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';

export default function WelcomeShield({ onComplete }) {
    const [step, setStep] = useState(1);
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const handleNext = () => {
        if (step === 1) setStep(2);
        if (step === 2) {
            if (!apiKey.trim()) return;
            setIsValidating(true);
            // Simulate validation
            setTimeout(() => {
                setIsValidating(false);
                setStep(3);
            }, 1200);
        }
    };

    const handleFinish = () => {
        localStorage.setItem('geminiApiKey', apiKey);
        onComplete(apiKey);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-2xl p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20"
            >
                {/* Progress Bar */}
                <div className="flex bg-slate-100 h-1.5 w-full">
                    <motion.div 
                        initial={{ width: '33.33%' }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="bg-indigo-600 h-full"
                    />
                </div>

                <div className="p-8 md:p-12 text-center">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-indigo-100/50">
                                    <Sparkles size={40} className="text-indigo-600" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Private AI Career Copilot.</h2>
                                <p className="text-slate-500 text-lg leading-relaxed text-balance font-medium">
                                    To keep your data 100% private and cost-free, we use your own Google Gemini Key. No subscriptions, just your data.
                                </p>
                                <div className="pt-6">
                                    <button 
                                        onClick={handleNext}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-amber-100/50">
                                    <Key size={32} className="text-amber-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">Paste your Access Key</h3>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <input 
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="Paste Key Here..."
                                            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono text-center text-lg"
                                        />
                                    </div>
                                    <a 
                                        href="https://aistudio.google.com/app/apikey" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest"
                                    >
                                        Get a Free Key from Google <ExternalLink size={12} />
                                    </a>
                                </div>
                                <div className="pt-4">
                                    <button 
                                        onClick={handleNext}
                                        disabled={!apiKey.trim() || isValidating}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        {isValidating ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                Encrypting...
                                            </>
                                        ) : (
                                            <>Verify & Encrypt <ShieldCheck size={20} /></>
                                        )}
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
                                className="space-y-8"
                            >
                                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100/50 border-4 border-white">
                                    <CheckCircle2 size={48} className="text-emerald-500" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-slate-900">Copilot Ready.</h3>
                                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                        Your key is locally encrypted. You're ready to optimize your first resume.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <button 
                                        onClick={handleFinish}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200"
                                    >
                                        Enter Workspace
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer Visual */}
                    <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
                        <div className="h-4 w-1 bg-slate-200 rounded-full"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Military Grade Encryption</span>
                        <div className="h-4 w-1 bg-slate-200 rounded-full"></div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

WelcomeShield.propTypes = {
    onComplete: PropTypes.func.isRequired
};
