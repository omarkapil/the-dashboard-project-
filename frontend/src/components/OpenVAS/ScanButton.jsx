import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { openvasService } from '../../services/api';

const ScanButton = ({ onScanStarted }) => {
    const [loading, setLoading] = useState(false);
    const [targetIp, setTargetIp] = useState('');
    const [targetName, setTargetName] = useState('New Target');
    const [showInput, setShowInput] = useState(false);

    const handleScan = async () => {
        if (!targetIp) return;

        setLoading(true);
        try {
            const response = await openvasService.startQuickScan(targetIp, targetName);
            // Optionally handle task_id from response.data.task_id
            if (onScanStarted) {
                onScanStarted(response.data);
            }
            setShowInput(false);
            setTargetIp('');
        } catch (error) {
            console.error("Scan failed to launch", error);
            alert("Failed to start scan: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (showInput) {
        return (
            <div className="glass-card p-4 animate-fade-in border-cyber-accent">
                <div className="flex flex-col gap-2">
                    <input
                        type="text"
                        placeholder="Target IP (e.g. 192.168.1.5)"
                        className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                        value={targetIp}
                        onChange={(e) => setTargetIp(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleScan}
                            disabled={loading || !targetIp}
                            className="bg-cyber-accent hover:bg-cyber-accent/80 text-white px-3 py-2 rounded text-xs font-bold flex-1 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                            LAUNCH
                        </button>
                        <button
                            onClick={() => setShowInput(false)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs"
                        >
                            CANCEL
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowInput(true)}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyber-accent to-blue-600 p-6 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)]"
        >
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter">ONE-CLICK SCAN</h3>
                    <p className="text-blue-100 text-xs font-medium mt-1">Full Network Vulnerability Assessment</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors">
                    <Play className="h-6 w-6 text-white fill-white" />
                </div>
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-200%] group-hover:animate-shine"></div>
        </button>
    );
};

export default ScanButton;
