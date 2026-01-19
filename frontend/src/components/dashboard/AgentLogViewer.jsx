import React, { useState, useEffect, useRef } from 'react';
import { Brain, ChevronDown, ChevronUp, Terminal, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { pentesterService } from '../../services/api';

/**
 * AgentLogViewer Component
 * Real-time console-like view of AI agent actions and reasoning
 */
const AgentLogViewer = ({ scanId, autoRefresh = true }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [autoScroll, setAutoScroll] = useState(true);
    const logsEndRef = useRef(null);

    useEffect(() => {
        if (!scanId) return;

        const fetchLogs = async () => {
            try {
                const response = await pentesterService.getAgentLogs(scanId);
                setLogs(response.data || []);
            } catch (error) {
                console.error('Failed to fetch agent logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();

        // Auto-refresh every 2 seconds if enabled
        let interval;
        if (autoRefresh) {
            interval = setInterval(fetchLogs, 2000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [scanId, autoRefresh]);

    useEffect(() => {
        if (autoScroll && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, autoScroll]);

    const toggleExpand = (logId) => {
        setExpanded(prev => ({ ...prev, [logId]: !prev[logId] }));
    };

    const getAgentColor = (agentName) => {
        const colors = {
            'recon_agent': 'text-blue-400',
            'attack_agent': 'text-red-400',
            'validation_agent': 'text-yellow-400',
            'reporting_agent': 'text-green-400',
        };
        return colors[agentName] || 'text-gray-400';
    };

    const getAgentIcon = (agentName) => {
        switch (agentName) {
            case 'recon_agent': return '🔍';
            case 'attack_agent': return '⚔️';
            case 'validation_agent': return '✅';
            case 'reporting_agent': return '📊';
            default: return '🤖';
        }
    };

    if (!scanId) {
        return (
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 text-center">
                <Brain className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Select a scan to view agent logs</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-cyan-400" />
                    <span className="text-white font-medium">AI Agent Console</span>
                    <span className="text-gray-500 text-sm">({logs.length} events)</span>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        className="rounded"
                    />
                    Auto-scroll
                </label>
            </div>

            {/* Logs Container */}
            <div className="max-h-96 overflow-y-auto p-4 font-mono text-sm space-y-2">
                {loading && logs.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
                    </div>
                )}

                {logs.map((log, index) => (
                    <div
                        key={log.id || index}
                        className="border-l-2 border-gray-700 pl-3 py-1 hover:bg-gray-800/50 transition-colors"
                    >
                        {/* Log Header */}
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => toggleExpand(log.id)}
                        >
                            <span>{getAgentIcon(log.agent_name)}</span>
                            <span className={`font-semibold ${getAgentColor(log.agent_name)}`}>
                                [{log.agent_name?.replace('_agent', '').toUpperCase()}]
                            </span>
                            <span className="text-gray-300">{log.action}</span>
                            <span className="text-gray-600 text-xs ml-auto">
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            {log.reasoning && (
                                expanded[log.id] ? (
                                    <ChevronUp className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                )
                            )}
                        </div>

                        {/* Expanded Details */}
                        {expanded[log.id] && (
                            <div className="mt-2 ml-6 space-y-2 text-xs">
                                {log.reasoning && (
                                    <div className="bg-gray-800 p-3 rounded">
                                        <span className="text-purple-400">💭 Reasoning:</span>
                                        <pre className="text-gray-300 mt-1 whitespace-pre-wrap">
                                            {JSON.stringify(log.reasoning, null, 2)}
                                        </pre>
                                    </div>
                                )}
                                {log.input_data && (
                                    <div className="bg-gray-800 p-3 rounded">
                                        <span className="text-blue-400">📥 Input:</span>
                                        <pre className="text-gray-300 mt-1 whitespace-pre-wrap">
                                            {JSON.stringify(log.input_data, null, 2)}
                                        </pre>
                                    </div>
                                )}
                                {log.output_data && (
                                    <div className="bg-gray-800 p-3 rounded">
                                        <span className="text-green-400">📤 Output:</span>
                                        <pre className="text-gray-300 mt-1 whitespace-pre-wrap">
                                            {JSON.stringify(log.output_data, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {logs.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                        No agent activity yet. Waiting for scan to start...
                    </div>
                )}

                <div ref={logsEndRef} />
            </div>
        </div>
    );
};

export default AgentLogViewer;
