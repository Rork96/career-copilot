import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Sparkles, AlertCircle, ArrowUp, Loader2, TriangleAlert, ArrowLeft, Zap, Key } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import GenerationOverlay from './components/GenerationOverlay';
import ResumeInput from './components/ResumeInput';
import JobInput from './components/JobInput';
import SettingsDrawer from './components/SettingsModal';
import ResultTabs from './components/ResultTabs';
import FloatingChat from './components/FloatingChat';
import Landing from './components/Landing';
import WelcomeOverlay from './components/WelcomeOverlay';
import ApiSetupModal from './components/ApiSetupModal';
import WelcomeShield from './components/WelcomeShield';
import './App.css';

// Додай це на початку файлу FloatingChat.jsx
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : 'https://cv.wealthifai.xyz/api';

const defaultPrompts = {
  resume: "You are an elite Canadian Career Strategist and ATS Optimization Expert. Your task is to tailor the provided Original Resume to perfectly match the provided Job Description. STRICT CANADIAN STANDARDS TO FOLLOW: 1. Silent Third Person: Completely eliminate personal pronouns ('I', 'me', 'my'). 2. Privacy Compliance: Strictly remove any mention of age, gender, nationality, marital status, or exact street address. 3. The Achievement Formula: Rewrite every work experience bullet point to start with a strong Action Verb, followed by the Task/Project, and ending with a Quantifiable Business Result. 4. Keyword Optimization: Naturally integrate keywords from the Job Description. CRITICAL: Do NOT hallucinate facts, companies, or degrees. Output ONLY clean Markdown formatting.",
  coverLetter: "You are an expert Canadian Executive Coach. Based on the provided Resume and Job Description, write a compelling, highly targeted Cover Letter. Format: Standard North American business letter. Structure: Paragraph 1 (Hook connecting core strength to company need), Paragraph 2 (Proof using 1-2 metrics from resume), Paragraph 3 (Call to Action). Tone: Confident, professional, and concise in the 'Silent Third Person'. Do NOT invent skills. Output ONLY clean Markdown formatting.",
  interview: "You are a Senior Technical Recruiter in Canada. Predict 10 high-value interview questions based on the Resume and JD (5 Technical, 5 Behavioral using STAR method context). For each, provide the Question, 'Why they are asking this', and a 'Suggested Strategy' based strictly on the candidate's actual experience. Output MUST be a valid JSON object with a single key 'markdown' containing the formatted text.",
  auditor: "You are a Strict Compliance Officer and Data Integrity Auditor. Audit the AI-Generated Resume against the Original Resume. 1. Identify and REMOVE any fabricated companies, job titles, projects, degrees, or metrics not present in the Original Resume. 2. Ensure 'Silent Third Person' tone. 3. Calculate an ATS Match Percentage (0-100%). You MUST return your response STRICTLY as a valid JSON object with keys: 'optimized_markdown' (string), 'ats_match_percentage' (integer), and 'changes_summary' (array of strings).",
  globalRules: "Always use Canadian spelling (e.g., 'Targeted', 'Color' -> 'Colour' if applicable, though usually US spelling is standard in tech, Canadian resumes often prefer standard English. Use 'Silent Third Person' throughout. Focus on senior leadership traits.)"
};

function App() {
  // Global App State
  const [apiKey, setApiKey] = useState(localStorage.getItem('geminiApiKey') || '');
  const [prompts, setPrompts] = useState(defaultPrompts);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('resume');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [chatAutoTrigger, setChatAutoTrigger] = useState(false);
  const [userSettings, setUserSettings] = useState({
    tone: localStorage.getItem('userTone') || 'Strategic',
    quality: localStorage.getItem('userQuality') || 'Standard'
  });

  // Workspace State
  const [resumeText, setResumeText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobText, setJobText] = useState('');

  // App Navigation State (landing, workspace, loading, results)
  const [currentScreen, setCurrentScreen] = useState('landing');

  // Generation State
  const [status, setStatus] = useState('idle'); // idle, generating, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state
  const [results, setResults] = useState({
    resume: '',
    original_ats_score: 0,
    optimized_ats_score: 0,
    changesSummary: [],
    retrievedAchievements: [],
    bulletComparisons: [],
    missingSkills: [],
    research: null,
    coverLetter: null,
    interview: null
  });
  const [sessionInstructions, setSessionInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState({
    resume: false,
    coverLetter: false,
    research: false,
    interview: false
  });

  // UX State
  const [showFAB, setShowFAB] = useState(false);
  const [hasSeenChat, setHasSeenChat] = useState(localStorage.getItem('hasSeenChat') === 'true');
  const [showTutorial, setShowTutorial] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Reading your raw experience...",
    "Converting text to vectors using Google Embeddings...",
    "Fact-checking: Securing your data against AI hallucinations...",
    "Matching your true skills to the job requirements...",
    "Formatting into an ATS-friendly structure...",
    "Finalizing your honest, optimized resume..."
  ];

  // Load Settings and Session on Mount
  useEffect(() => {
    const savedKey = localStorage.getItem('geminiApiKey');
    if (savedKey) {
      setApiKey(savedKey);
      axios.defaults.headers.common['X-Gemini-API-Key'] = savedKey;
    }

    const savedResults = localStorage.getItem('savedResults');
    if (savedResults && currentScreen === 'landing') {
      try {
        setResults(JSON.parse(savedResults));
        setCurrentScreen('results');
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
    const savedResume = localStorage.getItem('savedResumeText');
    const savedJob = localStorage.getItem('savedJobText');

    if (savedResults && savedResume && savedJob) {
      try {
        setResults(JSON.parse(savedResults));
        setResumeText(savedResume);
        setJobText(savedJob);
        setCurrentScreen('results');
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }

    const savedPrompts = localStorage.getItem('careerCopilotPrompts');
    if (savedPrompts) {
      try {
        setPrompts(JSON.parse(savedPrompts));
      } catch (e) {
        console.error("Failed to parse saved prompts", e);
      }
    }

    const savedInstructions = localStorage.getItem('sessionInstructions');
    if (savedInstructions) setSessionInstructions(savedInstructions);

    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (hasSeenTutorial !== 'true') {
      setShowTutorial(true);
    }

    // Configure axios defaults for BYOK
    if (savedKey) {
      axios.defaults.headers.common['X-Gemini-API-Key'] = savedKey;
    }

    // Scroll listener for FAB
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFAB(true);
      } else {
        setShowFAB(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Persist Data on Changes
  useEffect(() => {
    if (currentScreen === 'results' && results.resume) {
      localStorage.setItem('savedResults', JSON.stringify(results));
      localStorage.setItem('savedResumeText', resumeText);
      localStorage.setItem('savedJobText', jobText);
    }
  }, [results, resumeText, jobText, currentScreen]);

  // Dynamic Loading Logic
  useEffect(() => {
    let interval;
    if (currentScreen === 'loading') {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => {
          // Stop at the last message to avoid looping
          if (prev >= loadingMessages.length - 1) {
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [currentScreen]);

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const handleStartOver = () => {
    if (window.confirm("Are you sure you want to clear this session and start over?")) {
      localStorage.removeItem('savedResults');
      localStorage.removeItem('savedResumeText');
      localStorage.removeItem('savedJobText');
      setResults({
        resume: '',
        original_ats_score: 0,
        optimized_ats_score: 0,
        changesSummary: [],
        retrievedAchievements: [],
        bulletComparisons: [],
        missingSkills: [],
        research: null,
        coverLetter: null,
        interview: null
      });
      setResumeText('');
      setJobText('');
      setJobUrl('');
      setCurrentScreen('workspace');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('geminiApiKey', newKey);
    axios.defaults.headers.common['X-Gemini-API-Key'] = newKey;
    setIsApiModalOpen(false);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      alert("⚠️ Please enter your Gemini API Key in the Settings menu before generating.");
      setIsSettingsOpen(true); // Open settings modal
      return;
    }

    if (!resumeText.trim() || resumeText.length < 50) {
      alert("⚠️ Please provide a valid, full resume text. The current text is too short.");
      return;
    }

    if (!jobText.trim()) {
      setErrorMsg("Please provide Job Description content before generating.");
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setCurrentScreen('loading');
    setIsGenerating(prev => ({ ...prev, resume: true })); // Start generating

    const savedFacts = localStorage.getItem('careerFacts');
    const careerFacts = savedFacts ? JSON.parse(savedFacts) : [];

    const basePayload = {
      resume_text: resumeText,
      job_description_text: jobText,
      gemini_api_key: apiKey,
      auditor_prompt: prompts.auditor,
      career_facts: careerFacts,
      session_instructions: sessionInstructions,
      custom_prompt: `${prompts.resume}\n\nGLOBAL RULES TO FOLLOW:\n${prompts.globalRules}`
    };

    const playSuccessSound = () => {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Premium chime
        audio.volume = 0.3;
        audio.play();
      } catch (e) {
        console.error("Audio playback blocked", e);
      }
    };

    try {
      // Correctly formatted fetch call
      const response = await fetch(`${API_BASE}/optimize-resume-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': apiKey
        },
        body: JSON.stringify(basePayload)
      });

      if (response.status === 404) {
        throw new Error("404: Streaming engine not found. Ensure backend is at /api/optimize-resume-stream");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to start stream' }));
        throw new Error(errorData.detail || 'Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResume = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(line.trim().slice(6));

              if (data.type === 'metadata') {
                setResults(prev => ({
                  ...prev,
                  detected_tone: data.tone,
                  target_skills: data.target_skills,
                  target_role: data.role,
                  resume: "",
                  coverLetter: null,
                  research: null,
                  interview: null
                }));
                setCurrentScreen('results');
              }
              // В handleGenerate, блок content:
              else if (data.type === 'content') {
                fullResume += data.delta;
                setResults(prev => ({ ...prev, resume: fullResume }));
                // Мікро-пауза для очей (опціонально, якщо хочеш повільніше)
                // await new Promise(r => setTimeout(r, 10)); 
              }
              else if (data.type === 'final') {
                // APPLE FIX: Глобально зрізаємо ```markdown оболонку перед збереженням
                setResults(prev => ({
                  ...prev,
                  // Регулярка видаляє ```markdown на початку і ``` в кінці
                  resume: prev.resume.replace(/```(markdown)?\n?/gi, '').replace(/```\n?$/gi, '').trim(),
                  original_ats_score: data.original_ats_score,
                  optimized_ats_score: data.optimized_ats_score,
                  missing_hard_skills: data.missing_hard_skills,
                  keywordMatrix: data.keyword_matrix,
                  initial_analysis: data.initial_analysis
                }));
                setIsGenerating(prev => ({ ...prev, resume: false })); // End generating
                playSuccessSound();
                setTimeout(() => setChatAutoTrigger(true), 1500);
              }
              else if (data.type === 'error') {
                throw new Error(data.detail);
              }
            } catch (e) {
              console.error("JSON Parse Error", e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setCurrentScreen('workspace');
      setErrorMsg(err.message || "An error occurred.");
      setIsGenerating(prev => ({ ...prev, resume: false })); // Reset on error
    } finally {
      setLoading(false);
    }
  };

  // 3. ПРЕМІАЛЬНА ЛОГІКА ДЛЯ ЛЕНДІНГУ
  if (currentScreen === 'landing') {
    return (
      <AnimatePresence mode="popLayout">
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Landing onStart={() => {
            const savedKey = localStorage.getItem('geminiApiKey');
            if (!savedKey) {
              // Якщо ключа немає — активуємо вхід через модалку
              setIsApiModalOpen(true);
            } else {
              // Якщо ключ вже є — летимо відразу в роботу
              setCurrentScreen('workspace');
            }
          }} />

          {/* Показуємо Shield тільки коли натиснули старт і немає ключа */}
          {isApiModalOpen && !apiKey && (
            <WelcomeShield
              onComplete={(key) => {
                setApiKey(key);
                localStorage.setItem('geminiApiKey', key);
                // Налаштовуємо axios відразу для майбутніх запитів
                axios.defaults.headers.common['X-Gemini-API-Key'] = key;
                setIsApiModalOpen(false);
                setCurrentScreen('workspace');
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 pb-12">
      {/* API Setup Modal */}
      <ApiSetupModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onSave={handleSaveApiKey}
        initialKey={apiKey}
      />

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setCurrentScreen('landing')}
          >
            <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-primary group-hover:opacity-80 transition-opacity">
              Career Copilot
            </h1>
          </div>
          <button
            onClick={() => {
              console.log("⚙️ Settings clicked");
              setIsSettingsOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Settings size={18} />
            <span className="font-medium text-sm hidden sm:inline">Settings</span>
            {!apiKey && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></div>}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA BY SCREEN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AnimatePresence mode="popLayout">
          {/* === SCREEN 2: WORKSPACE === */}
          {currentScreen === 'workspace' && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pb-24 lg:pb-0"
            >
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Sparkles className="text-indigo-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-indigo-900">
                  <strong>Welcome to Career Copilot!</strong> Paste your master resume on the left, the target job on the right, and let our AI optimize your application.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start relative">
                <div className="space-y-6">
                  <ResumeInput resumeText={resumeText} setResumeText={setResumeText} />
                </div>
                <div className="space-y-6">
                  <JobInput jobUrl={jobUrl} setJobUrl={setJobUrl} jobText={jobText} setJobText={setJobText} />
                  <div className="mt-6">
                    <button
                      onClick={handleGenerate}
                      disabled={loading || !resumeText.trim() || !jobText.trim()}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-5 rounded-[2rem] font-black text-lg shadow-[0_20px_40px_rgba(15,23,42,0.2)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-3 group"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Zap className="text-amber-400 group-hover:scale-110 transition-transform" fill="currentColor" />
                          Generate Optimized Resume
                        </>
                      )}
                    </button>
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="mt-6 p-4 bg-white/80 backdrop-blur-xl border border-red-100 rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.1)] flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                          <AlertCircle className="text-red-500" size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-0.5">System Error</p>
                          <p className="text-[13px] text-slate-600 font-medium leading-tight">{errorMsg}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* === SCREEN 3: LOADING === */}
          {currentScreen === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-col items-center justify-center min-h-[50vh] space-y-10"
            >
              <div className="relative">
                <Loader2 className="animate-spin text-indigo-600" size={56} strokeWidth={2.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                </div>
              </div>
              <div className="text-center max-w-md h-16 relative">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={loadingStep} // Це змусить текст плавно мінятися!
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="text-[17px] font-black tracking-tight text-slate-800 mb-2 absolute w-full left-0 right-0"
                  >
                    {loadingMessages[loadingStep]}
                  </motion.h2>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* === SCREEN 4: RESULTS === */}
          {currentScreen === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pr-12"
            >
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentScreen('workspace')}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-semibold transition-colors"
                  >
                    <ArrowLeft size={16} /> New Application
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleStartOver}
                    className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                  >
                    Start Over
                  </button>
                </div>
              </div>

              <div className="min-h-[600px]">
                <ResultTabs
                  results={results}
                  setResults={setResults}
                  resumeText={resumeText}
                  jobText={jobText}
                  apiKey={apiKey}
                  prompts={prompts}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODALS & FAB */}
      <AnimatePresence mode="popLayout">
        {isSettingsOpen && (
          <SettingsDrawer
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            apiKey={apiKey}
            setApiKey={setApiKey}
            settings={userSettings}
            onUpdateSettings={(newSettings) => {
              const updated = { ...userSettings, ...newSettings };
              setUserSettings(updated);
              if (newSettings.tone) localStorage.setItem('userTone', newSettings.tone);
              if (newSettings.quality) localStorage.setItem('userQuality', newSettings.quality);
            }}
          />
        )}
      </AnimatePresence>

      {showFAB && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 p-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:-translate-y-1 transition-all z-50 flex items-center justify-center"
        >
          <ArrowUp size={24} />
        </button>
      )}

      {currentScreen === 'results' && (
        <FloatingChat
          onRegenerate={handleGenerate}
          hasSeenChat={hasSeenChat}
          setHasSeenChat={setHasSeenChat}
          autoTrigger={chatAutoTrigger}
        />
      )}

      <AnimatePresence mode="popLayout">
        {showTutorial && (
          <motion.div key="tutorial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WelcomeOverlay onDismiss={dismissTutorial} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
