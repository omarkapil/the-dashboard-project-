import React, { useState, useEffect } from 'react';
import { Activity, Wifi, AlertTriangle, Clock, Server } from 'lucide-react';
import { networkService } from '../../services/api';

const ActivityFeed = ({ refresh }) => {
    const [activity, setActivity] = useState([]);
    const [newDevices, setNewDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                setLoading(true);
                const [activityRes, newDevicesRes] = await Promise.all([
                    networkService.getActivity(15),
                    networkService.getNewDevices()
                ]);
                setActivity(activityRes.data);
                setNewDevices(newDevicesRes.data);
            } catch (error) {
                console.error("Failed to fetch activity", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, [refresh]);

    const getEventIcon = (type) => {
        switch (type) {
            case 'new_device': return <Server className="h-4 w-4 text-cyan-400" />;
            case 'alert': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
            default: return <Activity className="h-4 w-4 text-gray-400" />;
        }
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            'CRITICAL': 'bg-red-500/20 text-red-400 border-red-500',
            'HIGH': 'bg-orange-500/20 text-orange-400 border-orange-500',
            'MEDIUM': 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
            'LOW': 'bg-blue-500/20 text-blue-400 border-blue-500'
        };
        return colors[priority] || colors['LOW'];
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div className="bg-cyber-light p-8 rounded-xl border border-gray-700 text-center animate-pulse">
                <Activity className="h-12 w-12 text-cyber-accent mx-auto mb-4" />
                <p className="text-gray-400">Loading activity...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Main Activity Feed */}
            <div className="lg:col-span-2 bg-cyber-light p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-cyber-accent animate-pulse" />
                        Live Activity Feed
                    </h3>
                    <span className="text-xs text-gray-500">Updates on scan completion</span>
                </div>

                {activity.length === 0 ? (
                    <div className="text-center py-8">
                        <Wifi className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-gray-400">No recent security events.</p>
                        <p className="text-gray-500 text-sm">Run a scan to start monitoring.</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                        {activity.map((event, index) => (
                            <div
                                key={event.id || index}
                                className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition"
                            >
                                <div className="mt-1">{getEventIcon(event.type)}</div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-white text-sm">{event.title}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getPriorityBadge(event.priority)}`}>
                                            {event.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">{event.description}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        {formatTime(event.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Devices Panel */}
            <div className="bg-cyber-light p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-bold text-white flex items-center mb-4">
                    <Server className="mr-2 h-5 w-5 text-cyan-400" />
                    New Devices (24h)
                </h3>

                {newDevices.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-gray-400 text-sm">No new devices in the last 24 hours.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {newDevices.map((device, index) => (
                            <div
                                key={device.id || index}
                                className="p-3 bg-cyan-900/20 border border-cyan-700/50 rounded-lg"
                            >
                                <div className="font-mono text-cyan-400 text-sm">{device.ip_address}</div>
                                <div className="text-xs text-gray-400">{device.hostname || 'Unknown hostname'}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Ports: {device.open_ports || 'None detected'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
