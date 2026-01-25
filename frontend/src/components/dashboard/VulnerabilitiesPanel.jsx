import React, { useState, useEffect } from 'react';
import { Bug, AlertTriangle, Shield, CheckCircle, XCircle, ExternalLink, Code, Loader2 } from 'lucide-react';
import { vulnerabilityService } from '../../services/api';

/**
 * VulnerabilitiesPanel Component
 * Display and manage discovered vulnerabilities
 */
const VulnerabilitiesPanel = ({ scanId = null, refresh = 0 }) => {
    const [vulnerabilities, setVulnerabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVuln, setSelectedVuln] = useState(null);
    const [showPoc, setShowPoc] = useState(false);
    const [poc, setPoc] = useState(null);
    const [filter, setFilter] = useState({ severity: '', status: '' });

    useEffect(() => {
        fetchVulnerabilities();
    }, [scanId, refresh, filter]);

    const fetchVulnerabilities = async () => {
        try {
            const params = { ...filter };
            if (scanId) params.scan_id = scanId;
            const response = await vulnerabilityService.list(params);
            setVulnerabilities(response.data || []);
        } catch (error) {
            console.error('Failed to fetch vulnerabilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkFalsePositive = async (id) => {
        try {
            await vulnerabilityService.markFalsePositive(id);
            fetchVulnerabilities();
        } catch (error) {
            console.error('Failed to mark as false positive:', error);
        }
    };

    const handleMarkFixed = async (id) => {
        try {
            await vulnerabilityService.markFixed(id);
            fetchVulnerabilities();
        } catch (error) {
            console.error('Failed to mark as fixed:', error);
        }
    };

    const handleViewPoc = async (vuln) => {
        setSelectedVuln(vuln);
        setShowPoc(true);
        try {
            const response = await vulnerabilityService.getPoc(vuln.id);
            setPoc(response.data);
        } catch (error) {
            console.error('Failed to get PoC:', error);
        }
    };

    const handleRevalidate = async (id) => {
        try {
            await vulnerabilityService.revalidate(id);
            fetchVulnerabilities();
        } catch (error) {
            console.error('Failed to revalidate:', error);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <AlertTriangle className="h-4 w-4 text-red-400" />;
            case 'fixed': return <CheckCircle className="h-4 w-4 text-green-400" />;
            case 'false_positive': return <XCircle className="h-4 w-4 text-gray-400" />;
            default: return <Bug className="h-4 w-4 text-yellow-400" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-cyber-light p-8 rounded-xl border border-gray-700 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Filters */}
            <div className="flex gap-4 items-center">
                <select
                    value={filter.severity}
                    onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="fixed">Fixed</option>
                    <option value="false_positive">False Positive</option>
                </select>
                <span className="text-gray-400 text-sm ml-auto">
                    {vulnerabilities.length} vulnerabilities
                </span>
            </div>

            {/* Vulnerabilities List */}
            <div className="space-y-3">
                {vulnerabilities.map((vuln) => (
                    <div
                        key={vuln.id}
                        className="bg-cyber-light p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
                    >
                        <div className="flex items-start gap-4">
                            {/* Severity Badge */}
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(vuln.severity)}`}>
                                {vuln.severity?.toUpperCase()}
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {getStatusIcon(vuln.status)}
                                    <h4 className="text-white font-medium truncate">
                                        {vuln.type || 'Unknown Vulnerability'}
                                    </h4>
                                </div>
                                <p className="text-gray-400 text-sm truncate mb-2">
                                    {vuln.url}
                                </p>
                                {vuln.description && (
                                    <p className="text-gray-500 text-sm line-clamp-2">
                                        {vuln.description}
                                    </p>
                                )}
                                {vuln.confidence_score && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-gray-500 text-xs">Confidence:</span>
                                        <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                                style={{ width: `${vuln.confidence_score * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-gray-400 text-xs">
                                            {(vuln.confidence_score * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions & Workflow */}
                            <div className="flex flex-col gap-2 border-l border-gray-700 pl-4 ml-4 min-w-[150px]">
                                <select
                                    value={vuln.status}
                                    onChange={(e) => {
                                        vulnerabilityService.updateWorkflow(vuln.id, { status: e.target.value });
                                        fetchVulnerabilities();
                                    }}
                                    className={`text-xs px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white w-full`}
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="fixed">Fixed</option>
                                    <option value="false_positive">False Positive</option>
                                </select>

                                <input
                                    type="text"
                                    placeholder="Ticket ID"
                                    defaultValue={vuln.ticket_id}
                                    onBlur={(e) => {
                                        if (e.target.value !== vuln.ticket_id) {
                                            vulnerabilityService.updateWorkflow(vuln.id, { ticket_id: e.target.value });
                                        }
                                    }}
                                    className="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white w-full"
                                />

                                <button
                                    onClick={() => handleViewPoc(vuln)}
                                    className="flex items-center gap-2 justify-center p-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded text-cyan-400"
                                >
                                    <Code className="h-3 w-3" />
                                    View PoC
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {vulnerabilities.length === 0 && (
                <div className="bg-cyber-light p-12 rounded-xl border border-gray-700 text-center">
                    <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-400">No vulnerabilities found matching your criteria.</p>
                </div>
            )}

            {/* PoC Modal */}
            {showPoc && selectedVuln && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">
                                Proof of Concept: {selectedVuln.type}
                            </h3>
                            <button
                                onClick={() => { setShowPoc(false); setPoc(null); }}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {poc ? (
                                <>
                                    <div className="mb-4">
                                        <h4 className="text-cyan-400 mb-2">Script</h4>
                                        <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
                                            {poc.proof_of_concept}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="text-green-400 mb-2">Remediation</h4>
                                        <p className="text-gray-300 bg-gray-800 p-4 rounded-lg">
                                            {poc.remediation}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VulnerabilitiesPanel;
