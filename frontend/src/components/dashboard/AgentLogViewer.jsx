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
            <div className="glass-card p-12 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-cyber-accent/5 blur-3xl rounded-full scale-150 group-hover:bg-cyber-vibrant/5 transition-colors"></div>
                <Brain className="h-16 w-16 text-gray-700 mx-auto mb-4 relative z-10" />
                <p className="text-gray-400 font-medium relative z-10">INITIALIZING AI ADVISOR... <span className="animate-pulse">_</span></p>
                <p className="text-gray-600 text-xs mt-2 relative z-10 uppercase tracking-widest">Select an active scan to bridge connection</p>
            </div>
        );
    }

    return (
        <div className="glass-card border-cyber-accent/10 overflow-hidden relative group">
            {/* Header / Console Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Terminal className="h-5 w-5 text-cyber-neon" />
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-cyber-success rounded-full animate-ping"></div>
                    </div>
                    <div>
                        <span className="text-white font-black text-sm uppercase tracking-widest">Neural Console</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-cyber-neon/60 uppercase">Stream Active</span>
                            <span className="text-[10px] font-mono text-gray-500 uppercase">[{logs.length} Data Points]</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 cursor-pointer hover:text-white transition-colors uppercase tracking-tight">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="w-3 h-3 bg-transparent border-white/20 rounded focus:ring-0 text-cyber-neon"
                        />
                        Sync Scroll
                    </label>
                </div>
            </div>

            {/* Logs Container / Viewport */}
            <div className="max-h-[500px] overflow-y-auto p-6 font-mono text-xs space-y-3 relative">
                {/* Scanning Line Effect (Visual Only) */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-cyber-neon/20 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-scan pointer-events-none"></div>

                {loading && logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-10 w-10 text-cyber-neon animate-spin" />
                        <span className="text-[10px] font-bold text-cyber-neon/60 animate-pulse uppercase tracking-[0.3em]">Downloading Neural Memory...</span>
                    </div>
                )}

                {logs.map((log, index) => (
                    <div
                        key={log.id || index}
                        className="group/item relative pl-4 border-l border-white/5 hover:border-cyber-vibrant/40 transition-all py-1"
                    >
                        {/* Dot Indicator */}
                        <div className="absolute -left-[5px] top-3 h-2 w-2 rounded-full bg-white/10 group-hover/item:bg-cyber-vibrant group-hover/item:shadow-neon-purple transition-all"></div>

                        {/* Log Header */}
                        <div
                            className="flex items-center gap-3 cursor-pointer group-hover/item:translate-x-1 transition-transform"
                            onClick={() => toggleExpand(log.id)}
                        >
                            <span className="text-lg opacity-80">{getAgentIcon(log.agent_name)}</span>
                            <span className={`font-black tracking-tighter ${getAgentColor(log.agent_name)} drop-shadow-sm`}>
                                {log.agent_name?.replace('_agent', '').toUpperCase()}
                            </span>
                            <span className="text-gray-300 font-medium group-hover/item:text-white transition-colors">{log.action}</span>

                            <div className="flex-grow border-t border-dashed border-white/5 mx-2 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>

                            <span className="text-[10px] font-bold text-gray-600 font-mono">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                            </span>

                            {log.reasoning && (
                                <div className={`p-1 rounded bg-white/5 ${expanded[log.id] ? 'rotate-180' : ''} transition-transform`}>
                                    <ChevronDown className="h-3 w-3 text-gray-500" />
                                </div>
                            )}
                        </div>

                        {/* Expanded Details / Intelligence View */}
                        {expanded[log.id] && (
                            <div className="mt-4 ml-8 space-y-3 animate-fade-in">
                                {log.reasoning && (
                                    <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-cyber-vibrant/20 glow-purple">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-1 w-1 rounded-full bg-cyber-vibrant"></div>
                                            <span className="text-[10px] font-black text-cyber-vibrant uppercase tracking-widest">Neural Chain-of-Thought</span>
                                        </div>
                                        <pre className="text-gray-300 text-[11px] leading-relaxed whitespace-pre-wrap font-mono">
                                            {typeof log.reasoning === 'string' ? log.reasoning : JSON.stringify(log.reasoning, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {log.input_data && (
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="text-[9px] font-black text-cyber-accent uppercase tracking-widest block mb-2 opacity-60 italic">{'>>'} Inbound Payload</span>
                                            <pre className="text-gray-400 text-[10px] whitespace-pre-wrap overflow-x-hidden">
                                                {JSON.stringify(log.input_data, null, 2).substring(0, 500)}
                                            </pre>
                                        </div>
                                    )}
                                    {log.output_data && (
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <span className="text-[9px] font-black text-cyber-success uppercase tracking-widest block mb-2 opacity-60 italic">{'>>'} Outbound Result</span>
                                            <pre className="text-gray-400 text-[10px] whitespace-pre-wrap overflow-x-hidden">
                                                {JSON.stringify(log.output_data, null, 2).substring(0, 500)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {logs.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <Terminal className="h-8 w-8 text-gray-700" />
                        </div>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">Listening for Neural Uplink...</p>
                        <p className="text-gray-600 text-[9px] mt-2 italic">Scanning secure frequencies for agent activity</p>
                    </div>
                )}

                <div ref={logsEndRef} />
            </div>

            {/* Footer / Console Status */}
            <div className="px-6 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[9px] font-mono text-gray-600">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-cyber-accent"></div> LINK ESTABLISHED</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-cyber-vibrant"></div> ENCRYPTION: AES-256</span>
                </div>
                <div className="text-[9px] font-mono text-cyber-neon/40 uppercase font-bold tracking-widest">
                    AI AGENT MONITOR V1.2.0-PRO
                </div>
            </div>
        </div>
    );
};

export default AgentLogViewer;
