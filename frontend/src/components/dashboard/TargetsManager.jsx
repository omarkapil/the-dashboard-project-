import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, ExternalLink, Shield, Loader2 } from 'lucide-react';
import { targetService, pentesterService } from '../../services/api';

/**
 * TargetsManager Component
 * Manage scanning targets for PentesterFlow
 */
const TargetsManager = ({ onScanStarted }) => {
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTarget, setNewTarget] = useState({ name: '', base_url: '', auth_method: 'none' });
    const [scanning, setScanning] = useState(null);

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
            setNewTarget({ name: '', base_url: '', auth_method: 'none' });
            setShowAddForm(false);
            fetchTargets();
        } catch (error) {
            console.error('Failed to add target:', error);
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
            <div className="bg-cyber-light p-8 rounded-xl border border-gray-700 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
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
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Target
                </button>
            </div>

            {/* Add Target Form */}
            {showAddForm && (
                <form onSubmit={handleAddTarget} className="bg-cyber-light p-6 rounded-xl border border-gray-700">
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
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
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
                        className="bg-cyber-light p-5 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors"
                    >
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
                                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                                {scanning === target.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Shield className="h-4 w-4" />
                                )}
                                AI Scan
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {targets.length === 0 && !showAddForm && (
                <div className="bg-cyber-light p-12 rounded-xl border border-gray-700 text-center">
                    <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No targets configured. Add a target to start scanning.</p>
                </div>
            )}
        </div>
    );
};

export default TargetsManager;
