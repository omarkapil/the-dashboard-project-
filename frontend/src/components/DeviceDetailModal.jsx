import React, { useState } from 'react';

const DeviceDetailModal = ({ device, onClose }) => {
    if (!device) return null;

    const getSeverityColor = (severity) => {
        if (severity >= 9.0) return '#bf00ff'; // Critical - Magenta
        if (severity >= 7.0) return '#ff0055'; // High - Red
        if (severity >= 4.0) return '#ffcc00'; // Medium - Yellow
        return '#00f2ff'; // Low - Cyan
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}>
            <div className="bg-[#1a1a2e] border border-[#bf00ff]/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-gradient-to-r from-[#bf00ff]/20 to-[#00f2ff]/20 border-b border-[#bf00ff]/30 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{device.name}</h2>
                            <div className="flex gap-3 text-sm">
                                <span className="px-3 py-1 bg-[#bf00ff]/20 border border-[#bf00ff]/50 rounded-full text-[#bf00ff]">
                                    {device.type}
                                </span>
                                <span className="px-3 py-1 bg-[#00f2ff]/20 border border-[#00f2ff]/50 rounded-full text-[#00f2ff]">
                                    {device.ip_address}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="text-gray-400 hover:text-white text-3xl leading-none transition-colors">
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Overview Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[#0a0a0f] border border-gray-800 rounded-lg p-4">
                            <p className="text-gray-500 text-xs uppercase mb-1">Hostname</p>
                            <p className="text-white font-mono">{device.hostname || 'N/A'}</p>
                        </div>
                        <div className="bg-[#0a0a0f] border border-gray-800 rounded-lg p-4">
                            <p className="text-gray-500 text-xs uppercase mb-1">MAC Address</p>
                            <p className="text-white font-mono text-sm">{device.mac_address || 'N/A'}</p>
                        </div>
                        <div className="bg-[#0a0a0f] border border-gray-800 rounded-lg p-4">
                            <p className="text-gray-500 text-xs uppercase mb-1">OS</p>
                            <p className="text-white font-semibold">{device.os_type || 'Unknown'}</p>
                            <p className="text-gray-400 text-xs">{device.os_version}</p>
                        </div>
                        <div className="bg-[#0a0a0f] border border-gray-800 rounded-lg p-4">
                            <p className="text-gray-500 text-xs uppercase mb-1">Last Seen</p>
                            <p className="text-white text-sm">
                                {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}
                            </p>
                        </div>
                    </div>

                    {/* Risk Summary */}
                    {device.risk_summary && (
                        <div className="bg-gradient-to-br from-[#bf00ff]/10 to-[#ff0055]/10 border border-[#bf00ff]/30 rounded-lg p-4 mb-6">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#bf00ff] rounded-full"></span>
                                Risk Summary
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <p className="text-gray-400 text-xs">Total Risks</p>
                                    <p className="text-white text-2xl font-bold">{device.risk_summary.total}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Open</p>
                                    <p className="text-[#ff0055] text-2xl font-bold">{device.risk_summary.open}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Critical</p>
                                    <p className="text-[#bf00ff] text-2xl font-bold">{device.risk_summary.critical}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Risk Score</p>
                                    <p className="text-white text-2xl font-bold">{device.risk_summary.total_risk_score?.toFixed(0) || 0}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Open Ports */}
                    {device.open_ports && device.open_ports.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#00f2ff] rounded-full"></span>
                                Open Ports ({device.open_ports.length})
                            </h3>
                            <div className="bg-[#0a0a0f] border border-gray-800 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-900/50 border-b border-gray-800">
                                        <tr>
                                            <th className="text-left p-3 text-gray-400 font-semibold">Port</th>
                                            <th className="text-left p-3 text-gray-400 font-semibold">Service</th>
                                            <th className="text-left p-3 text-gray-400 font-semibold">Version</th>
                                            <th className="text-left p-3 text-gray-400 font-semibold">State</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {device.open_ports.map((port, idx) => (
                                            <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                                                <td className="p-3 text-[#00f2ff] font-mono">{port.port}/{port.protocol}</td>
                                                <td className="p-3 text-white">{port.service}</td>
                                                <td className="p-3 text-gray-400 font-mono text-xs">
                                                    {port.product} {port.version}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${port.state === 'open' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'
                                                        }`}>
                                                        {port.state}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Vulnerabilities */}
                    {device.vulnerabilities && device.vulnerabilities.length > 0 && (
                        <div>
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#ff0055] rounded-full"></span>
                                Vulnerabilities ({device.vulnerabilities.length})
                            </h3>
                            <div className="space-y-2">
                                {device.vulnerabilities.map((vuln, idx) => (
                                    <div key={idx}
                                        className="bg-[#0a0a0f] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className=" font-mono text-sm px-2 py-1 rounded"
                                                    style={{
                                                        backgroundColor: `${getSeverityColor(vuln.severity)}20`,
                                                        color: getSeverityColor(vuln.severity),
                                                        border: `1px solid ${getSeverityColor(vuln.severity)}50`
                                                    }}>
                                                    {vuln.cve}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs ${vuln.status === 'Closed' ? 'bg-green-900/30 text-green-400' :
                                                        vuln.status === 'In Progress' ? 'bg-yellow-900/30 text-yellow-400' :
                                                            'bg-red-900/30 text-red-400'
                                                    }`}>
                                                    {vuln.status}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Severity</p>
                                                <p className="text-white font-bold" style={{ color: getSeverityColor(vuln.severity) }}>
                                                    {vuln.severity.toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm">{vuln.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Data Message */}
                    {(!device.open_ports || device.open_ports.length === 0) &&
                        (!device.vulnerabilities || device.vulnerabilities.length === 0) && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No detailed scan data available for this device</p>
                                <p className="text-gray-600 text-sm mt-2">Run a network scan to populate device information</p>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default DeviceDetailModal;
