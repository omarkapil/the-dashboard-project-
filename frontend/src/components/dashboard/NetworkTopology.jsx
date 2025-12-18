import React, { useState, useEffect } from 'react';
import { Server, Smartphone, Monitor, Globe, Shield, AlertTriangle, CheckCircle, Info, Network, Loader } from 'lucide-react';
import { scanService } from '../../services/api';

const NetworkTopology = ({ refresh }) => {
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [scanData, setScanData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestScan();
    }, [refresh]);

    const fetchLatestScan = async () => {
        try {
            setLoading(true);
            const { data: scans } = await scanService.getScans();
            if (scans.length > 0) {
                // Get most recent scan
                const latest = scans.sort((a, b) => b.id - a.id)[0];
                // Fetch details for assets
                const { data: details } = await scanService.getScanDetails(latest.id);
                setScanData(details);
            }
        } catch (error) {
            console.error("Failed to load topology data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-cyber-accent animate-pulse">
                <Loader className="h-12 w-12 animate-spin" />
            </div>
        );
    }

    // If no scan data or assets, show placeholder
    if (!scanData || !scanData.assets || scanData.assets.length === 0) {
        return (
            <div className="bg-cyber-light p-12 rounded-xl border border-gray-700 text-center animate-fade-in">
                <Globe className="h-16 w-16 text-gray-600 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-white mb-2">No Network Assets Found</h3>
                <p className="text-gray-400">Run a scan to map your network topology.</p>
            </div>
        );
    }

    const getDeviceIcon = (type, os) => {
        const lowerType = (type || '').toLowerCase();
        const lowerOs = (os || '').toLowerCase();

        if (lowerType.includes('server') || lowerOs.includes('server') || lowerOs.includes('linux')) return <Server className="h-8 w-8 text-cyber-accent" />;
        if (lowerType.includes('mobile') || lowerOs.includes('android') || lowerOs.includes('ios')) return <Smartphone className="h-8 w-8 text-pink-500" />;
        if (lowerType.includes('router') || lowerType.includes('gateway')) return <Network className="h-8 w-8 text-yellow-500" />;
        return <Monitor className="h-8 w-8 text-blue-400" />;
    };

    const getAssetVulnerabilities = (ip) => {
        return scanData.vulnerabilities.filter(v => v.host === ip);
    };

    const getMaxSeverity = (vulns) => {
        if (vulns.some(v => v.severity === 'CRITICAL')) return 'CRITICAL';
        if (vulns.some(v => v.severity === 'HIGH')) return 'HIGH';
        if (vulns.some(v => v.severity === 'MEDIUM')) return 'MEDIUM';
        if (vulns.some(v => v.severity === 'LOW')) return 'LOW';
        return 'SAFE';
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-600 bg-red-900/30 border-red-800';
            case 'HIGH': return 'text-red-400 bg-red-900/20 border-red-700';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
            case 'LOW': return 'text-blue-400 bg-blue-900/20 border-blue-700';
            default: return 'text-green-400 bg-green-900/20 border-green-700';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Asset Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {scanData.assets.map((asset) => {
                    const vulns = getAssetVulnerabilities(asset.ip_address);
                    const severity = getMaxSeverity(vulns);

                    return (
                        <div
                            key={asset.id}
                            onClick={() => setSelectedAsset({ ...asset, vulns })}
                            className={`p-6 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.15)] flex items-start gap-4 ${selectedAsset?.id === asset.id ? 'bg-gray-800 border-cyber-accent' : 'bg-cyber-light border-gray-700 hover:border-gray-500'}`}
                        >
                            <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                                {getDeviceIcon(asset.device_type, asset.os_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-white font-bold truncate">{asset.hostname || 'Unknown Device'}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getSeverityColor(severity)}`}>
                                        {severity}
                                    </span>
                                </div>
                                <p className="text-gray-400 font-mono text-xs mt-1">{asset.ip_address}</p>
                                <p className="text-gray-500 text-xs mt-1 truncate">{asset.os_name || 'OS Unknown'}</p>

                                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        <span>{vulns.length} Vulns</span>
                                    </div>
                                    {asset.mac_address && (
                                        <div className="flex items-center gap-1 font-mono">
                                            <Network className="h-3 w-3" />
                                            <span>{asset.mac_address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Panel */}
            <div className="bg-cyber-light rounded-xl border border-gray-700 p-6 h-fit sticky top-6">
                {selectedAsset ? (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-700 pb-6">
                            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                                {getDeviceIcon(selectedAsset.device_type, selectedAsset.os_name)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedAsset.hostname || 'Unknown Device'}</h3>
                                <p className="text-cyber-accent font-mono">{selectedAsset.ip_address}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm uppercase text-gray-500 font-bold mb-2">Device Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                        <span className="text-gray-500 block text-xs">Operating System</span>
                                        <span className="text-white">{selectedAsset.os_name || 'N/A'}</span>
                                    </div>
                                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                        <span className="text-gray-500 block text-xs">MAC Address</span>
                                        <span className="text-white font-mono">{selectedAsset.mac_address || 'N/A'}</span>
                                    </div>
                                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                        <span className="text-gray-500 block text-xs">Device Type</span>
                                        <span className="text-white capitalize">{selectedAsset.device_type || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm uppercase text-gray-500 font-bold mb-2">Vulnerabilities</h4>
                                {selectedAsset.vulns.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedAsset.vulns.map((vuln, idx) => (
                                            <div key={idx} className="bg-gray-800/30 p-3 rounded-lg border border-gray-700 hover:border-red-500/50 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-white font-medium text-sm">{vuln.service || 'Unknown Service'}</span>
                                                    <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getSeverityColor(vuln.severity)}`}>
                                                        {vuln.severity}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-xs">{vuln.description || 'No description available.'}</p>
                                                <div className="mt-2 flex items-center gap-1 text-xs text-cyber-accent">
                                                    <Info className="h-3 w-3" />
                                                    <span>{vuln.port ? `Port ${vuln.port}/${vuln.protocol}` : 'Unknown Port'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-green-900/10 border border-green-900/30 rounded-lg flex items-center gap-3 text-green-400">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="text-sm">No vulnerabilities detected.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Monitor className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Select a device from the grid to view detailed analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkTopology;
