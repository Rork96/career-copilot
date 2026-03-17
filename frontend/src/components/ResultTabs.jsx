import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

import OptimizationInsights from './OptimizationInsights';
import DocumentViewer from './DocumentViewer';

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://cv.wealthifai.xyz/api';

export default function ResultTabs({ results, setResults, resumeText, jobText, apiKey, prompts, isGenerating, setIsGenerating }) {
    const [activeTab, setActiveTab] = useState('resume');
    const [copied, setCopied] = useState(false);
    const [errors, setErrors] = useState({ coverLetter: null, interview: null, research: null });
    const [isEditing, setIsEditing] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [insightTab, setInsightTab] = useState('gaps'); // 'gaps' or 'roadmap'
    const [addedSkills, setAddedSkills] = useState({});
    const [matrixPage, setMatrixPage] = useState(0);

    // 🍏 APPLE MAGIC: Преміальний екран очікування замість сірого тексту
    if (!results.resume && !isGenerating.resume) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6"
            >
                <div className="relative flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100">
                    <Loader2 className="animate-spin text-indigo-600" size={32} strokeWidth={2.5} />
                    <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-pulse" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Setting up your workspace</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">Preparing AI models and optimizing layout...</p>
                </div>
            </motion.div>
        );
    }

    // 🛡️ СЕНЬЙОРНА ЛОГІКА: Дворівнева очистка тексту
    // Рівень 1: Очистка для Word та PDF (Видаляємо тільки технічні блоки ```markdown)
    const sanitizeForDocument = (text) => {
        if (!text) return '';
        return text
            .replace(/^```(markdown)?\n?/gi, '') // Видаляємо з початку
            .replace(/```\n?$/gi, '')            // Видаляємо з кінця
            .trim();
    };

    // Рівень 2: Тотальна очистка для TXT та Copy (Видаляємо ВСЕ форматування: зірочки, решітки)
    const sanitizeForPlainText = (text) => {
        if (!text) return '';
        let clean = sanitizeForDocument(text);
        return clean
            .replace(/^#+\s+/gm, '')             // Видаляємо заголовки (#)
            .replace(/(\*\*|__)(.*?)\1/g, '$2')  // Видаляємо жирний шрифт
            .replace(/(\*|_)(.*?)\1/g, '$2')     // Видаляємо курсив
            .replace(/^\s*\*\s+/gm, '- ')        // Нормалізуємо буліти
            .trim();
    };

    const handleAddToKnowledgeBase = (skill) => {
        const savedFacts = localStorage.getItem('careerFacts');
        const facts = savedFacts ? JSON.parse(savedFacts) : [];

        if (!facts.includes(skill)) {
            facts.push(skill);
            localStorage.setItem('careerFacts', JSON.stringify(facts));
        }

        setAddedSkills(prev => ({ ...prev, [skill]: true }));
    };

    const handleCopy = async () => {
        let textToCopy = '';
        if (activeTab === 'resume') textToCopy = results.resume;
        if (activeTab === 'coverLetter') textToCopy = results.coverLetter;
        if (activeTab === 'interview') textToCopy = results.interview;
        if (activeTab === 'research') textToCopy = results.research;

        try {
            // Використовуємо Рівень 2 (Plain Text)
            await navigator.clipboard.writeText(sanitizeForPlainText(textToCopy));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // 🛡️ СЕНЬЙОРНА ЛОГІКА: Універсальна підготовка тексту для БУДЬ-ЯКОГО таба
    const getActiveContentAndFilename = (extension) => {
        let text = '';
        let baseName = 'Document';

        if (activeTab === 'resume') { text = results.resume; baseName = 'Tailored_Resume'; }
        else if (activeTab === 'coverLetter') { text = results.coverLetter; baseName = 'Cover_Letter'; }
        else if (activeTab === 'interview') { text = results.interview; baseName = 'Interview_Prep'; }
        else if (activeTab === 'research') { text = results.research; baseName = 'Company_Research'; }

        // Тотальна зачистка від Markdown (вбиваємо зірочки, щоб PDF і Word були чистими)
        const cleanText = sanitizeForPlainText(text);

        // Якщо це резюме, намагаємося додати ім'я кандидата у назву файлу
        if (activeTab === 'resume' && results.candidate_name && results.candidate_name !== 'Candidate') {
            baseName = `${results.candidate_name.replace(/\s+/g, '_')}_Resume`;
        }

        return { cleanText, filename: `${baseName}.${extension}` };
    };

    const handleDownload = () => {
        const { cleanText, filename } = getActiveContentAndFilename('txt');
        const blob = new Blob([cleanText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = filename;
        document.body.appendChild(link); link.click();
        document.body.removeChild(link); URL.revokeObjectURL(url);
    };

    const handleDownloadWord = async () => {
        try {
            const { cleanText, filename } = getActiveContentAndFilename('docx');
            const response = await axios.post(`${API_BASE}/export-docx`, {
                markdown_text: cleanText // ВІДПРАВЛЯЄМО АБСОЛЮТНО ЧИСТИЙ ТЕКСТ
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url; link.setAttribute('download', filename);
            document.body.appendChild(link); link.click(); link.remove();
        } catch (error) {
            console.error('DOCX Export failed:', error);
            alert('Failed to export Word document.');
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const { cleanText, filename } = getActiveContentAndFilename('pdf');
            const response = await axios.post(`${API_BASE}/export-pdf`, {
                markdown_text: cleanText, // ВІДПРАВЛЯЄМО АБСОЛЮТНО ЧИСТИЙ ТЕКСТ
                filename: filename.replace('.pdf', '')
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url; link.setAttribute('download', filename);
            document.body.appendChild(link); link.click(); link.remove();
        } catch (error) {
            console.error('PDF Export failed:', error);
            alert('Failed to generate PDF. Please use TXT or Word for now.');
        }
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
        if (e) e.preventDefault();
        setIsGenerating(prev => ({ ...prev, research: true }));
        setErrors(prev => ({ ...prev, research: null }));
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Apple Spring
            className="flex flex-col lg:flex-row gap-8 lg:h-[calc(100vh-120px)] overflow-hidden bg-slate-50/50 p-2 rounded-[2.5rem] print:p-0 print:bg-white pb-24 lg:pb-2 lg:pr-24"
        >
            <OptimizationInsights
                results={results}
                insightTab={insightTab}
                setInsightTab={setInsightTab}
                matrixPage={matrixPage}
                setMatrixPage={setMatrixPage}
                handleAddToKnowledgeBase={handleAddToKnowledgeBase}
                addedSkills={addedSkills}
                isGenerating={isGenerating.resume}
            />

            <DocumentViewer
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                results={results}
                setResults={setResults}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                isExportOpen={isExportOpen}
                setIsExportOpen={setIsExportOpen}
                copied={copied}
                handleCopy={handleCopy}
                handleDownload={handleDownload}
                handleDownloadPDF={handleDownloadPDF}
                handleDownloadWord={handleDownloadWord}
                generateCoverLetter={generateCoverLetter}
                generateInterview={generateInterview}
                generateResearch={generateResearch}
                isGenerating={isGenerating}
                errors={errors}
            />
        </motion.div>
    );
}

ResultTabs.propTypes = {
    results: PropTypes.object.isRequired,
    setResults: PropTypes.func.isRequired,
    resumeText: PropTypes.string.isRequired,
    jobText: PropTypes.string.isRequired,
    apiKey: PropTypes.string.isRequired,
    prompts: PropTypes.object.isRequired,
    isGenerating: PropTypes.object.isRequired,
    setIsGenerating: PropTypes.func.isRequired
};