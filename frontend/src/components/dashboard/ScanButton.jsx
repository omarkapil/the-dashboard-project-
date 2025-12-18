import React, { useState } from 'react';
import { scanService } from '../../services/api';
import { PlayCircle, Loader2 } from 'lucide-react';

const ScanButton = ({ onScanStarted }) => {
    const [loading, setLoading] = useState(false);
    const [target, setTarget] = useState('localhost'); // Default target

    const handleScan = async () => {
        setLoading(true);
        try {
            await scanService.startScan(target, 'quick');
            if (onScanStarted) onScanStarted();
        } catch (error) {
            console.error("Scan failed", error);
            alert("Failed to start scan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-cyber-light p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col gap-4">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider">Start New Scan</h3>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-cyber-accent flex-grow"
                    placeholder="Enter IP or Domain"
                />
                <button
                    onClick={handleScan}
                    disabled={loading}
                    className="bg-cyber-accent hover:bg-sky-500 text-gray-900 font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                    Scan
                </button>
            </div>
        </div>
    );
};

export default ScanButton;
