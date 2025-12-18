import React, { useEffect, useState } from 'react';
import { scanService } from '../../services/api';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ScanHistory = ({ refresh }) => {
    const [scans, setScans] = useState([]);

    useEffect(() => {
        loadScans();
    }, [refresh]);

    const loadScans = async () => {
        try {
            const res = await scanService.getScans();
            // Sort by ID desc (newest first)
            setScans(res.data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error("Failed to load scans", error);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="text-green-500 h-5 w-5" />;
            case 'FAILED': return <AlertTriangle className="text-red-500 h-5 w-5" />;
            case 'RUNNING': return <Clock className="text-blue-500 h-5 w-5 animate-pulse" />;
            default: return <Clock className="text-gray-500 h-5 w-5" />;
        }
    };

    return (
        <div className="bg-cyber-light rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
                <h3 className="text-gray-400 text-sm uppercase tracking-wider">Recent Scans</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-800 text-gray-200 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Target</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Risk Score</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Report</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {scans.map((scan) => (
                            <tr key={scan.id} className="hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-300">#{scan.id}</td>
                                <td className="px-6 py-4 font-medium text-white">{scan.target}</td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    {getStatusIcon(scan.status)}
                                    <span className={scan.status === 'COMPLETED' ? 'text-green-400' : ''}>{scan.status}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${scan.risk_score > 80 ? 'bg-red-900 text-red-200' :
                                            scan.risk_score > 50 ? 'bg-yellow-900 text-yellow-200' : 'bg-green-900 text-green-200'
                                        }`}>
                                        {scan.risk_score.toFixed(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(scan.started_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <button
                                        className="text-cyber-accent hover:text-white flex items-center gap-1 text-xs uppercase font-bold"
                                        onClick={() => alert(`Report generation for #${scan.id} coming soon!`)}
                                    >
                                        <FileText className="h-4 w-4" /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {scans.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No scans found. Start a scan to see results.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScanHistory;
