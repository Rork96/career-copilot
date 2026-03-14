import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Sparkles, AlertCircle, ArrowUp, Loader2, TriangleAlert } from 'lucide-react';

import ResumeInput from './components/ResumeInput';
import JobInput from './components/JobInput';
import SettingsModal from './components/SettingsModal';
import ResultTabs from './components/ResultTabs';
import FloatingChat from './components/FloatingChat';
import './App.css';

const API_BASE = 'http://localhost:8000/api';

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

  // Load Settings on Mount
  useEffect(() => {
    const savedKey = localStorage.getItem('geminiApiKey');
    if (savedKey) setApiKey(savedKey);

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
      const resumeRes = await axios.post(`${API_BASE}/optimize-resume`, {
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

        {/* === SCREEN 1: LANDING === */}
        {currentScreen === 'landing' && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">

            {/* Hero */}
            <div className="space-y-6">
              <Sparkles size={64} className="text-primary mx-auto mb-4" />
              <h2 className="text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight">
                Tailor Your Application <br className="hidden md:block" /> in <span className="text-primary">Seconds</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                Use the power of AI to automatically adapt your master resume and generate customized cover letters that bypass ATS screens.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setCurrentScreen('workspace')}
                  className="px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-1 transition-all"
                >
                  Start Tailoring Now
                </button>
              </div>
            </div>

            {/* How it Works & Privacy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-5xl mx-auto pt-10 border-t border-slate-200">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4">How It Works</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-slate-600"><div className="w-6 h-6 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold shrink-0 text-sm">1</div> Paste your Master Resume (or upload PDF).</li>
                  <li className="flex gap-3 text-slate-600"><div className="w-6 h-6 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold shrink-0 text-sm">2</div> Paste the URL of the job you want.</li>
                  <li className="flex gap-3 text-slate-600"><div className="w-6 h-6 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold shrink-0 text-sm">3</div> Our AI restructures your resume, checks for hallucinations, and preps you for the interview.</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Settings size={20} className="text-slate-400" />
                  Privacy First (BYOK)
                </h3>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  Career Copilot operates fully in your browser. We do not store your resumes or data on our servers. You Bring Your Own Key (BYOK) from Google Gemini.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-800 text-sm mb-2">How to get a free Gemini API Key?</h4>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                    <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.</li>
                    <li>Sign in and click <strong>Create API Key</strong>.</li>
                    <li>Copy the key.</li>
                    <li>Click 'Settings' (top right) to paste it.</li>
                  </ol>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* === SCREEN 2: WORKSPACE === */}
        {currentScreen === 'workspace' && (
          <>
            {!apiKey && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-amber-800 font-semibold mb-1">API Key Required</h3>
                  <p className="text-amber-700 text-sm">Please configure your Google Gemini API key in the settings to start generating tailored resumes.</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <ResumeInput resumeText={resumeText} setResumeText={setResumeText} />
              </div>
              <div className="space-y-6">
                <JobInput jobUrl={jobUrl} setJobUrl={setJobUrl} jobText={jobText} setJobText={setJobText} />
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mt-6">
                  <button
                    onClick={handleGenerate}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-primary hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all group"
                  >
                    <Sparkles size={20} className="group-hover:text-yellow-200 transition-colors" /> Tailor Application
                  </button>
                  {errorMsg && (
                    <p className="text-red-600 text-sm mt-3 text-center font-medium bg-red-50 py-2 rounded-md">
                      {errorMsg}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* === SCREEN 3: LOADING === */}
        {currentScreen === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
            <Loader2 className="animate-spin text-primary" size={64} />
            <div className="text-center max-w-md h-16">
              <h2 className="text-xl font-bold text-slate-800 mb-2 transition-all duration-300">
                Tailoring your resume to Canadian standards...
              </h2>
            </div>
          </div>
        )}

        {/* === SCREEN 4: RESULTS === */}
        {currentScreen === 'results' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h2 className="font-bold text-slate-800">Your Tailored Application is Ready!</h2>
              <button
                onClick={() => setCurrentScreen('workspace')}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Start Another Application
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <TriangleAlert className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong>Disclaimer:</strong> AI can occasionally make mistakes or hallucinate facts. Please review your tailored resume and generated documents carefully to ensure all information is 100% accurate before applying.
              </p>
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
      {currentScreen === 'results' && <FloatingChat onRegenerate={handleGenerate} />}
    </div>
  );
}

export default App;
