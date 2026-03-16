import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Sparkles, AlertCircle, ArrowUp, Loader2, TriangleAlert, ArrowLeft } from 'lucide-react';

import ResumeInput from './components/ResumeInput';
import JobInput from './components/JobInput';
import SettingsModal from './components/SettingsModal';
import ResultTabs from './components/ResultTabs';
import FloatingChat from './components/FloatingChat';
import Landing from './components/Landing';
import './App.css';

const API_BASE = 'http://cv.wealthifai.xyz/api' || 'http://localhost:8000/api';

const defaultPrompts = {
  resume: "You are an elite Canadian Career Strategist and ATS Optimization Expert. Your task is to tailor the provided Original Resume to perfectly match the provided Job Description. STRICT CANADIAN STANDARDS TO FOLLOW: 1. Silent Third Person: Completely eliminate personal pronouns ('I', 'me', 'my'). 2. Privacy Compliance: Strictly remove any mention of age, gender, nationality, marital status, or exact street address. 3. The Achievement Formula: Rewrite every work experience bullet point to start with a strong Action Verb, followed by the Task/Project, and ending with a Quantifiable Business Result. 4. Keyword Optimization: Naturally integrate keywords from the Job Description. CRITICAL: Do NOT hallucinate facts, companies, or degrees. Output ONLY clean Markdown formatting.",
  coverLetter: "You are an expert Canadian Executive Coach. Based on the provided Resume and Job Description, write a compelling, highly targeted Cover Letter. Format: Standard North American business letter. Structure: Paragraph 1 (Hook connecting core strength to company need), Paragraph 2 (Proof using 1-2 metrics from resume), Paragraph 3 (Call to Action). Tone: Confident, professional, and concise in the 'Silent Third Person'. Do NOT invent skills. Output ONLY clean Markdown formatting.",
  interview: "You are a Senior Technical Recruiter in Canada. Predict 10 high-value interview questions based on the Resume and JD (5 Technical, 5 Behavioral using STAR method context). For each, provide the Question, 'Why they are asking this', and a 'Suggested Strategy' based strictly on the candidate's actual experience. Output MUST be a valid JSON object with a single key 'markdown' containing the formatted text.",
  auditor: "You are a Strict Compliance Officer and Data Integrity Auditor. Audit the AI-Generated Resume against the Original Resume. 1. Identify and REMOVE any fabricated companies, job titles, projects, degrees, or metrics not present in the Original Resume. 2. Ensure 'Silent Third Person' tone. 3. Calculate an ATS Match Percentage (0-100%). You MUST return your response STRICTLY as a valid JSON object with keys: 'optimized_markdown' (string), 'ats_match_percentage' (integer), and 'changes_summary' (array of strings).",
  globalRules: "Always use Canadian spelling (e.g., 'Targeted', 'Color' -> 'Colour' if applicable, though usually US spelling is standard in tech, Canadian resumes often prefer standard English. Use 'Silent Third Person' throughout. Focus on senior leadership traits.)"
};

function App() {
  // Global App State
  const [apiKey, setApiKey] = useState('');
  const [prompts, setPrompts] = useState(defaultPrompts);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Workspace State
  const [resumeText, setResumeText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobText, setJobText] = useState('');

  // App Navigation State (landing, workspace, loading, results)
  const [currentScreen, setCurrentScreen] = useState('landing');

  // Generation State
  const [status, setStatus] = useState('idle'); // idle, generating, success, error
  const [errorMsg, setErrorMsg] = useState('');
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

  // UX State
  const [showFAB, setShowFAB] = useState(false);
  const [hasSeenChat, setHasSeenChat] = useState(localStorage.getItem('hasSeenChat') === 'true');
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Analyzing Job Description...",
    "Extracting Knowledge Base Facts...",
    "Optimizing ATS Keywords...",
    "Formatting Canadian Standard PDF..."
  ];

  // Load Settings and Session on Mount
  useEffect(() => {
    const savedKey = localStorage.getItem('geminiApiKey');
    if (savedKey) setApiKey(savedKey);

    const savedResults = localStorage.getItem('savedResults');
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
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [currentScreen]);

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


  const handleGenerate = async () => {
    if (!apiKey) {
      alert("⚠️ Please enter your Gemini API Key in the Settings menu before generating.");
      setIsSettingsOpen(true);
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
    setCurrentScreen('loading');

    const savedFacts = localStorage.getItem('careerFacts');
    const careerFacts = savedFacts ? JSON.parse(savedFacts) : [];

    const basePayload = {
      resume_text: resumeText,
      job_description_text: jobText,
      gemini_api_key: apiKey,
      auditor_prompt: prompts.auditor,
      career_facts: careerFacts,
      session_instructions: sessionInstructions
    };

    // Ensure header is set even if not on mount
    axios.defaults.headers.common['X-Gemini-API-Key'] = apiKey;

    try {
      const resumeRes = await axios.post(`${API_BASE}/optimize-resume-v2`, {
        ...basePayload,
        custom_prompt: `${prompts.resume}\n\nGLOBAL RULES TO FOLLOW:\n${prompts.globalRules}`
      });

      setResults({
        resume: resumeRes.data.optimized_markdown,
        original_ats_score: resumeRes.data.original_ats_score,
        optimized_ats_score: resumeRes.data.optimized_ats_score,
        changesSummary: resumeRes.data.changes_summary || [],
        retrievedAchievements: resumeRes.data.retrieved_achievements || [],
        bulletComparisons: resumeRes.data.bullet_comparisons || [],
        missing_hard_skills: resumeRes.data.missing_hard_skills || [],
        keyword_optimizations: resumeRes.data.keyword_optimizations || [],
        recommendations: resumeRes.data.recommendations || [],
        keywordMatrix: resumeRes.data.keyword_matrix || [],
        detected_tone: resumeRes.data.detected_tone,
        research: null,
        coverLetter: null, // Reset generated assets
        interview: null
      });

      setCurrentScreen('results');
    } catch (err) {
      console.error(err);
      setCurrentScreen('workspace');
      setErrorMsg(err.response?.data?.detail || "An error occurred during AI generation.");
    }
  };

  if (currentScreen === 'landing') {
    return <Landing onStart={() => setCurrentScreen('workspace')} />;
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 pb-12">
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
            onClick={() => setIsSettingsOpen(true)}
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

        {/* === SCREEN 2: WORKSPACE === */}
        {currentScreen === 'workspace' && (
          <div className="pb-24 lg:pb-0">
            {/* New Onboarding Banner */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <Sparkles className="text-indigo-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-indigo-900">
                <strong>Welcome to Career Copilot!</strong> Paste your master resume on the left, the target job on the right, and let our AI optimize your application.
              </p>
            </div>

            {!apiKey && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 scale-95 opacity-80">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-amber-800 font-semibold mb-1 text-sm">API Key Required</h3>
                  <p className="text-amber-700 text-xs text-balance">Configure your Gemini key in settings to unlock AI Optimization.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Don't have one? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Get a free Google Gemini key</a>. Stored locally.</p>
                </div>
              </div>
            )}

            {/* 50/50 Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Master Resume</span>
                </div>
                <ResumeInput resumeText={resumeText} setResumeText={setResumeText} />
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Target Job</span>
                </div>
                <JobInput jobUrl={jobUrl} setJobUrl={setJobUrl} jobText={jobText} setJobText={setJobText} />

                {/* Fixed Mobile Button Container */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 lg:static lg:bg-transparent lg:border-none lg:p-0 lg:mt-6">
                  <div className="max-w-7xl mx-auto lg:max-w-none">
                    <button
                      onClick={handleGenerate}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(59,130,246,0.2)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 transition-all group"
                    >
                      <Sparkles size={20} className="group-hover:text-yellow-200 transition-colors" /> Analyze & Optimize ✨
                    </button>
                    {errorMsg && (
                      <p className="text-red-600 text-[10px] mt-3 text-center font-bold uppercase tracking-tight bg-red-50 py-2 rounded-lg">
                        {errorMsg}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === SCREEN 3: LOADING === */}
        {currentScreen === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <Loader2 className="animate-spin text-primary" size={64} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-50 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>
            <div className="text-center max-w-md h-16">
              <h2 className="text-xl font-bold text-slate-800 mb-2 transition-all duration-500 opacity-100 transform translate-y-0">
                {loadingMessages[loadingStep]}
              </h2>
              <p className="text-sm text-slate-500 animate-pulse">Running AI Audit Engine...</p>
            </div>
          </div>
        )}

        {/* === SCREEN 4: RESULTS === */}
        {currentScreen === 'results' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              />
            </div>
          </div>
        )}
      </main>

      {/* MODALS & FAB */}
      {showFAB && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 p-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:-translate-y-1 transition-all z-50 flex items-center justify-center"
          title="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        prompts={prompts}
        setPrompts={setPrompts}
      />

      {/* Floating AI Assistant - Only on results screen */}
      {currentScreen === 'results' && (
        <FloatingChat
          onRegenerate={handleGenerate}
          hasSeenChat={hasSeenChat}
          setHasSeenChat={setHasSeenChat}
        />
      )}
    </div>
  );
}

export default App;
