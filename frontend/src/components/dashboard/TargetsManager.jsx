import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, ExternalLink, Shield, Globe, Search, CheckCircle, Loader2 } from 'lucide-react';
import { targetService, pentesterService } from '../../services/api';

const TargetsManager = ({ onScanStarted }) => {
    const [activeTab, setActiveTab] = useState('list'); // list, add, discover
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTarget, setNewTarget] = useState({ name: '', base_url: '', auth_method: 'none', asset_value: 'MEDIUM' });
    const [scanning, setScanning] = useState(null);

    // Discovery
    const [discoveryDomain, setDiscoveryDomain] = useState('');
    const [discoveryResult, setDiscoveryResult] = useState(null);
    const [discovering, setDiscovering] = useState(false);

    useEffect(() => {
        fetchTargets();
    }, []);

    const fetchTargets = async () => {
        try {
            const response = await targetService.list();
            setTargets(response.data || []);
        } catch (error) {
            console.error('Failed to fetch targets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTarget = async (e) => {
        e.preventDefault();
        try {
            await targetService.create(newTarget);
            setNewTarget({ name: '', base_url: '', auth_method: 'none', asset_value: 'MEDIUM' });
            setActiveTab('list');
            fetchTargets();
        } catch (error) {
            console.error('Failed to add target:', error);
        }
    };

    const handleDiscover = async (e) => {
        e.preventDefault();
        setDiscovering(true);
        try {
            const response = await targetService.discover(discoveryDomain);
            setDiscoveryResult(response.data);
            fetchTargets();
        } catch (error) {
            console.error('Discovery failed:', error);
        } finally {
            setDiscovering(false);
        }
    };

    const handleDeleteTarget = async (id) => {
        if (!window.confirm('Delete this target and all associated data?')) return;
        try {
            await targetService.delete(id);
            fetchTargets();
        } catch (error) {
            console.error('Failed to delete target:', error);
        }
    };

    const handleStartAIScan = async (targetId) => {
        setScanning(targetId);
        try {
            await pentesterService.startAIScan(targetId);
            onScanStarted?.();
        } catch (error) {
            console.error('Failed to start AI scan:', error);
        } finally {
            setScanning(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-cyber-light p-8 rounded-xl border border-gray-700 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
                <p className="text-gray-400 mt-4 animate-pulse">Loading Targets...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-cyan-400" />
                    <h3 className="text-xl font-bold text-white">Scan Targets</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab(activeTab === 'discover' ? 'list' : 'discover')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'discover' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-300 hover:text-white'}`}
                    >
                        <Globe className="h-4 w-4" />
                        Asset Discovery
                    </button>
                    <button
                        onClick={() => setActiveTab(activeTab === 'add' ? 'list' : 'add')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'add' ? 'bg-cyan-600 text-white' : 'bg-cyan-500 hover:bg-cyan-600 text-white'}`}
                    >
                        <Plus className="h-4 w-4" />
                        Add Target
                    </button>
                </div>
            </div>

            {/* Discovery View */}
            {activeTab === 'discover' && (
                <div className="bg-cyber-light p-6 rounded-xl border border-gray-700 animate-fade-in">
                    <h4 className="text-lg font-semibold text-white mb-2">Automated Asset Discovery</h4>
                    <p className="text-gray-400 text-sm mb-4">Enter a root domain to automatically find subdomains and add them as targets using Subfinder.</p>

                    <form onSubmit={handleDiscover} className="flex gap-2">
                        <input
                            type="text"
                            value={discoveryDomain}
                            onChange={(e) => setDiscoveryDomain(e.target.value)}
                            placeholder="example.com"
                            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                            required
                        />
                        <button
                            type="submit"
                            disabled={discovering}
                            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
                        >
                            {discovering ? (
                                <Loader2 className="h-5 w-5 animate-spin text-white" />
                            ) : (
                                <>
                                    <Search className="h-4 w-4" />
                                    <span>Start Discovery</span>
                                </>
                            )}
                        </button>
                    </form>

                    {discoveryResult && (
                        <div className="mt-6 bg-gray-900 rounded-lg p-4 border border-gray-800">
                            <div className="flex items-center gap-2 text-green-400 mb-2">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-semibold">Discovery Complete!</span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-300">
                                <p>Found <span className="text-white font-bold">{discoveryResult.total_found}</span> subdomains.</p>
                                <p>Created <span className="text-white font-bold">{discoveryResult.new_targets_created}</span> new targets.</p>
                            </div>
                            {discoveryResult.new_targets?.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs uppercase text-gray-500 font-bold mb-2">New Targets Added:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {discoveryResult.new_targets.map(t => (
                                            <span key={t} className="px-2 py-1 bg-gray-800 rounded text-xs text-cyan-400 border border-gray-700">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Add Target Form */}
            {activeTab === 'add' && (
                <form onSubmit={handleAddTarget} className="bg-cyber-light p-6 rounded-xl border border-gray-700 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Name</label>
                            <input
                                type="text"
                                value={newTarget.name}
                                onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                                placeholder="My Web App"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">URL</label>
                            <input
                                type="url"
                                value={newTarget.base_url}
                                onChange={(e) => setNewTarget({ ...newTarget, base_url: e.target.value })}
                                placeholder="https://example.com"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Auth Method</label>
                            <select
                                value={newTarget.auth_method}
                                onChange={(e) => setNewTarget({ ...newTarget, auth_method: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                            >
                                <option value="none">None</option>
                                <option value="basic">Basic Auth</option>
                                <option value="jwt">JWT Token</option>
                                <option value="cookie">Cookie Session</option>
                            </select>
                        </div>
                    </div>
                    {/* Asset Value / Business Context Field */}
                    <div className="mt-4">
                        <label className="block text-sm text-gray-400 mb-1">Business Criticality</label>
                        <div className="flex gap-4">
                            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(level => (
                                <label key={level} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="criticality"
                                        checked={newTarget.asset_value === level || (level === 'MEDIUM' && !newTarget.asset_value)}
                                        onChange={() => setNewTarget({ ...newTarget, asset_value: level })}
                                    />
                                    <span className={`text-sm font-medium ${level === 'CRITICAL' ? 'text-red-400' :
                                        level === 'HIGH' ? 'text-orange-400' :
                                            level === 'MEDIUM' ? 'text-yellow-400' : 'text-blue-400'
                                        }`}>{level}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab('list')}
                            className="px-4 py-2 text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                        >
                            Save Target
                        </button>
                    </div>
                </form>
            )}

            {/* Targets List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {targets.map((target) => (
                    <div
                        key={target.id}
                        className="bg-cyber-light p-5 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors relative overflow-hidden"
                    >
                        {/* Source Badge */}
                        {target.source === 'discovery' && (
                            <div className="absolute top-0 right-0 p-1 bg-purple-900/50 rounded-bl-lg border-b border-l border-purple-800">
                                <Globe className="h-3 w-3 text-purple-400" />
                            </div>
                        )}

                        <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-semibold text-white">{target.name}</h4>
                            <button
                                onClick={() => handleDeleteTarget(target.id)}
                                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <a
                            href={target.base_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 mb-3"
                        >
                            {target.base_url}
                            <ExternalLink className="h-3 w-3" />
                        </a>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                                {target.tech_stack ? Object.values(target.tech_stack).join(', ') : 'Unknown stack'}
                            </span>
                            <button
                                onClick={() => handleStartAIScan(target.id)}
                                disabled={scanning === target.id}
                                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white rounded-lg text-sm disabled:opacity-50 min-w-[100px] justify-center"
                            >
                                {scanning === target.id ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Shield className="h-4 w-4" />
                                        <span>AI Scan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {targets.length === 0 && activeTab === 'list' && (
                <div className="bg-cyber-light p-12 rounded-xl border border-gray-700 text-center">
                    <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No targets configured. Add a target or use Discovery to find assets.</p>
                </div>
            )}
        </div>
    );
};

export default TargetsManager;
