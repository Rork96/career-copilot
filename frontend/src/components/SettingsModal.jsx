import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Trash2, Edit2, Check, BrainCircuit, Key, FileText, Settings, Loader2, Send, Bot, User, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey, prompts, setPrompts, resumeText, jobText }) {
    const [localKey, setLocalKey] = useState(apiKey);
    const [localPrompts, setLocalPrompts] = useState(prompts);
    const [careerFacts, setCareerFacts] = useState(() => {
        const saved = localStorage.getItem('careerFacts');
        return saved ? JSON.parse(saved) : [
            "Spearheaded a cloud migration for a global fintech firm, reducing infrastructure overhead by 32%.",
            "Engineered a high-throughput data ingestion pipeline in Go, processing 500k+ events/sec."
        ];
    });
    const [newFact, setNewFact] = useState('');
    const [editingIdx, setEditingIdx] = useState(null);
    const [savedMessage, setSavedMessage] = useState('');
    const [activeTab, setActiveTab] = useState('api'); // api, facts, prompts
    const [testStatus, setTestStatus] = useState('idle'); // idle, testing, success, error
    const [testError, setTestError] = useState('');

    // Chat State
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', text: "Hi! I'm your Career Assistant. I can see your current resume and job target. How can I help you optimize your profile today?" }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    if (!isOpen) return null;

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('geminiApiKey', localKey);
        setApiKey(localKey);
        localStorage.setItem('careerCopilotPrompts', JSON.stringify(localPrompts));
        setPrompts(localPrompts);
        localStorage.setItem('careerFacts', JSON.stringify(careerFacts));

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

    const addFact = () => {
        if (newFact.trim()) {
            setCareerFacts([...careerFacts, newFact.trim()]);
            setNewFact('');
        }
    };

    const removeFact = (idx) => {
        setCareerFacts(careerFacts.filter((_, i) => i !== idx));
    };

    const startEditing = (idx) => {
        setEditingIdx(idx);
        setNewFact(careerFacts[idx]);
    };

    const saveEdit = () => {
        const updated = [...careerFacts];
        updated[editingIdx] = newFact.trim();
        setCareerFacts(updated);
        setEditingIdx(null);
        setNewFact('');
    };

    const handlePromptChange = (key, value) => {
        setLocalPrompts(prev => ({ ...prev, [key]: value }));
    };

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isThinking) return;

        const userMsg = chatInput.trim();
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setIsThinking(true);

        try {
            const res = await fetch('http://localhost:8000/api/assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Gemini-API-Key': localKey
                },
                body: JSON.stringify({
                    message: userMsg,
                    resume_text: resumeText,
                    job_description_text: jobText,
                    current_facts: careerFacts
                })
            });

            if (!res.ok) throw new Error('Failed to reach assistant');
            const data = await res.json();

            const newMessage = {
                role: 'assistant',
                text: data.response,
                draft: data.action !== 'none' ? { type: data.action, content: data.content } : null
            };

            setChatMessages(prev => [...prev, newMessage]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I lost my connection. Is your API key correct?" }]);
        } finally {
            setIsThinking(false);
        }
    };

    const confirmDraft = (draft, msgIdx) => {
        if (draft.type === 'draft_fact') {
            setCareerFacts(prev => [...prev, draft.content]);
        } else if (draft.type === 'draft_tweak') {
            localStorage.setItem('sessionInstructions', draft.content);
        }

        // Remove draft button from message after confirmation
        const updatedMessages = [...chatMessages];
        updatedMessages[msgIdx].draft = null;
        updatedMessages[msgIdx].confirmed = true;
        setChatMessages(updatedMessages);
    };

    const discardDraft = (msgIdx) => {
        const updatedMessages = [...chatMessages];
        updatedMessages[msgIdx].draft = null;
        updatedMessages[msgIdx].discarded = true;
        setChatMessages(updatedMessages);
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

                {/* TABS */}
                <div className="flex gap-4 px-6 border-b border-slate-200 mt-2">
                    <button
                        onClick={() => setActiveTab('api')}
                        className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'api' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Key size={14} /> API Config
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('facts')}
                        className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'facts' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className="flex items-center gap-2">
                            <BrainCircuit size={14} /> Knowledge Base
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('prompts')}
                        className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'prompts' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className="flex items-center gap-2">
                            <FileText size={14} /> Instructions
                        </div>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <form onSubmit={handleSave} className="space-y-6">
                        {activeTab === 'api' && (
                            <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
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
                                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                        Your key is stored locally in your browser and sent only in headers to facilitate stateless, multi-user requests.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'facts' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                                {/* LEFT: FACTS LIST */}
                                <div className="space-y-4 flex flex-col h-[400px]">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-slate-800">Knowledge Base</h3>
                                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">{careerFacts.length} Facts</span>
                                    </div>

                                    <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                                        {careerFacts.map((fact, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg group hover:border-primary/20 transition-colors">
                                                <p className="flex-1 text-[11px] text-slate-600 leading-tight">{fact}</p>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button type="button" onClick={() => startEditing(idx)} className="p-1 text-slate-400 hover:text-primary"><Edit2 size={12} /></button>
                                                    <button type="button" onClick={() => removeFact(idx)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {careerFacts.length === 0 && (
                                            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                                                <p className="text-[10px] text-slate-400 font-medium">No facts added yet.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 py-2 border-t border-slate-100 mt-auto">
                                        <input
                                            type="text"
                                            value={newFact}
                                            onChange={(e) => setNewFact(e.target.value)}
                                            placeholder="Manually add a fact..."
                                            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    editingIdx !== null ? saveEdit() : addFact();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={editingIdx !== null ? saveEdit : addFact}
                                            className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center shrink-0"
                                        >
                                            {editingIdx !== null ? <Check size={14} /> : <Plus size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* RIGHT: AI CHAT */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[400px] shadow-inner">
                                    <div className="p-3 bg-white border-b border-slate-200 flex items-center gap-2">
                                        <div className="bg-primary/10 p-1 rounded-md">
                                            <Bot size={14} className="text-primary" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">AI Career Assistant</span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                        {chatMessages.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                                <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-primary'}`}>
                                                            {msg.role === 'user' ? <User size={12} className="text-slate-600" /> : <Bot size={12} className="text-white" />}
                                                        </div>
                                                        <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                    {msg.draft && (
                                                        <div className="ml-8 mt-1 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2 animate-in fade-in zoom-in-95 duration-300 shadow-sm self-stretch">
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                                                                <Edit2 size={12} /> Proposed {msg.draft.type === 'draft_fact' ? 'Career Fact' : 'Style Tweak'}
                                                            </div>
                                                            <p className="text-[11px] text-blue-900 border-l-2 border-blue-300 pl-2 py-1 bg-white/50 rounded-r-md italic">
                                                                "{msg.draft.content}"
                                                            </p>
                                                            <div className="flex gap-2 pt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => confirmDraft(msg.draft, idx)}
                                                                    className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all hover:bg-blue-700 flex items-center justify-center gap-1"
                                                                >
                                                                    <Check size={12} /> Confirm {msg.draft.type === 'draft_fact' ? 'Add' : 'Use'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => discardDraft(idx)}
                                                                    className="px-3 bg-white text-slate-500 border border-slate-200 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-50 transition-all"
                                                                >
                                                                    Discard
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {msg.confirmed && (
                                                        <div className="ml-8 mt-1 flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-widest pl-1 transition-all animate-in fade-in slide-in-from-left-2">
                                                            <CheckCircle2 size={12} /> Applied to {msg.confirmed === 'draft_fact' ? 'Knowledge Base' : 'Session'}
                                                        </div>
                                                    )}
                                                    {msg.discarded && (
                                                        <div className="ml-8 mt-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                                                            <X size={12} /> Suggestion Discarded
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isThinking && (
                                            <div className="flex justify-start animate-in fade-in duration-300">
                                                <div className="flex gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                                                        <Bot size={12} className="text-white" />
                                                    </div>
                                                    <div className="p-2.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="I learned Python last month..."
                                            className="flex-1 px-3 py-2 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!chatInput.trim() || isThinking}
                                            className="p-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center shadow-sm"
                                        >
                                            <Send size={14} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'prompts' && (
                            <div className="space-y-4 animate-in fade-in duration-300 max-w-2xl mx-auto">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Global Rules & Tone</label>
                                    <textarea
                                        value={localPrompts.globalRules || ''}
                                        onChange={(e) => handlePromptChange('globalRules', e.target.value)}
                                        placeholder="e.g., Always use Canadian spelling. Focus on senior leadership traits. Keep descriptions concise."
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary h-20 text-xs leading-relaxed text-slate-900"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Resume AI Prompt</label>
                                        <textarea
                                            value={localPrompts.resume}
                                            onChange={(e) => handlePromptChange('resume', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary h-32 text-[10px] leading-relaxed text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Auditor Prompt</label>
                                        <textarea
                                            value={localPrompts.auditor}
                                            onChange={(e) => handlePromptChange('auditor', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary h-32 text-[10px] leading-relaxed text-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
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
    resumeText: PropTypes.string,
    jobText: PropTypes.string,
};
