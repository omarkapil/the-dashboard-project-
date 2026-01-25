import React, { useEffect, useState } from 'react';
import { scanService } from '../../services/api';
import { FileText, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';

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

    const [expandedScanId, setExpandedScanId] = useState(null);

    const togglePreview = (scanId) => {
        if (expandedScanId === scanId) {
            setExpandedScanId(null);
        } else {
            setExpandedScanId(scanId);
        }
    };

    const handleDownloadReport = async (scanId) => {
        try {
            // Updated to point to correct endpoint if needed, assuming /api/v1/reports/{id}/pdf exists
            window.open(`http://localhost:8000/api/v1/reports/${scanId}/pdf`, '_blank');
        } catch (error) {
            console.error("Failed to download report", error);
            alert("Failed to download report. Please check backend logs.");
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
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {scans.map((scan) => (
                            <React.Fragment key={scan.id}>
                                <tr className={`hover:bg-gray-700/50 transition-colors ${expandedScanId === scan.id ? 'bg-gray-700/30' : ''}`}>
                                    <td className="px-6 py-4 font-mono text-gray-300">
                                        <button
                                            onClick={() => togglePreview(scan.id)}
                                            className="hover:text-cyan-400 hover:underline"
                                        >
                                            #{scan.id.slice(0, 8)}...
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">{scan.target_display || scan.target_url || scan.target || "Unknown"}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        {getStatusIcon(scan.status)}
                                        <span className={scan.status === 'COMPLETED' ? 'text-green-400' : ''}>{scan.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${scan.risk_score > 80 ? 'bg-red-900 text-red-200' :
                                            scan.risk_score > 50 ? 'bg-yellow-900 text-yellow-200' : 'bg-green-900 text-green-200'
                                            }`}>
                                            {scan.risk_score ? scan.risk_score.toFixed(1) : '0.0'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{scan.started_at ? new Date(scan.started_at).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button
                                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-xs uppercase font-bold"
                                            onClick={() => togglePreview(scan.id)}
                                        >
                                            <Shield className="h-4 w-4" /> Preview
                                        </button>
                                        <button
                                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-xs uppercase font-bold"
                                            onClick={() => handleDownloadReport(scan.id)}
                                        >
                                            <FileText className="h-4 w-4" /> Report
                                        </button>
                                    </td>
                                </tr>
                                {expandedScanId === scan.id && (
                                    <tr>
                                        <td colSpan="6" className="bg-gray-900/50 p-6 border-b border-gray-700 animate-fade-in">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="text-white font-bold mb-2">Scan Summary</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between border-b border-gray-700 pb-1">
                                                            <span className="text-gray-500">Duration</span>
                                                            <span className="text-gray-300">
                                                                {scan.completed_at && scan.started_at ?
                                                                    `${Math.round((new Date(scan.completed_at) - new Date(scan.started_at)) / 1000)}s`
                                                                    : 'In Progress'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-gray-700 pb-1">
                                                            <span className="text-gray-500">Scan Type</span>
                                                            <span className="text-gray-300 capitalize">{scan.scan_type}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-white font-bold mb-2">Quick Stats</h4>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="bg-gray-800 p-2 rounded text-center">
                                                            <span className="block text-red-400 font-bold text-lg">
                                                                {/* Assuming backend sends summary counts, if not we show 0 */}
                                                                {scan.vulnerabilities_count || 0}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 uppercase">Vulns</span>
                                                        </div>
                                                        <div className="bg-gray-800 p-2 rounded text-center">
                                                            <span className="block text-blue-400 font-bold text-lg">
                                                                {scan.assets_count || 0}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 uppercase">Assets</span>
                                                        </div>
                                                        <div className="bg-gray-800 p-2 rounded text-center">
                                                            <span className="block text-green-400 font-bold text-lg">
                                                                {scan.status === 'COMPLETED' ? '100%' : '0%'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 uppercase">Progress</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
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
