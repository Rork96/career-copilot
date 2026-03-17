import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, BrainCircuit, Plus, Trash2, Edit2, Check, Sparkles, RefreshCw } from 'lucide-react';

export default function FloatingChat({ onRegenerate, hasSeenChat, setHasSeenChat, autoTrigger }) {
  const [isOpen, setIsOpen] = useState(false);
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

  // Debug Log
  useEffect(() => {
    console.log("💬 Chat Assistant initialized");
  }, []);

  // Handle Auto-Trigger
  // Handle Auto-Trigger від Сеньйора
  useEffect(() => {
    // Перевіряємо, чи є у нас дані для аналізу в локальному сховищі або пропсах
    const savedResults = localStorage.getItem('savedResults');
    if (autoTrigger && savedResults) {
      const { initial_analysis } = JSON.parse(savedResults);

      if (initial_analysis) {
        console.log("🤖 Injecting AI analysis into chat...");
        setIsOpen(true);
        setActiveTab('chat');

        // Додаємо ПРЯМО як повідомлення від асистента
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: initial_analysis,
            action: 'none' // Або залиш як є
          }
        ]);
      }
    }
  }, [autoTrigger]);

  // Mark as seen when opened
  useEffect(() => {
    if (isOpen && !hasSeenChat) {
      setHasSeenChat(true);
      localStorage.setItem('hasSeenChat', 'true');
    }
  }, [isOpen, hasSeenChat, setHasSeenChat]);

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
    if (e) e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsThinking(true);

    const apiKey = localStorage.getItem('geminiApiKey');

    try {
      const res = await fetch('https://cv.wealthifai.xyz/api/assistant/chat',
        // 'http://localhost:8000/api/assistant/chat', 
        {
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

      // Handle AI actions
      if (data.action === 'add_fact' && data.content) {
        const updatedFacts = [...careerFacts, data.content];
        setCareerFacts(updatedFacts);
        localStorage.setItem('careerFacts', JSON.stringify(updatedFacts));
      } else if (data.action === 'tweak_resume' && data.content) {
        localStorage.setItem('sessionInstructions', data.content);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting. Please check your network or API key." }]);
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
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 bg-indigo-600/90 backdrop-blur-md text-white rounded-full shadow-[0_10px_40px_rgba(79,70,229,0.4)] border border-indigo-400/30 hover:bg-indigo-500 hover:scale-110 transition-all z-40 flex items-center justify-center group"
          >
            <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />

            {/* Pulsing Onboarding Notification */}
            {!hasSeenChat && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-sm border border-white"></span>
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Floating Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: '100%', opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed inset-y-4 right-4 w-[calc(100%-2rem)] sm:w-[400px] bg-white/70 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/40 rounded-[2.5rem] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200/50 flex items-center justify-between bg-white/40">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2 rounded-xl shadow-inner border border-indigo-400/50">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-lg flex items-center gap-1.5 tracking-tight">
                    Interviewer <Sparkles size={14} className="text-indigo-500" />
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">AI Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200/50 px-6 pt-2 bg-white/20">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-[3px] ${activeTab === 'chat' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-[3px] ${activeTab === 'knowledge' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Knowledge Base
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden flex flex-col relative z-10 bg-white/30">
              {activeTab === 'chat' ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    <AnimatePresence>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/20 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-gradient-to-t from-indigo-600 to-indigo-500'}`}>
                              {msg.role === 'user' ? <User size={14} className="text-slate-600" /> : <Bot size={14} className="text-white" />}
                            </div>
                            <div className="space-y-3">
                              <div className={`p-4 text-[14px] leading-relaxed shadow-sm border border-white/20 ${msg.role === 'user'
                                ? 'bg-slate-900 text-white rounded-3xl rounded-br-sm'
                                : 'bg-white/70 backdrop-blur-md text-slate-800 rounded-3xl rounded-bl-sm font-medium'
                                }`}>
                                {msg.text}
                              </div>
                              {msg.role === 'assistant' && ['add_fact', 'tweak_resume', 'trigger_generate'].includes(msg.action) && (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  onClick={() => {
                                    onRegenerate?.();
                                    setIsOpen(false);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 w-max ml-auto"
                                >
                                  <RefreshCw size={14} className="animate-spin-slow" /> Regenerate Resume
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isThinking && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-t from-indigo-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                            <Bot size={14} className="text-white" />
                          </div>
                          <div className="px-4 py-3 bg-white/70 backdrop-blur-md border border-white/20 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-10 w-16 justify-center">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse delay-150"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse delay-300"></span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white/60 backdrop-blur-xl border-t border-slate-200/50">
                    <form onSubmit={handleSend} className="flex gap-2 relative">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message Interviewer..."
                        className="flex-1 px-5 py-3.5 pr-14 text-[15px] border border-slate-200/60 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 bg-white/80 shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || isThinking}
                        className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center shadow-md disabled:hover:bg-indigo-600"
                      >
                        <Send size={16} className="ml-0.5" />
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                  <div className="mb-4 flex items-center gap-3">
                    <BrainCircuit className="text-indigo-500" size={24} />
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">My Career Facts</h3>
                      <p className="text-xs text-slate-400 font-medium">Facts automatically integrated into your resume.</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-hide pb-4">
                    <AnimatePresence>
                      {careerFacts.map((fact, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-white/80 backdrop-blur-md p-4 border border-white/50 rounded-2xl shadow-sm hover:shadow-md transition-all group relative"
                        >
                          <p className="text-[13px] text-slate-700 leading-relaxed font-medium pr-8">{fact}</p>
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-sm">
                            <button onClick={() => startEditing(idx)} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white rounded-lg hover:shadow-sm"><Edit2 size={13} /></button>
                            <button onClick={() => removeFact(idx)} className="p-1.5 text-slate-400 hover:text-rose-500 bg-white rounded-lg hover:shadow-sm"><Trash2 size={13} /></button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {careerFacts.length === 0 && (
                      <div className="h-48 border-[2px] border-dashed border-slate-300/50 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3 bg-white/30 backdrop-blur-sm">
                        <div className="bg-slate-100 p-3 rounded-2xl"><BrainCircuit size={28} className="text-slate-400" /></div>
                        <p className="text-sm font-semibold text-slate-500">No career facts yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Add Fact Floating Input Area */}
                  <div className="bg-white/90 backdrop-blur-xl p-4 border border-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-3xl shrink-0">
                    <textarea
                      value={newFact}
                      onChange={(e) => setNewFact(e.target.value)}
                      placeholder="Brain-dump a project, metric, or skill..."
                      className="w-full text-[14px] p-3 bg-transparent border-none outline-none resize-none h-20 mb-2 placeholder:text-slate-400 scrollbar-hide text-slate-800 font-medium"
                    />
                    <div className="flex justify-end border-t border-slate-100 pt-3">
                      <button
                        onClick={editingIdx !== null ? saveEdit : addFact}
                        disabled={!newFact.trim()}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all disabled:opacity-50 shadow-md transform hover:-translate-y-0.5"
                      >
                        {editingIdx !== null ? <><Check size={14} /> Update</> : <><Plus size={14} /> Add Data</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
