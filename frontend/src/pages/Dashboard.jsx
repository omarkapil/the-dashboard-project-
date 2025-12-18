import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import RiskScore from '../components/dashboard/RiskScore';
import ScanButton from '../components/dashboard/ScanButton';
import ScanHistory from '../components/dashboard/ScanHistory';
import NetworkTopology from '../components/dashboard/NetworkTopology';
import Reports from '../components/dashboard/Reports';
import ActionCenter from '../components/dashboard/ActionCenter';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import Tabs from '../components/ui/Tabs';
import { scanService } from '../services/api';
import { LayoutDashboard, History, Settings, Activity, Network, FileText } from 'lucide-react';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshKey, setRefreshKey] = useState(0);
    const [latestScan, setLatestScan] = useState(null);

    // Fetch latest scan for Health Score and Actions
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await scanService.getScans();
                // Assuming backend returns sorted list or we sort it based on ID/Date
                // And accessing the first one (most recent)
                if (response.data && response.data.length > 0) {
                    // We might need details for action items, so let's fetch details of the latest one
                    // IF the list doesn't include actions.
                    // For optimization, assume we fetch details for the latest one.
                    const recent = response.data.sort((a, b) => b.id - a.id)[0];

                    // Fetch Details to get Actions
                    const detailResponse = await scanService.getScanDetails(recent.id);
                    setLatestScan(detailResponse.data);
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
        { id: 'network', label: 'Network Topology', icon: <Network className="h-4 w-4" /> },
        { id: 'history', label: 'Scan History', icon: <History className="h-4 w-4" /> },
        { id: 'reports', label: 'Reports', icon: <FileText className="h-4 w-4" /> },
        { id: 'active', label: 'Live Monitoring', icon: <Activity className="h-4 w-4" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    ];

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Security Command Center</h2>
                <p className="text-gray-400 text-sm">Real-time threat monitoring and vulnerability assessment.</p>
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
                            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Active Assets</h3>
                            <p className="text-4xl font-bold text-white">{latestScan?.assets?.length || 0}</p>
                            <p className="text-gray-500 text-xs mt-1">Network Scanned: Today</p>
                        </div>
                    </div>

                    {/* Action Center - Spans 1 column but full height */}
                    <div className="md:row-span-2">
                        <ActionCenter actions={latestScan?.actions || []} />
                    </div>

                    {/* Move History nicely below */}
                    <div className="md:col-span-2">
                        <ScanHistory refresh={refreshKey} limit={5} />
                    </div>
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
                    <p className="text-gray-400">Configuration options for Nmap scripts and API keys.</p>
                </div>
            )}
        </Layout>
    );
};

export default Dashboard;
