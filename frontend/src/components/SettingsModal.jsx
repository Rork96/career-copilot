import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Shield, Trash2, Sliders, Check, Loader2, RefreshCw, Cpu, Brain, Zap, Download, ArrowRight } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api' 
    : 'https://cv.wealthifai.xyz/api';

export default function SettingsDrawer({ isOpen, onClose, apiKey, setApiKey, settings, onUpdateSettings }) {
    const [localKey, setLocalKey] = useState(apiKey);
    const [testStatus, setTestStatus] = useState('idle');
    const [testError, setTestError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalKey(apiKey);
            setTestStatus('idle');
            setTestError('');
        }
    }, [isOpen, apiKey]);

    const testConnection = async () => {
        setTestStatus('testing');
        setTestError('');
        try {
            const res = await fetch(`${API_BASE}/test-key`, {
                headers: { 'X-Gemini-API-Key': localKey }
            });
            if (res.ok) setTestStatus('success');
            else {
                const data = await res.json();
                setTestStatus('error');
                setTestError(data.detail || 'Invalid Key');
            }
        } catch (e) {
            setTestStatus('error');
            setTestError('Connection failed.');
        }
    };

    const handleSaveKey = () => {
        localStorage.setItem('geminiApiKey', localKey);
        setApiKey(localKey);
    };

    const handleDeleteAll = () => {
        setIsDeleting(true);
        setTimeout(() => {
            localStorage.clear();
            window.location.reload();
        }, 1500);
    };

    const tones = [
        { id: 'Strategic', icon: Brain, label: 'Strategic', desc: 'Focus on impact & ROI' },
        { id: 'Technical', icon: Cpu, label: 'Technical', desc: 'Hard skills & depth' },
        { id: 'Minimalist', icon: Zap, label: 'Minimalist', desc: 'Clean, dense, professional' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Drawer */}
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md z-[70] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] border-l border-white/20 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                    <Sliders size={20} />
                                </div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Preferences</h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
                            
                            {/* API Key Section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Key size={16} className="text-amber-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Security & Keys</h3>
                                </div>
                                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                                    <div className="flex gap-2">
                                        <input 
                                            type="password"
                                            value={localKey}
                                            onChange={(e) => setLocalKey(e.target.value)}
                                            placeholder="Gemini API Key..."
                                            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                        <button 
                                            onClick={testConnection}
                                            className={`p-2.5 rounded-xl border transition-all ${
                                                testStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                                                testStatus === 'error' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                                                'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                            }`}
                                        >
                                            {testStatus === 'testing' ? <Loader2 size={18} className="animate-spin" /> : 
                                             testStatus === 'success' ? <Check size={18} /> : 
                                             testStatus === 'error' ? <X size={18} /> : <RefreshCw size={18} />}
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleSaveKey}
                                        disabled={!localKey || localKey === apiKey}
                                        className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-30 transition-all"
                                    >
                                        Update Master Key
                                    </button>
                                </div>
                            </section>

                            {/* Tone Selector */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <RefreshCw size={16} className="text-indigo-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">AI Personality</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {tones.map((tone) => (
                                        <button
                                            key={tone.id}
                                            onClick={() => onUpdateSettings({ tone: tone.id })}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                                settings.tone === tone.id 
                                                ? 'bg-indigo-50 border-indigo-500/50 shadow-sm' 
                                                : 'bg-white border-slate-100 hover:border-slate-200'
                                            }`}
                                        >
                                            <div className={`p-2.5 rounded-xl ${settings.tone === tone.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                <tone.icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${settings.tone === tone.id ? 'text-indigo-900' : 'text-slate-700'}`}>{tone.label}</h4>
                                                <p className="text-[11px] text-slate-500 font-medium">{tone.desc}</p>
                                            </div>
                                            {settings.tone === tone.id && (
                                                <div className="ml-auto w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Quality Thresholds */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Download size={16} className="text-emerald-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Export Engine</h3>
                                </div>
                                <div className="p-1 bg-slate-100 rounded-2xl flex items-center overflow-hidden border border-slate-200/50">
                                    {['Standard', 'High-Density'].map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => onUpdateSettings({ quality: q })}
                                            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                                settings.quality === q ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 px-2 font-medium">High-density optimizes for 1-page constraints at the cost of white space.</p>
                            </section>

                            {/* Privacy Dashboard */}
                            <section className="pt-6 space-y-4 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-slate-400" />
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Privacy Dashboard</h3>
                                </div>
                                <button 
                                    onClick={handleDeleteAll}
                                    disabled={isDeleting}
                                    className="w-full group flex items-center justify-between p-4 bg-rose-50 hover:bg-rose-100/80 rounded-2xl border border-rose-100 transition-all text-rose-600 disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </div>
                                        <span className="text-[13px] font-bold">Destroy All Local Data</span>
                                    </div>
                                    {!isDeleting && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                                <p className="text-[10px] text-slate-400 px-2 leading-relaxed">This action is irreversible. All career facts, API keys, and session history will be purged immediately.</p>
                            </section>

                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50/80 backdrop-blur-md border-t border-slate-200/50 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Career Copilot v2.4 Premium</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

SettingsDrawer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    apiKey: PropTypes.string,
    setApiKey: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    onUpdateSettings: PropTypes.func.isRequired
};

