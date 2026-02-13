import React, { useEffect, useState } from 'react';
import { openvasService } from '../../services/api';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

const VulnerabilitiesList = ({ taskId }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedFull, setExpandedFull] = useState(null); // ID of expanded item

    useEffect(() => {
        if (!taskId) return;

        const fetchResults = async () => {
            setLoading(true);
            try {
                const response = await openvasService.getScanResults(taskId);
                setResults(response.data);
            } catch (err) {
                console.error("Failed to fetch results", err);
                setError("Could not load results. Scan might be in progress.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
        // Optional: Poll if status is running
    }, [taskId]);

    if (!taskId) {
        return <div className="text-gray-500 italic text-center p-10">Select a scan to view detailed results.</div>;
    }

    if (loading) return <div className="text-cyber-accent text-center p-10 animate-pulse">Loading Scan Results...</div>;
    if (error) return <div className="text-red-400 text-center p-10">{error}</div>;
    if (results.length === 0) return <div className="text-green-400 text-center p-10 flex flex-col items-center gap-2"><ShieldCheck className="h-10 w-10" /> No vulnerabilities found!</div>;

    const toggleExpand = (index) => {
        if (expandedFull === index) setExpandedFull(null);
        else setExpandedFull(index);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {results.map((vuln, index) => (
                <div key={index} className="glass-card border-l-4 border-l-transparent hover:border-l-cyber-accent transition-all overflow-hidden">
                    <div
                        className="p-4 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleExpand(index)}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${vuln.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                                    vuln.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                                        vuln.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                                            'bg-blue-500/20 text-blue-500'
                                }`}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">{vuln.name}</h4>
                                <p className="text-gray-400 text-xs">{vuln.host} • {vuln.severity}</p>
                            </div>
                        </div>
                        {expandedFull === index ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                    </div>

                    {expandedFull === index && (
                        <div className="px-4 pb-4 border-t border-white/5 bg-black/20">
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h5 className="text-cyber-neon text-xs uppercase font-bold mb-1">Description</h5>
                                    <p className="text-gray-300 text-sm leading-relaxed">{vuln.description}</p>
                                    {vuln.simplified_description && (
                                        <div className="mt-2 bg-blue-500/10 p-2 rounded border border-blue-500/30">
                                            <p className="text-blue-200 text-xs italic">
                                                <span className="font-bold">AI Summary:</span> {vuln.simplified_description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-red-500/5 p-3 rounded border border-red-500/10">
                                    <h5 className="text-red-400 text-xs uppercase font-bold mb-1">Remediation</h5>
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{vuln.remediation || "No specific remediation provided."}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default VulnerabilitiesList;
