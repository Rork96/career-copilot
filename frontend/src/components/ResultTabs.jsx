import { useState } from 'react';
import PropTypes from 'prop-types';
import { Copy, Check, X, Download, FileText, CheckCircle2, Sparkles, Loader2, Zap, BrainCircuit, Info, ArrowRight, AlertTriangle, ChevronDown, Edit3, ShieldCheck, Target, TrendingUp, Compass, MessageSquarePlus, Building, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import ResumePDFTemplate from './ResumePDFTemplate';

const API_BASE = 'http://localhost:8000/api';

const ScoreGauge = ({ score, label, color = 'blue' }) => {
    const colorClass = color === 'green' ? 'text-green-600' : color === 'amber' ? 'text-amber-500' : color === 'red' ? 'text-red-500' : color === 'slate' ? 'text-slate-400' : 'text-blue-600';
    const bgColorClass = color === 'green' ? 'bg-green-50' : color === 'amber' ? 'bg-amber-50' : color === 'red' ? 'bg-red-50' : color === 'slate' ? 'bg-slate-50' : 'bg-blue-50';

    return (
        <div className={`p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden ${bgColorClass} flex-1 shadow-sm`}>
            <div className="relative z-10">
                <div className="w-16 h-16 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="32" cy="32" r="28"
                            stroke="currentColor" strokeWidth="4" fill="transparent"
                            className="text-slate-200/50"
                        />
                        <circle
                            cx="32" cy="32" r="28"
                            stroke="currentColor" strokeWidth="4" fill="transparent"
                            strokeDasharray={2 * Math.PI * 28}
                            strokeDashoffset={2 * Math.PI * 28 * (1 - score / 100)}
                            className={`${colorClass} transition-all duration-1000 ease-out`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className={`absolute text-xs font-black ${colorClass}`}>{score}%</span>
                </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2">{label}</p>
        </div>
    );
};

const ComparisonGauges = ({ original, optimized, tone }) => {
    const diff = optimized - original;
    const isImproved = diff > 0;

    const ToneIcon = tone === 'Strategic' ? ShieldCheck : tone === 'Technical' ? Zap : Compass;

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <ScoreGauge score={original} label="Original" color="slate" />
                <div className="flex items-center justify-center text-slate-300">
                    <ArrowRight size={20} />
                </div>
                <ScoreGauge score={optimized} label="Tailored" color={optimized > 80 ? 'green' : 'amber'} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all ${isImproved ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className={isImproved ? 'text-green-600' : 'text-slate-400'} />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Optimization Lift
                        </span>
                    </div>
                    <span className={`text-sm font-black ${isImproved ? 'text-green-600' : 'text-slate-500'}`}>
                        {isImproved ? `+${diff}%` : `${diff}%`}
                    </span>
                </div>

                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <ToneIcon size={16} className="text-blue-600" />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Detected Tone
                        </span>
                    </div>
                    <span className="text-sm font-black text-blue-600">
                        {tone || 'Professional'}
                    </span>
                </div>
            </div>

            {optimized < 70 && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex gap-2 items-start">
                        <Info size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                            <strong className="font-bold">Boost your score:</strong> Add more specific achievements to your Knowledge Base via the AI Chat to help the AI tailor your resume even further.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ResultTabs({ results, setResults, resumeText, jobText, apiKey, prompts }) {
    const [activeTab, setActiveTab] = useState('resume');
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState({ coverLetter: false, interview: false, research: false });
    const [errors, setErrors] = useState({ coverLetter: null, interview: null, research: null });
    const [isEditing, setIsEditing] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [insightTab, setInsightTab] = useState('gaps'); // 'gaps' or 'roadmap'
    const [addedSkills, setAddedSkills] = useState({});
    const [matrixPage, setMatrixPage] = useState(0);
    const [showAllMatrix, setShowAllMatrix] = useState(false);

    const handleAddToKnowledgeBase = (skill) => {
        const savedFacts = localStorage.getItem('careerFacts');
        const facts = savedFacts ? JSON.parse(savedFacts) : [];

        if (!facts.includes(skill)) {
            facts.push(skill);
            localStorage.setItem('careerFacts', JSON.stringify(facts));
        }

        setAddedSkills(prev => ({ ...prev, [skill]: true }));
    };

    if (!results.resume) {
        return null;
    }

    const handleCopy = async () => {
        let textToCopy = '';
        if (activeTab === 'resume') textToCopy = results.resume;
        if (activeTab === 'coverLetter') textToCopy = results.coverLetter;
        if (activeTab === 'interview') textToCopy = results.interview;

        try {
            await navigator.clipboard.writeText(stripMarkdown(textToCopy));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const stripMarkdown = (markdownString) => {
        if (!markdownString) return '';
        return markdownString
            .replace(/^#+\s+/gm, '')
            .replace(/(\*\*|__)(.*?)\1/g, '$2')
            .replace(/(\*|_)(.*?)\1/g, '$2')
            .replace(/^\s*\*\s+/gm, '- ')
            .trim();
    };

    const handleDownload = () => {
        let textToDownload = '';
        let filename = '';
        if (activeTab === 'resume') {
            textToDownload = results.resume;
            filename = 'Tailored_Resume.txt';
        } else if (activeTab === 'coverLetter') {
            textToDownload = results.coverLetter;
            filename = 'Cover_Letter.txt';
        } else if (activeTab === 'interview') {
            textToDownload = results.interview;
            filename = 'Interview_Prep.txt';
        }

        const cleanText = stripMarkdown(textToDownload);
        const blob = new Blob([cleanText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadPDF = () => {
        const originalTitle = document.title;
        const filename = `${(results.candidate_name || 'Candidate').replace(/\s+/g, '_')}_${(results.target_role || 'Role').replace(/\s+/g, '_')}_Resume`;

        document.title = filename;
        window.print();
        document.title = originalTitle;
    };

    const generateCoverLetter = async () => {
        setIsGenerating(prev => ({ ...prev, coverLetter: true }));
        setErrors(prev => ({ ...prev, coverLetter: null }));
        try {
            const basePayload = { resume_text: resumeText, job_description_text: jobText, gemini_api_key: apiKey };
            const res = await axios.post(`${API_BASE}/generate-cover-letter`, { ...basePayload, custom_prompt: prompts.coverLetter });
            setResults(prev => ({ ...prev, coverLetter: res.data.markdown }));
        } catch (err) {
            console.error(err);
            setErrors(prev => ({ ...prev, coverLetter: err.response?.data?.detail || "Failed to generate Cover Letter." }));
        } finally {
            setIsGenerating(prev => ({ ...prev, coverLetter: false }));
        }
    };

    const generateInterview = async () => {
        setIsGenerating(prev => ({ ...prev, interview: true }));
        setErrors(prev => ({ ...prev, interview: null }));
        try {
            const basePayload = { resume_text: resumeText, job_description_text: jobText, gemini_api_key: apiKey };
            const res = await axios.post(`${API_BASE}/generate-interview`, { ...basePayload, custom_prompt: prompts.interview });
            setResults(prev => ({ ...prev, interview: res.data.markdown }));
        } catch (err) {
            console.error(err);
            setErrors(prev => ({ ...prev, interview: err.response?.data?.detail || "Failed to predict Interview Questions." }));
        } finally {
            setIsGenerating(prev => ({ ...prev, interview: false }));
        }
    };

    const generateResearch = async (e) => {
        if (e) e.preventDefault(); // Блокуємо перезавантаження!
        setIsGenerating(prev => ({ ...prev, research: true }));
        setErrors(prev => ({ ...prev, research: null }));
        // ... (все інше залишається без змін)
        try {
            const payload = {
                resume_text: resumeText,
                job_description_text: jobText,
                gemini_api_key: apiKey,
                custom_prompt: "Analyze the company culture, core business, and suggest 3 interview questions."
            };
            const res = await axios.post(`${API_BASE}/generate-research`, payload);
            setResults(prev => ({ ...prev, research: res.data.markdown }));
        } catch (err) {
            console.error(err);
            setErrors(prev => ({ ...prev, research: err.response?.data?.detail || "Failed to generate Company Research." }));
        } finally {
            setIsGenerating(prev => ({ ...prev, research: false }));
        }
    };

    const tabs = [
        { id: 'resume', label: 'Resume' },
        { id: 'coverLetter', label: 'Cover Letter' },
        { id: 'research', label: 'Company Research' },
        { id: 'interview', label: 'Interview Q&A' },
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* COMPACT INSIGHTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Analytics */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Zap size={12} className="text-primary" /> Core Analytics
                        </h3>
                        <ComparisonGauges
                            original={results.original_ats_score}
                            optimized={results.optimized_ats_score}
                            tone={results.detected_tone}
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="flex bg-slate-50 border-b border-slate-100 p-1">
                            <button
                                onClick={() => setInsightTab('gaps')}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${insightTab === 'gaps' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Target size={14} /> Target Skills
                            </button>
                            <button
                                onClick={() => setInsightTab('roadmap')}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${insightTab === 'roadmap' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <TrendingUp size={14} /> Success Roadmap
                            </button>
                        </div>

                        <div className="p-4 flex-1">
                            {insightTab === 'gaps' ? (
                                <div className="space-y-4">
                                    {/* Gamified Progress Bar */}
                                    <div>
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Skills Matched</span>
                                            <span className="text-sm font-black text-primary">
                                                {Math.max(0, 10 - (results.missing_hard_skills?.length || 0))}/10
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.max(10, (10 - (results.missing_hard_skills?.length || 0)) * 10)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.1em] flex items-center gap-1.5">
                                                <AlertTriangle size={12} /> Critical Gaps
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {results.missing_hard_skills && results.missing_hard_skills.length > 0 ? (
                                                    results.missing_hard_skills.map((skill, idx) => (
                                                        <div key={idx} className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-lg flex items-center gap-2 text-xs font-bold shadow-sm transition-transform hover:scale-105">
                                                            <span>{skill}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddToKnowledgeBase(skill)}
                                                                disabled={addedSkills[skill]}
                                                                className={`p-0.5 rounded transition-colors ${addedSkills[skill] ? 'text-green-500' : 'hover:bg-red-200 text-red-700'}`}
                                                                title={addedSkills[skill] ? "Already in Knowledge Base" : "Add to Knowledge Base"}
                                                            >
                                                                {addedSkills[skill] ? <CheckCircle2 size={12} /> : <MessageSquarePlus size={12} />}
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic py-1">No missing hard skills detected.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.1em] flex items-center gap-1.5">
                                                <Sparkles size={12} /> Keywords
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {results.keyword_optimizations && results.keyword_optimizations.length > 0 ? (
                                                    results.keyword_optimizations.map((skill, idx) => (
                                                        <div key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg flex items-center gap-2 text-xs font-bold shadow-sm transition-transform hover:scale-105">
                                                            <span>{skill}</span>
                                                            <button
                                                                type="button"
                                                                className="hover:bg-blue-200 p-0.5 rounded transition-colors"
                                                            >
                                                                <BrainCircuit size={12} />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic py-1">Keywords fully optimized.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ATS Keyword Matrix */}
                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.1em] flex items-center gap-1.5">
                                                <ShieldCheck size={12} className="text-primary" /> ATS Keyword Matrix
                                            </h4>
                                            <label className="flex items-center gap-1.5 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={showAllMatrix}
                                                    onChange={(e) => setShowAllMatrix(e.target.checked)}
                                                    className="w-3 h-3 rounded text-primary focus:ring-primary border-slate-300"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 transition-colors">Show All</span>
                                            </label>
                                        </div>
                                        <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                                        <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keyword</th>
                                                        <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Original</th>
                                                        <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Tailored</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {(results.keywordMatrix && results.keywordMatrix.length > 0) ? (
                                                        (showAllMatrix ? results.keywordMatrix : results.keywordMatrix.slice(matrixPage * 5, (matrixPage + 1) * 5)).map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-3 py-2 text-xs font-semibold text-slate-700">{row.skill}</td>
                                                                <td className="px-3 py-2 text-center text-xs">
                                                                    {row.in_original ? (
                                                                        <Check size={14} className="text-green-500 mx-auto" strokeWidth={3} />
                                                                    ) : (
                                                                        <X size={14} className="text-slate-300 mx-auto" strokeWidth={3} />
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-center text-xs">
                                                                    {row.in_tailored ? (
                                                                        <Check size={14} className="text-blue-500 mx-auto" strokeWidth={3} />
                                                                    ) : (
                                                                        <X size={14} className="text-slate-300 mx-auto" strokeWidth={3} />
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="3" className="px-3 py-6 text-center text-xs text-slate-400 italic">
                                                                Regenerate to see keyword matrix.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        {!showAllMatrix && results.keywordMatrix && results.keywordMatrix.length > 5 && (
                                            <div className="flex items-center justify-between mt-3 px-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    Page {matrixPage + 1} of {Math.ceil(results.keywordMatrix.length / 5)}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setMatrixPage(Math.max(0, matrixPage - 1))}
                                                        disabled={matrixPage === 0}
                                                        className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                                                    >
                                                        <ChevronDown size={14} className="rotate-90" />
                                                    </button>
                                                    <button
                                                        onClick={() => setMatrixPage(Math.min(Math.ceil(results.keywordMatrix.length / 5) - 1, matrixPage + 1))}
                                                        disabled={matrixPage >= Math.ceil(results.keywordMatrix.length / 5) - 1}
                                                        className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                                                    >
                                                        <ChevronDown size={14} className="-rotate-90" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 relative">
                                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-100"></div>
                                    <div className="space-y-4 relative z-10">
                                        {results.recommendations && results.recommendations.length > 0 ? (
                                            results.recommendations.map((rec, idx) => (
                                                <div key={idx} className="flex gap-3 items-start group pl-1">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <CheckCircle2 size={16} className="text-green-500 shadow-sm transition-transform group-hover:scale-110" />
                                                    </div>
                                                    <p className="text-sm text-slate-700 leading-relaxed font-bold">{rec}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center">
                                                <ShieldCheck size={24} className="mx-auto text-green-500 mb-2 opacity-50" />
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No recommendations</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {results.retrieved_achievements && results.retrieved_achievements.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <BrainCircuit size={12} className="text-purple-500" /> Facts Integrated
                            </h3>
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-2 max-h-[140px] overflow-y-auto">
                                {results.retrieved_achievements.map((fact, idx) => (
                                    <div key={idx} className="flex gap-2 items-start p-2 bg-slate-50 rounded-lg border border-slate-100/50">
                                        <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-slate-700 leading-relaxed font-medium">{fact}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Impact Analysis */}
                <div className="lg:col-span-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Sparkles size={12} className="text-blue-500" /> Optimization Impact
                    </h3>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col max-h-[460px] overflow-hidden">
                        <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 shrink-0">
                            <div className="col-span-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Source Fact</div>
                            <div className="col-span-1"></div>
                            <div className="col-span-6 text-xs font-bold text-blue-500 uppercase tracking-wider">Tailored Improvement</div>
                        </div>
                        <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[300px]">
                            {results.bulletComparisons && results.bulletComparisons.length > 0 ? (
                                results.bulletComparisons.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center group hover:bg-slate-50 transition-colors">
                                        <div className="col-span-5">
                                            <p className="text-xs text-slate-500 italic leading-relaxed">"{item.old}"</p>
                                        </div>
                                        <div className="col-span-1 flex justify-center text-slate-400">
                                            <ArrowRight size={16} />
                                        </div>
                                        <div className="col-span-6">
                                            <p className="text-sm text-slate-900 font-semibold leading-relaxed">
                                                {item.new}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-400 text-sm italic">
                                    General ATS formatting applied.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* DOCUMENT VIEWER */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
                <div className="bg-slate-50/50 border-b border-slate-100 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex bg-slate-200/50 p-1 rounded-lg w-full sm:w-auto overflow-x-auto whitespace-nowrap hide-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-1.5 font-bold text-xs rounded-md transition-all
                                ${activeTab === tab.id
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                    }
                            `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {activeTab === 'resume' && (
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${isEditing
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-inner'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:shadow-sm'
                                    }`}
                                title={isEditing ? "Save & Preview" : "Edit Markdown"}
                            >
                                <Edit3 size={14} /> {isEditing ? 'Done' : 'Edit'}
                            </button>
                        )}

                        <button
                            onClick={handleCopy}
                            className="p-2 border border-slate-200 bg-white hover:border-primary hover:text-primary text-slate-500 rounded-lg shadow-sm transition-all"
                            title="Copy"
                        >
                            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsExportOpen(!isExportOpen)}
                                onBlur={() => setTimeout(() => setIsExportOpen(false), 200)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                            >
                                <Download size={14} /> Export <ChevronDown size={12} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isExportOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                                    {activeTab === 'resume' && (
                                        <button
                                            onClick={() => { handleDownloadPDF(); setIsExportOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                        >
                                            <FileText size={16} className="text-blue-600" /> Export as PDF
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { handleDownload(); setIsExportOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                    >
                                        <FileText size={16} className="text-slate-500" /> Export as TXT
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-0 overflow-y-auto flex-1 bg-slate-100 flex justify-center py-10">
                    <div className="max-w-3xl w-full mx-auto p-0">
                        {activeTab === 'resume' && (
                            <div className="bg-white shadow-2xl p-12 md:p-16 min-h-[1056px] w-[816px] mx-auto border border-slate-200 animate-in zoom-in-95 duration-500 transform origin-top">
                                <div id="printable-resume" className="prose prose-sm max-w-none prose-slate prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-700 prose-li:text-slate-700 h-full">
                                    {isEditing ? (
                                        <textarea
                                            value={results.resume}
                                            onChange={(e) => setResults(prev => ({ ...prev, resume: e.target.value }))}
                                            className="w-full h-[950px] p-10 border-2 border-primary/20 rounded-xl font-mono text-sm leading-relaxed focus:outline-none focus:border-primary transition-all resize-none bg-slate-50/50 shadow-inner"
                                            placeholder="Edit your resume markdown here..."
                                        />
                                    ) : (
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ children }) => <h1 className="text-3xl font-bold uppercase tracking-tight text-center border-b-2 border-slate-900 pb-4 mb-8">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-base font-bold uppercase tracking-widest border-b border-slate-300 mt-10 mb-5 pb-1">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-sm font-bold mt-6 mb-2">{children}</h3>,
                                                p: ({ children }) => <p className="text-xs leading-relaxed mb-3 text-justify">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc ml-6 space-y-2 mb-6">{children}</ul>,
                                                li: ({ children }) => <li className="text-xs mb-2 leading-relaxed">{children}</li>,
                                            }}
                                        >
                                            {results.resume}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'coverLetter' && (
                            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto min-h-[600px]">
                                {results.coverLetter ? (
                                    <div className="prose prose-sm max-w-none prose-slate">
                                        <ReactMarkdown>{results.coverLetter}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                        <div className="p-4 bg-blue-50 text-primary rounded-2xl">
                                            <FileText size={32} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800">Generate Cover Letter</h3>
                                        <button
                                            onClick={generateCoverLetter}
                                            disabled={isGenerating.coverLetter}
                                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-all text-xs disabled:opacity-50"
                                        >
                                            {isGenerating.coverLetter ? <Loader2 size={16} className="animate-spin" /> : 'Create Cover Letter'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'research' && (
                            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto min-h-[600px] overflow-hidden">
                                {results.research ? (
                                    <div className="prose prose-sm max-w-none prose-slate mx-auto">
                                        <ReactMarkdown>{results.research}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                        <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl">
                                            <Building size={32} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-black text-slate-800">Company Research</h3>
                                            <p className="text-xs text-slate-500 max-w-[280px] mx-auto">Analyze the company's culture, business model, and strategic questions for your interview.</p>
                                        </div>
                                        <button
                                            onClick={generateResearch}
                                            disabled={isGenerating.research}
                                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-all text-xs disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isGenerating.research ? <Loader2 size={16} className="animate-spin" /> : <><Search size={14} /> Analyze Company</>}
                                        </button>
                                        {errors.research && <p className="text-xs text-red-500 font-bold mt-4 bg-red-50 px-4 py-2 rounded-full border border-red-100">{errors.research}</p>}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'interview' && (
                            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto min-h-[600px]">
                                {results.interview ? (
                                    <div className="prose prose-sm max-w-none prose-slate">
                                        <ReactMarkdown>{results.interview}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                        <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                                            <BrainCircuit size={32} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800">Predict Interview Questions</h3>
                                        <button
                                            onClick={generateInterview}
                                            disabled={isGenerating.interview}
                                            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-all text-xs disabled:opacity-50"
                                        >
                                            {isGenerating.interview ? <Loader2 size={16} className="animate-spin" /> : 'Predict Questions'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* HIDDEN PDF TEMPLATE FOR EXPORT */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <ResumePDFTemplate resumeData={results.resume} />
            </div>
        </div>
    );
}

ResultTabs.propTypes = {
    results: PropTypes.shape({
        resume: PropTypes.string,
        original_ats_score: PropTypes.number,
        optimized_ats_score: PropTypes.number,
        changesSummary: PropTypes.arrayOf(PropTypes.string),
        retrievedAchievements: PropTypes.arrayOf(PropTypes.string),
        bulletComparisons: PropTypes.arrayOf(PropTypes.shape({
            old: PropTypes.string,
            new: PropTypes.string
        })),
        missing_hard_skills: PropTypes.arrayOf(PropTypes.string),
        keyword_optimizations: PropTypes.arrayOf(PropTypes.string),
        recommendations: PropTypes.arrayOf(PropTypes.string),
        keywordMatrix: PropTypes.arrayOf(PropTypes.shape({
            skill: PropTypes.string,
            in_jd: PropTypes.bool,
            in_original: PropTypes.bool,
            in_tailored: PropTypes.bool
        })),
        detected_tone: PropTypes.string,
        research: PropTypes.string,
        coverLetter: PropTypes.string,
        interview: PropTypes.string,
    }).isRequired,
    setResults: PropTypes.func.isRequired,
    resumeText: PropTypes.string.isRequired,
    jobText: PropTypes.string.isRequired,
    apiKey: PropTypes.string.isRequired,
    prompts: PropTypes.object.isRequired,
};
