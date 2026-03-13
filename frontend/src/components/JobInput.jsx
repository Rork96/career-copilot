import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Briefcase, Search, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function JobInput({ jobUrl, setJobUrl, jobText, setJobText }) {
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState('');

    const handleFetchJob = async () => {
        if (!jobUrl.trim()) {
            setError("Please enter a valid URL first.");
            return;
        }

        setIsFetching(true);
        setError('');

        try {
            const res = await axios.post(`${API_BASE}/parse-job`, { url: jobUrl });
            setJobText(res.data.text);
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            if (detail === "BOT_PROTECTED" || err.response?.status === 403 || err.response?.status === 400) {
                setError("⚠️ This site is protected against automated scraping. Please copy the job description from the website and paste it into the field below.");
            } else {
                setError("Failed to fetch job description.");
            }
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="text-primary" size={20} />
                Job Target
            </h2>

            <div className="flex gap-2">
                <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="Paste Job URL (e.g. LinkedIn, Indeed)..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchJob()}
                />
                <button
                    onClick={handleFetchJob}
                    disabled={isFetching || !jobUrl}
                    className="flex items-center gap-2 px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors font-medium text-sm shadow-sm"
                >
                    {isFetching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    Fetch
                </button>
            </div>

            {error && (
                <div className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="font-semibold mb-1">Could not extract automatically.</p>
                    <p>{error}</p>
                </div>
            )}

            <div className="relative group">
                <textarea
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    placeholder="Fetch from URL or manually paste the job description here..."
                    className="w-full h-64 p-4 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-shadow"
                />
                <div className="absolute top-2 right-4 text-xs font-medium text-slate-400 bg-white px-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    Editable
                </div>
            </div>
        </div>
    );
}

JobInput.propTypes = {
    jobUrl: PropTypes.string.isRequired,
    setJobUrl: PropTypes.func.isRequired,
    jobText: PropTypes.string.isRequired,
    setJobText: PropTypes.func.isRequired,
};
