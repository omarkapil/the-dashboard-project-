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
import { scanService, dashboardService } from '../services/api';

import OpenVasScanButton from '../components/OpenVAS/ScanButton';
import RiskChart from '../components/OpenVAS/RiskChart';
import Scheduler from '../components/OpenVAS/Scheduler';
import VulnerabilitiesList from '../components/OpenVAS/VulnerabilitiesList';
import { LayoutDashboard, History, Settings, Activity, Network, FileText, Target, Bug, Brain, Scan as ScanIcon } from 'lucide-react';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshKey, setRefreshKey] = useState(0);
    const [latestScan, setLatestScan] = useState(null);
    const [selectedScanId, setSelectedScanId] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    // Check for active scan on mount and periodically
    useEffect(() => {
        let pollInterval;

        const checkScanStatus = async () => {
            try {
                const response = await scanService.getScans();
                const runningScan = response.data?.find(s => s.status === 'RUNNING' || s.status === 'QUEUED');

                if (runningScan) {
                    setIsScanning(true);
                    // If we weren't already polling, start polling more frequently
                    if (!pollInterval) {
                        pollInterval = setInterval(checkScanStatus, 3000);
                    }
                } else {
                    // No running scan found. 
                    // If we were previously scanning, it means it just finished!
                    if (isScanning) {
                        setIsScanning(false);
                        clearInterval(pollInterval);
                        pollInterval = null;

                        // AUTO-REDIRECT to Network Tab
                        setRefreshKey(prev => prev + 1);
                        setActiveTab('network');
                    }
                }
            } catch (error) {
                console.error("Scan polling failed", error);
                clearInterval(pollInterval);
            }
        };

        checkScanStatus();
        // Trigger Risk Analysis to ensure dashboard is fresh
        dashboardService.refreshRiskScores().catch(console.error);

        const initialInterval = setInterval(checkScanStatus, 10000); // Check every 10s normally

        return () => {
            clearInterval(initialInterval);
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [isScanning, refreshKey]);

    const handleScanStarted = () => {
        setIsScanning(true);
        setTimeout(() => setRefreshKey(prev => prev + 1), 1000);
        setActiveTab('history');
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
        { id: 'scanner', label: 'Scanner', icon: <ScanIcon className="h-4 w-4" /> },
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
            {/* GLOBAL SCAN LOADER */}
            {isScanning && (
                <div className="fixed top-20 right-10 z-[100] animate-bounce">
                    <div className="bg-cyber-accent/20 border border-cyber-accent backdrop-blur-xl px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                        <div className="relative">
                            <Brain className="h-5 w-5 text-cyber-accent animate-pulse" />
                            <div className="absolute inset-0 bg-cyber-accent blur-md opacity-50 animate-ping"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Scanning Active</span>
                            <span className="text-[8px] text-cyber-accent font-mono animate-pulse">ORCHESTRATING NODES...</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-8 bg-cyber-accent rounded-full"></div>
                        <span className="text-[10px] font-black text-cyber-accent uppercase tracking-[0.4em]">found 404 // Core Node</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                        Command <span className="text-cyber-accent underline decoration-cyber-accent/30 underline-offset-8">Center</span>
                    </h1>
                    <p className="text-gray-500 mt-4 text-xs font-black tracking-widest uppercase opacity-60">AI-Driven Autonomous Security Orchestration</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 glass-card flex items-center gap-2 text-xs font-bold text-cyber-neon border-cyber-neon/20">
                        <div className="h-2 w-2 rounded-full bg-cyber-neon animate-pulse"></div>
                        SYSTEM ONLINE
                    </div>
                </div>
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                    {/* Health Score */}
                    <RiskScore score={latestScan?.risk_score || 0} />

                    {/* Scan Button & Quick Stats */}
                    <div className="flex flex-col gap-6">
                        <ScanButton onScanStarted={handleScanStarted} />
                        <div className="glass-card p-6 flex flex-col justify-center flex-grow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Bug className="h-12 w-12 text-cyber-neon" />
                            </div>
                            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-1 font-bold">Vulnerability Count</h3>
                            <p className="text-5xl font-black text-white">{latestScan?.vulnerabilities?.length || 0}</p>
                            <p className="text-cyber-neon/60 text-[10px] mt-2 font-mono tracking-tighter">TOTAL FINDINGS DETECTED</p>
                        </div>
                    </div>

                    {/* Action Center - Self-fetching now */}
                    <div className="md:row-span-2 h-full">
                        <ActionCenter />
                    </div>

                    {/* History */}
                    <div className="md:col-span-2">
                        <ScanHistory refresh={refreshKey} limit={5} />
                    </div>
                </div>
            )}

            {activeTab === 'scanner' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                    {/* Left Column: Controls */}
                    <div className="md:col-span-1 flex flex-col gap-6">
                        <OpenVasScanButton onScanStarted={(data) => {
                            setRefreshKey(prev => prev + 1);
                            // Optionally set latest scan immediately if data contains it
                        }} />
                        <div className="h-[300px]">
                            <Scheduler />
                        </div>
                    </div>

                    {/* Right Column: Risk Visualization */}
                    <div className="md:col-span-2 h-[450px]">
                        {/* We need some aggregated risk data here. simpler to just pass dummy for now or aggregations from latest scan */}
                        <RiskChart data={
                            latestScan?.vulnerabilities?.reduce((acc, v) => {
                                const sev = v.severity || 'LOW';
                                acc[sev] = (acc[sev] || 0) + 1;
                                return acc;
                            }, {})
                        } />
                    </div>

                    {/* Bottom Row: Results */}
                    <div className="md:col-span-3 mt-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Bug className="h-5 w-5 text-cyber-neon" />
                            Scan Results
                            {latestScan && <span className="text-xs text-gray-500 font-mono ml-2">ID: {latestScan.configuration?.openvas_task_id || 'LOCAL'}</span>}
                        </h3>
                        {/* Pass the OpenVAS Task ID if available, otherwise it shows empty or error */}
                        <VulnerabilitiesList taskId={latestScan?.configuration?.openvas_task_id} />
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

