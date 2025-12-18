import React, { useState, useEffect } from 'react';
import { Server, Shield, Activity, Wifi } from 'lucide-react';

const Taskbar = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed bottom-0 left-0 right-0 h-8 bg-cyber-dark border-t border-gray-700 flex items-center px-4 justify-between text-xs text-gray-400 z-50">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 hover:text-cyber-accent cursor-help">
                    <Shield className="h-3 w-3 text-green-500" />
                    <span>System Secure</span>
                </div>
                <div className="flex items-center gap-2 hover:text-cyber-accent cursor-help">
                    <Server className="h-3 w-3 text-blue-500" />
                    <span>Backend: Online</span>
                </div>
                <div className="flex items-center gap-2 hover:text-cyber-accent cursor-help">
                    <Wifi className="h-3 w-3 text-cyber-accent" />
                    <span>Network: Connected</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 animate-pulse text-cyber-accent" />
                    <span>Monitoring Active</span>
                </div>
                <div className="font-mono text-gray-500 border-l border-gray-700 pl-4">
                    {currentTime.toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};

export default Taskbar;
