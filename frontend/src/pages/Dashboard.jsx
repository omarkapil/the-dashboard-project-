import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import RiskScore from '../components/dashboard/RiskScore';
import ScanButton from '../components/dashboard/ScanButton';
import ScanHistory from '../components/dashboard/ScanHistory';
import NetworkTopology from '../components/dashboard/NetworkTopology';
import Reports from '../components/dashboard/Reports';
import ActionCenter from '../components/dashboard/ActionCenter';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import TargetsManager from '../components/dashboard/TargetsManager';
import VulnerabilitiesPanel from '../components/dashboard/VulnerabilitiesPanel';
import AgentLogViewer from '../components/dashboard/AgentLogViewer';
import Tabs from '../components/ui/Tabs';
import { scanService } from '../services/api';
import { LayoutDashboard, History, Settings, Activity, Network, FileText, Target, Bug, Brain } from 'lucide-react';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshKey, setRefreshKey] = useState(0);
    const [latestScan, setLatestScan] = useState(null);
    const [selectedScanId, setSelectedScanId] = useState(null);

    // Fetch latest scan for Health Score and Actions
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await scanService.getScans();
                if (response.data && response.data.length > 0) {
                    const recent = response.data.sort((a, b) => new Date(b.started_at) - new Date(a.started_at))[0];
                    const detailResponse = await scanService.getScanDetails(recent.id);
                    setLatestScan(detailResponse.data);
                    setSelectedScanId(recent.id);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };
        fetchDashboardData();
    }, [refreshKey]);

    const handleScanStarted = () => {
        setTimeout(() => setRefreshKey(prev => prev + 1), 1000);
        setActiveTab('history');
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
        { id: 'targets', label: 'Targets', icon: <Target className="h-4 w-4" /> },
        { id: 'vulnerabilities', label: 'Vulnerabilities', icon: <Bug className="h-4 w-4" /> },
        { id: 'ai-console', label: 'AI Console', icon: <Brain className="h-4 w-4" /> },
        { id: 'network', label: 'Network', icon: <Network className="h-4 w-4" /> },
        { id: 'history', label: 'History', icon: <History className="h-4 w-4" /> },
        { id: 'reports', label: 'Reports', icon: <FileText className="h-4 w-4" /> },
        { id: 'active', label: 'Live', icon: <Activity className="h-4 w-4" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    ];

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">PentesterFlow Command Center</h2>
                <p className="text-gray-400 text-sm">AI-Driven Dynamic Application Security Testing Platform</p>
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                    {/* Health Score */}
                    <RiskScore score={latestScan?.risk_score || 0} />

                    {/* Scan Button & Quick Stats */}
                    <div className="flex flex-col gap-6">
                        <ScanButton onScanStarted={handleScanStarted} />
                        <div className="bg-cyber-light p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-center flex-grow">
                            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Vulnerabilities</h3>
                            <p className="text-4xl font-bold text-white">{latestScan?.vulnerabilities?.length || 0}</p>
                            <p className="text-gray-500 text-xs mt-1">From last scan</p>
                        </div>
                    </div>

                    {/* Action Center */}
                    <div className="md:row-span-2">
                        <ActionCenter actions={latestScan?.actions || []} />
                    </div>

                    {/* History */}
                    <div className="md:col-span-2">
                        <ScanHistory refresh={refreshKey} limit={5} />
                    </div>
                </div>
            )}

            {activeTab === 'targets' && (
                <TargetsManager onScanStarted={handleScanStarted} />
            )}

            {activeTab === 'vulnerabilities' && (
                <VulnerabilitiesPanel refresh={refreshKey} />
            )}

            {activeTab === 'ai-console' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Brain className="h-6 w-6 text-purple-400" />
                            <h3 className="text-xl font-bold text-white">AI Agent Activity</h3>
                        </div>
                        <select
                            value={selectedScanId || ''}
                            onChange={(e) => setSelectedScanId(e.target.value)}
                            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                        >
                            <option value="">Select a scan...</option>
                            {/* This would be populated with scans */}
                        </select>
                    </div>
                    <AgentLogViewer scanId={selectedScanId} />
                </div>
            )}

            {activeTab === 'network' && (
                <NetworkTopology refresh={refreshKey} />
            )}

            {activeTab === 'history' && (
                <div className="animate-fade-in">
                    <ScanHistory refresh={refreshKey} />
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="animate-fade-in">
                    <Reports refresh={refreshKey} />
                </div>
            )}

            {activeTab === 'active' && (
                <ActivityFeed refresh={refreshKey} />
            )}

            {activeTab === 'settings' && (
                <div className="bg-cyber-light p-12 rounded-xl border border-gray-700 text-center animate-fade-in">
                    <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">System Settings</h3>
                    <p className="text-gray-400">Configuration options for AI agents, Nuclei templates, and API keys.</p>
                </div>
            )}
        </Layout>
    );
};

export default Dashboard;

