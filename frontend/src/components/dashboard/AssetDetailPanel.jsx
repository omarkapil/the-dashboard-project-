import React from 'react';
import { Server, Shield, Globe, Terminal, Info, AlertTriangle, Monitor, Radio, Smartphone } from 'lucide-react';

const AssetDetailPanel = ({ node, onClose }) => {
    if (!node) return null;

    const { details, vulnCount } = node;
    const services = details?.services || [];

    // Group services by port
    const sortedServices = [...services].sort((a, b) => a.port - b.port);

    const getIcon = (type) => {
        if (!type) return <Monitor className="w-6 h-6 text-blue-400" />;
        const t = type.toLowerCase();
        if (t.includes('server')) return <Server className="w-6 h-6 text-purple-400" />;
        if (t.includes('router') || t.includes('gateway')) return <Radio className="w-6 h-6 text-yellow-400" />;
        if (t.includes('mobile')) return <Smartphone className="w-6 h-6 text-pink-400" />;
        return <Monitor className="w-6 h-6 text-blue-400" />;
    };

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden h-full flex flex-col shadow-2xl animate-slide-in-right">
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                        {getIcon(details.device_type)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">{details.hostname || details.ip_address}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs text-cyan-400 bg-cyan-900/20 px-2 py-0.5 rounded border border-cyan-800">
                                {details.ip_address}
                            </span>
                            {details.mac_vendor && (
                                <span className="text-xs text-gray-400 flex items-center">
                                    <Info className="w-3 h-3 mr-1" />
                                    {details.mac_vendor}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Content Scrollable Area */}
            <div className="overflow-y-auto flex-1 p-4 space-y-6">

                {/* 1. Identity Section */}
                <section>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Identity
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                            <span className="text-gray-500 block text-xs">OS Family</span>
                            <span className="text-white font-medium">{details?.os_family || 'Unknown'}</span>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                            <span className="text-gray-500 block text-xs">OS Name</span>
                            <span className="text-white font-medium break-words whitespace-normal text-xs" title={details?.os_name}>
                                {details?.os_name || 'N/A'}
                            </span>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                            <span className="text-gray-500 block text-xs">MAC Address</span>
                            <span className="text-white font-mono">{details?.mac_address || 'Unknown'}</span>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                            <span className="text-gray-500 block text-xs">Uptime</span>
                            <span className="text-white font-medium">{details?.uptime || 'N/A'}</span>
                        </div>
                    </div>
                </section>

                {/* AI Intelligence Section */}
                {details.ai_insight && (
                    <section className="animate-fade-in">
                        <h3 className="text-[10px] font-black text-cyber-neon uppercase mb-4 flex items-center gap-2 tracking-[0.2em]">
                            <Shield className="w-3 h-3" /> Intelligence Analysis
                        </h3>
                        <div className="bg-cyber-accent/5 border border-cyber-accent/20 rounded-xl p-5 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                                <Shield className="w-12 h-12 text-cyber-accent" />
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div>
                                    <span className="text-[9px] font-black text-cyber-accent/60 uppercase block mb-1">Device Role</span>
                                    <p className="text-gray-200 text-xs font-bold leading-relaxed">
                                        {details.ai_insight.role_analysis}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                        <span className="text-[9px] font-black text-cyber-danger uppercase block mb-1">Exposure Synthesis</span>
                                        <p className="text-gray-400 text-[11px] leading-relaxed italic">
                                            "{details.ai_insight.risk_synthesis}"
                                        </p>
                                    </div>
                                    <div className="bg-black/40 p-4 rounded-lg border-l-2 border-l-cyber-vibrant">
                                        <span className="text-[9px] font-black text-cyber-vibrant uppercase block mb-2">Lateral Movement Risk</span>
                                        <p className="text-gray-300 text-[11px] leading-relaxed font-medium">
                                            {details.ai_insight.lateral_movement_risk}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-cyber-success shadow-neon-sm"></div>
                                        <span className="text-[9px] font-black text-cyber-success uppercase tracking-widest">Recommended Action</span>
                                    </div>
                                    <p className="text-white text-xs font-medium bg-cyber-success/10 p-3 rounded-lg border border-cyber-success/20">
                                        {details.ai_insight.security_tip}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. Services Section */}
                <section>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <Terminal className="w-4 h-4" /> Open Ports
                    </h3>
                    {sortedServices.length > 0 ? (
                        <div className="border border-gray-700 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800 text-gray-400 font-medium">
                                    <tr>
                                        <th className="p-3">Port</th>
                                        <th className="p-3">Service</th>
                                        <th className="p-3">Version</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700 bg-gray-900/50">
                                    {sortedServices.map((svc, idx) => (
                                        <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="p-3 font-mono text-cyan-400">{svc.port}/{svc.protocol}</td>
                                            <td className="p-3 text-white">{svc.service_name}</td>
                                            <td className="p-3 text-gray-400 text-xs">{svc.product} {svc.version}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-gray-800/30 rounded border border-gray-700 border-dashed text-gray-500 text-sm">
                            No open ports detected.
                        </div>
                    )}
                </section>

                {/* 3. Security Section */}
                <section>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Vulnerabilities
                    </h3>
                    {vulnCount > 0 ? (
                        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="text-red-500 w-5 h-5" />
                                <span className="text-red-400 font-bold">{vulnCount} Issues Found</span>
                            </div>
                            <p className="text-xs text-red-300/70">
                                This asset has flagged vulnerabilities. Check the main report for full CVE details and remediation steps.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4 flex items-center gap-3">
                            <Shield className="text-green-500 w-5 h-5" />
                            <span className="text-green-400 font-bold">System Secure</span>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};

export default AssetDetailPanel;
