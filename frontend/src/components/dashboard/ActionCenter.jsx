import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api';
import { AlertTriangle, CheckCircle, Clock, ArrowRight, Activity } from 'lucide-react';

const ActionCenter = () => {
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActions();
    }, []);

    const fetchActions = async () => {
        try {
            const { data } = await dashboardService.getActionItems();
            setActions(data);
        } catch (error) {
            console.error("Failed to fetch actions", error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'CRITICAL': return 'text-red-500 border-red-500/50 bg-red-500/10';
            case 'HIGH': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
            case 'MEDIUM': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
            default: return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500 animate-pulse">Loading Action Center...</div>;

    return (
        <div className="glass-card h-full flex flex-col">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyber-neon" />
                    Action Center
                </h3>
                <span className="text-xs text-gray-400">{actions.length} Pending Tasks</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {actions.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-xs">All systems nominal. No pending actions.</p>
                    </div>
                ) : (
                    actions.map(action => (
                        <div key={action.id} className={`p-3 rounded-lg border flex flex-col gap-2 relative group hover:bg-white/5 transition-colors ${getPriorityColor(action.priority)}`}>
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold uppercase border px-1.5 py-0.5 rounded opacity-80">
                                    {action.priority}
                                </span>
                                <span className="text-[10px] opacity-60 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(action.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h4 className="font-bold text-sm text-white/90">{action.title}</h4>
                            <p className="text-xs opacity-70 line-clamp-2">{action.description}</p>

                            <button className="mt-2 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Remediate <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActionCenter;
