import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, BrainCircuit, Plus, Trash2, Edit2, Check, Loader2, RefreshCw } from 'lucide-react';

export default function FloatingChat({ onRegenerate, hasSeenChat, setHasSeenChat }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mark as seen when opened
  useEffect(() => {
    if (isOpen && !hasSeenChat) {
      setHasSeenChat(true);
      localStorage.setItem('hasSeenChat', 'true');
    }
  }, [isOpen, hasSeenChat, setHasSeenChat]);

  const [activeTab, setActiveTab] = useState('chat'); // chat, knowledge
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your Career Assistant. How can I help you with your tailored resume or career strategy today?" }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [careerFacts, setCareerFacts] = useState([]);
  const [newFact, setNewFact] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const chatEndRef = useRef(null);

  // Load career facts from localStorage
  useEffect(() => {
    const savedFacts = localStorage.getItem('careerFacts');
    if (savedFacts) {
      setCareerFacts(JSON.parse(savedFacts));
    }
  }, [isOpen]);

  // Sync scroll to bottom for chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  const handleSend = async (e) => {
    if (e) e.preventDefault(); // CRITICAL: Stop page reload
    if (!input.trim() || isThinking) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsThinking(true);

    const apiKey = localStorage.getItem('geminiApiKey');

    try {
      const res = await fetch('http://localhost:8000/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': apiKey || ''
        },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) throw new Error('Failed to reach assistant');
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'assistant', text: data.response, action: data.action }]);

      // Handle AI actions (like adding facts automatically)
      if (data.action === 'add_fact' && data.content) {
        const updatedFacts = [...careerFacts, data.content];
        setCareerFacts(updatedFacts);
        localStorage.setItem('careerFacts', JSON.stringify(updatedFacts));
      } else if (data.action === 'tweak_resume' && data.content) {
        localStorage.setItem('sessionInstructions', data.content);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting. Please check your API key in settings." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const addFact = () => {
    if (newFact.trim()) {
      const updated = [...careerFacts, newFact.trim()];
      setCareerFacts(updated);
      localStorage.setItem('careerFacts', JSON.stringify(updated));
      setNewFact('');
    }
  };

  const removeFact = (idx) => {
    const updated = careerFacts.filter((_, i) => i !== idx);
    setCareerFacts(updated);
    localStorage.setItem('careerFacts', JSON.stringify(updated));
  };

  const startEditing = (idx) => {
    setEditingIdx(idx);
    setNewFact(careerFacts[idx]);
  };

  const saveEdit = () => {
    const updated = [...careerFacts];
    updated[editingIdx] = newFact.trim();
    setCareerFacts(updated);
    localStorage.setItem('careerFacts', JSON.stringify(updated));
    setEditingIdx(null);
    setNewFact('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-2xl hover:bg-blue-600 hover:scale-110 transition-all z-40 flex items-center justify-center ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <MessageSquare size={24} />
        
        {/* Pulsing Onboarding Notification */}
        {!hasSeenChat && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Slide-over Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Bot size={18} className="text-white" />
            </div>
            <h2 className="font-bold text-slate-800">AI Assistant</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-4 pt-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'knowledge' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Knowledge Base
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-primary'}`}>
                        {msg.role === 'user' ? <User size={16} className="text-slate-600" /> : <Bot size={16} className="text-white" />}
                      </div>
                      <div className="space-y-2 max-w-[85%]">
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                          {msg.text}
                        </div>
                        {msg.role === 'assistant' && msg.action === 'add_fact' && (
                          <button
                            onClick={() => {
                              onRegenerate?.();
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-primary hover:bg-primary hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-blue-100 shadow-sm"
                          >
                            <RefreshCw size={12} /> Regenerate Resume
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className="bg-primary text-white p-2 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-blue-200"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4 bg-slate-50/50 overflow-hidden">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">My Career Facts</h3>
                <p className="text-xs text-slate-500">These facts are used to enrich your tailored resumes.</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
                {careerFacts.map((fact, idx) => (
                  <div key={idx} className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm group relative">
                    <p className="text-xs text-slate-700 leading-relaxed pr-8">{fact}</p>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg">
                      <button onClick={() => startEditing(idx)} className="text-slate-400 hover:text-primary"><Edit2 size={14} /></button>
                      <button onClick={() => removeFact(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {careerFacts.length === 0 && (
                  <div className="h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                    <BrainCircuit size={32} strokeWidth={1} />
                    <p className="text-xs font-medium">No facts found</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-md">
                <textarea
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  placeholder="Add a new career highlight..."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-20 mb-2"
                />
                <button
                  onClick={editingIdx !== null ? saveEdit : addFact}
                  disabled={!newFact.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {editingIdx !== null ? <><Check size={14} /> Save Changes</> : <><Plus size={14} /> Add Fact</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for mobile or focus */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
        />
      )}
    </>
  );
}
