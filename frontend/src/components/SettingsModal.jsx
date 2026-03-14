import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Trash2, Edit2, Check, BrainCircuit, Key, FileText, Settings, Loader2, Send, Bot, User, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey, prompts, setPrompts }) {
    const [localKey, setLocalKey] = useState(apiKey);
    const [localPrompts, setLocalPrompts] = useState(prompts);
    const [savedMessage, setSavedMessage] = useState('');
    const [testStatus, setTestStatus] = useState('idle'); // idle, testing, success, error
    const [testError, setTestError] = useState('');


    if (!isOpen) return null;

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('geminiApiKey', localKey);
        setApiKey(localKey);
        localStorage.setItem('careerCopilotPrompts', JSON.stringify(localPrompts));
        setPrompts(localPrompts);

        setSavedMessage('Settings preserved!');
        setTimeout(() => {
            setSavedMessage('');
            onClose();
        }, 1500);
    };

    const testConnection = async () => {
        setTestStatus('testing');
        setTestError('');
        try {
            const res = await fetch('http://localhost:8000/api/test-key', {
                headers: { 'X-Gemini-API-Key': localKey }
            });
            if (res.ok) {
                setTestStatus('success');
            } else {
                const data = await res.json();
                setTestStatus('error');
                setTestError(data.detail || 'Invalid Key');
            }
        } catch (e) {
            setTestStatus('error');
            setTestError('Connection failed');
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-slate-900">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Settings size={20} className="text-primary" /> Configuration
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>


                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Google Gemini API Key</label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={localKey}
                                        onChange={(e) => setLocalKey(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={testConnection}
                                        disabled={testStatus === 'testing' || !localKey}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${testStatus === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                                            testStatus === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                                                'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                    >
                                        {testStatus === 'testing' ? <Loader2 size={14} className="animate-spin" /> : null}
                                        {testStatus === 'success' ? <Check size={14} /> : null}
                                        {testStatus === 'error' ? <X size={14} /> : null}
                                        Test Connection
                                    </button>
                                </div>
                                {testError && <p className="text-[10px] text-red-500 mt-1 font-medium">{testError}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Global Rules & Tone</label>
                                <textarea
                                    value={localPrompts.globalRules || ''}
                                    onChange={(e) => setLocalPrompts(prev => ({ ...prev, globalRules: e.target.value }))}
                                    placeholder="e.g., Always use Canadian spelling. Focus on senior leadership traits. Keep descriptions concise."
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary h-32 text-xs leading-relaxed text-slate-900"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                    These rules are applied to all generated documents (Resume, Cover Letter, etc.).
                                </p>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-all shadow-md active:scale-95"
                        >
                            Save Configuration
                        </button>
                        {savedMessage && (
                            <div className="flex items-center gap-2 text-green-600 animate-in fade-in slide-in-from-left-2 transition-all">
                                <CheckCircle2 size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{savedMessage}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

SettingsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    apiKey: PropTypes.string,
    setApiKey: PropTypes.func.isRequired,
    prompts: PropTypes.object.isRequired,
    setPrompts: PropTypes.func.isRequired,
};
