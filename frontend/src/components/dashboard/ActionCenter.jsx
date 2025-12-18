import React from 'react';
import { AlertTriangle, CheckCircle, Shield, ArrowRight } from 'lucide-react';

const ActionCenter = ({ actions }) => {
    // Actions format: [{ title, description, priority, type }]

    // Priority Colors
    const getPriorityColor = (p) => {
        switch (p) {
            case 'CRITICAL': return 'bg-red-900/30 border-red-500 text-red-400';
            case 'HIGH': return 'bg-orange-900/30 border-orange-500 text-orange-400';
            case 'MEDIUM': return 'bg-yellow-900/30 border-yellow-500 text-yellow-400';
            default: return 'bg-blue-900/30 border-blue-500 text-blue-400';
        }
    };

    if (!actions || actions.length === 0) {
        return (
            <div className="bg-cyber-light p-6 rounded-xl shadow-lg border border-gray-700 h-full flex flex-col items-center justify-center text-center">
                <Shield className="h-12 w-12 text-green-500 mb-2" />
                <h3 className="text-xl font-bold text-white">All Clear!</h3>
                <p className="text-gray-400 text-sm">No immediate actions required. Your system is healthy.</p>
            </div>
        );
    }

    return (
        <div className="bg-cyber-light p-6 rounded-xl shadow-lg border border-gray-700 h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-cyber-accent" />
                    Action Center
                </h3>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {actions.length} Pending
                </span>
            </div>

            <div className="overflow-y-auto flex-grow pr-2 space-y-3 custom-scrollbar">
                {actions.map((action, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(action.priority)} transition hover:scale-[1.02] cursor-pointer`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-sm mb-1">{action.title}</h4>
                                <p className="text-xs opacity-80">{action.description}</p>
                            </div>
                            <span className="text-[10px] uppercase font-bold border px-1 rounded ml-2">
                                {action.priority}
                            </span>
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button className="text-xs bg-gray-800 hover:bg-gray-700 text-white py-1 px-3 rounded flex items-center transition">
                                Fix Issue <ArrowRight className="ml-1 h-3 w-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActionCenter;
