import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UnifiedInbox = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/siem/alerts');
            setAlerts(res.data || []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch SIEM alerts:", err);
            setError("Failed to load alerts from Elasticsearch.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-400">Loading SIEM Alerts...</div>;
    if (error) return <div className="p-4 text-center text-red-400 bg-red-900/20 rounded">{error}</div>;

    return (
        <div className="bg-[#1e1e2d] rounded-xl border border-gray-800 p-6 flex flex-col h-full shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Unified SIEM Inbox
                </h2>
                <button
                    onClick={fetchAlerts}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {alerts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-10">
                    <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No active alerts. All quiet.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {alerts.map((alert, idx) => {
                        const level = alert.rule?.level || 0;
                        const isHigh = level >= 10;
                        const isMed = level >= 5 && level < 10;

                        const badgeColor = isHigh
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : isMed
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

                        return (
                            <div key={idx} className="bg-[#151521] border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors group cursor-pointer relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full ${isHigh ? 'bg-red-500' : isMed ? 'bg-orange-500' : 'bg-blue-500'} bg-opacity-80`}></div>

                                <div className="flex justify-between items-start mb-2 pl-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${badgeColor}`}>
                                            Level {level}
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                            {new Date(alert['@timestamp']).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="pl-3">
                                    <p className="text-gray-200 text-sm font-medium mb-1 line-clamp-2">
                                        {alert.rule?.description || "Unknown Alert"}
                                    </p>

                                    <div className="flex flex-wrap gap-2 text-xs mt-2">
                                        {alert.agent?.name && (
                                            <span className="flex items-center gap-1 text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                {alert.agent.name}
                                            </span>
                                        )}
                                        {alert.data?.srcip && (
                                            <span className="flex items-center gap-1 text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                                {alert.data.srcip}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UnifiedInbox;
