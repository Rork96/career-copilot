import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { FileText, CloudUpload, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function ResumeInput({ resumeText, setResumeText }) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Звертаємось до твого пайтон-бекенду для парсингу
            const res = await axios.post(`${API_BASE}/parse-resume`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResumeText(res.data.text);
        } catch (err) {
            console.error(err);
            setError("Failed to parse the file. Please paste text manually.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-primary" size={20} />
                    Master Resume
                </h2>

                <div>
                    <input
                        type="file"
                        accept=".pdf,.txt,.docx"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-colors border border-slate-200"
                    >
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={18} />}
                        Upload Resume (PDF/DOCX)
                    </button>
                </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Upload a file or paste your full resume here..."
                className="w-full h-64 p-4 text-sm border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-all"
            />
        </div>
    );
}

ResumeInput.propTypes = {
    resumeText: PropTypes.string.isRequired,
    setResumeText: PropTypes.func.isRequired,
};