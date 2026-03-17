import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { motion } from 'framer-motion';

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

    // Замість return null:
    if (!results.resume && !isGenerating.resume) {
        return <div className="p-20 text-center text-slate-400">Preparing your workspace...</div>;
    }

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
        } else if (activeTab === 'research') {
            textToDownload = results.research;
            filename = 'Company_Research.txt';
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

    const handleDownloadWord = async () => {
        try {
            const filename = `${(results.candidate_name || 'Candidate').replace(/\s+/g, '_')}_Resume.docx`;

            const response = await axios.post(`${API_BASE}/export-docx`, {
                markdown_text: results.resume
            }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('DOCX Export failed:', error);
            alert('Failed to export Word document. Please try again.');
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const markdownLines = results.resume.split('\n');
            const firstLine = markdownLines.find(line => line.trim() !== '') || '';
            const nameFromMarkdown = firstLine.replace(/[#*]/g, '').trim();

            const safeName = (results.candidate_name && results.candidate_name !== 'Candidate')
                ? results.candidate_name
                : nameFromMarkdown;

            const filename = `${safeName.replace(/\s+/g, '_')}_Resume`;

            const response = await axios.post(`${API_BASE}/export-pdf`, {
                markdown_text: results.resume,
                filename: filename
            }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
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
            transition={{ duration: 0.6, ease: "easeOut" }}
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
